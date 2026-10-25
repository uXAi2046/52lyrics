import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { download, atomicJson } from './http.mjs';

// Collect public-domain lyric texts from reviewed Wikisource song-book editions.
// Each record pins the exact revision (oldid) that was parsed, stores per-stanza
// text, author/edition metadata and a pipeline status:
//   approved | needs-review | hold | duplicate | failed
// The run is resumable: every HTTP response is cached by URL in .cache/catalog.

const API = 'https://en.wikisource.org/w/api.php';
const WIKIDATA_API = 'https://www.wikidata.org/w/api.php';
const config = JSON.parse(await readFile(resolve('scripts/catalog/pd-books.json'), 'utf8'));
const outputPath = resolve('src/data/imported/pd-candidates.json');

const api = async (params) => {
  const { endpoint = API, ...rest } = params;
  const query = new URLSearchParams({ format: 'json', ...rest });
  const bytes = await download(`${endpoint}?${query}`, (raw) => JSON.parse(raw.toString('utf8')));
  const value = JSON.parse(bytes.toString('utf8'));
  if (value.error) throw new Error(`API error: ${value.error.info}`);
  return value;
};

// --- minimal HTML utilities (no external dependencies) ---

const decodeEntities = (text) => text
  .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&#95;/g, '_');

const stripTags = (html) => decodeEntities(html.replace(/<[^>]*>/g, ''));

/** Remove non-content elements (TemplateStyles, scripts, page furniture). */
const cleanBody = (html) => html
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
  .replace(/<span class="pagenum[^"]*"[^>]*>[\s\S]*?<\/span>/gi, '')
  .replace(/<div class="[^"]*ws-noexport[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
  .replace(/<link\b[^>]*>/gi, '');

/** Inner HTML of a balanced element starting at `start` (index of '<div'). */
const innerElement = (html, start) => {
  const open = /<div\b/g;
  open.lastIndex = start;
  let depth = 0;
  let cursor = start;
  const tag = /<div\b[^>]*>|<\/div\s*>/g;
  tag.lastIndex = start;
  let match;
  while ((match = tag.exec(html))) {
    if (match[0].startsWith('</')) depth -= 1;
    else depth += 1;
    cursor = match.index + match[0].length;
    if (depth === 0) return html.slice(start, cursor);
  }
  return html.slice(start);
};

const firstMatch = (html, pattern) => {
  const match = pattern.exec(html);
  return match ? match[1] : '';
};

// --- extraction ---

const NOISE_LINE = [
  /^\d+\s*[—–-]\s*[^a-z]+$/,            // '131—AULD LANG SYNE' printed song number
  /^(words?|music|written|composed|arranged|air|tune|melody|key[- ]?note)\b.*$/i,
  /^\(?(words|music)\b.*$/i,
];

const isChorusMarker = (lines) =>
  lines.length === 1 && /^(chorus|refrain|burden)\.?:?$/i.test(lines[0].trim());

const extractStanzas = (bodyHtml) => {
  const clean = cleanBody(bodyHtml);
  const stanzas = [];
  const stanzaPattern = /<div class="[^"]*ws-poem-stanza[^"]*"/g;
  let match;
  const pushGroups = (groups) => {
    for (const group of groups) if (group.length) stanzas.push(group);
  };
  const toLines = (fragment) => fragment
    .replace(/<span class="[^"]*ws-poem-break[^"]*"[^>]*>\s*<br\s*\/?>\s*<\/span>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .split('\n')
    .map((line) => stripTags(line.replace(/<span class="[^"]*ws-poem-indent[^"]*"[^>]*>&#8195;<\/span>/gi, ' ')).replace(/[\s\u200b\u200e\u200f]+/g, ' ').trim())
    .map((line) => (NOISE_LINE.some((noise) => noise.test(line)) ? '' : line));
  while ((match = stanzaPattern.exec(clean))) {
    const inner = innerElement(clean, match.index);
    // Verse groups may live in one printed block; blank lines separate stanzas.
    const groups = [];
    let current = [];
    for (const line of toLines(inner)) {
      if (!line) { if (current.length) { groups.push(current); current = []; } }
      else current.push(line);
    }
    if (current.length) groups.push(current);
    pushGroups(groups);
    stanzaPattern.lastIndex = match.index + inner.length;
  }
  if (stanzas.length) return stanzas;
  // Fallback: paragraph-based splitting for pages without ws-poem markup.
  const text = clean.replace(/<br\s*\/?>/gi, '\n');
  return text
    .split(/<\/p>/)
    .map((paragraph) => stripTags(paragraph).split('\n').map((line) => line.replace(/[\s\u200b\u200e\u200f]+/g, ' ').trim()).filter(Boolean).filter((line) => !NOISE_LINE.some((noise) => noise.test(line))))
    .filter((lines) => lines.length >= 2);
};

const buildSections = (rawStanzas) => {
  const sections = [];
  let pendingChorus = false;
  let verse = 0;
  for (const lines of rawStanzas) {
    if (isChorusMarker(lines)) { pendingChorus = true; continue; }
    const type = pendingChorus ? 'chorus' : 'verse';
    const number = type === 'verse' ? ++verse : undefined;
    sections.push({ type, ...(number ? { number } : {}), content: lines });
    pendingChorus = false;
  }
  return sections;
};

const parseAuthor = (authorHtml) => {
  const anchor = /<a\b[^>]*>([\s\S]*?)<\/a>/is.exec(authorHtml || '');
  const raw = anchor ? anchor[1] : (authorHtml || '').split('<span')[0];
  const name = stripTags(raw).replace(/^[>\s]+/, '').replace(/\s*\(\d{4}\s*[—–-]\s*\d{4}\)/g, '').replace(/\s+/g, ' ').trim();
  const title = firstMatch(authorHtml || '', /title="([^"]+)"/);
  const lifespan = /\((\d{4})\s*[—–-]\s*(\d{4})\)/.exec(decodeEntities(title));
  return {
    name: name || 'Traditional',
    birthYear: lifespan ? Number(lifespan[1]) : null,
    deathYear: lifespan ? Number(lifespan[2]) : null,
  };
};

const VALIDATION = {
  minStanzas: 2,
  minLines: 8,
  maxLineLength: 160,
};

const JUNK_LINE = /\{\{|\}\}|\[\[|\]\]|<\/?[a-z][a-z0-9-]*\b|^Return to the top|This page was last edited|Lyrics unavailable|Proofread/i;

const validateStanzas = (sections) => {
  const problems = [];
  const notes = [];
  const total = sections.reduce((sum, section) => sum + section.content.length, 0);
  if (sections.length < VALIDATION.minStanzas) {
    // Some source pages print the whole song as one block without verse breaks.
    if (total >= VALIDATION.minLines) notes.push('single-stanza source text');
    else problems.push(`too short to confirm completeness (${sections.length} stanza(s), ${total} lines)`);
  }
  if (total < VALIDATION.minLines) problems.push(`too few lines (${total})`);
  for (const [si, section] of sections.entries()) {
    if (!section.content.length) problems.push(`empty stanza ${si + 1}`);
    for (const line of section.content) {
      if (line.length > VALIDATION.maxLineLength) problems.push(`overlong line ${si + 1}`);
      if (JUNK_LINE.test(line)) problems.push(`junk line ${si + 1}: ${line.slice(0, 60)}`);
    }
  }
  return { problems, notes };
};

// --- rights decision ---

const TRADITIONAL = new Set(['', 'traditional', 'anonymous', 'unknown', 'unidentified', 'unattributed']);

const cachePath = resolve('scripts/catalog/pd-author-years.json');
const authorCache = await readFile(cachePath, 'utf8').then(JSON.parse).catch(() => ({}));
const persistCache = async () => writeFile(cachePath, JSON.stringify(authorCache, null, 2));

/** Resolve an author's death year through Wikidata when the source page omits dates. */
const resolveDeathYear = async (name) => {
  if (TRADITIONAL.has(name.toLowerCase().trim())) return { deathYear: null, source: 'traditional' };
  if (authorCache[name]) return authorCache[name];
  const entry = { deathYear: null, source: 'unresolved' };
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const search = await api({ endpoint: WIKIDATA_API, action: 'wbsearchentities', search: name, language: 'en', type: 'item', limit: '3' });
      const top = search.search?.[0];
      if (top && (search.search.length === 1 || (top.match?.language === 'en' && top.description && /person|songwriter|poet|composer|writer/i.test(top.description)))) {
        const entity = await api({ endpoint: WIKIDATA_API, action: 'wbgetentities', ids: top.id, props: 'claims|labels', languages: 'en' });
        const claims = entity.entities?.[top.id]?.claims?.P570;
        const year = claims?.[0]?.mainsnak?.datavalue?.value?.time;
        if (year) {
          entry.deathYear = Number(year.slice(1, 5));
          entry.source = `wikidata-${top.id}`;
        }
      }
      break;
    } catch (error) {
      // Transient failures must not be cached as resolved facts.
      entry.source = `error: ${String(error.message || error).slice(0, 80)}`;
      if (attempt < 3) await new Promise((done) => setTimeout(done, attempt * 2000));
    }
  }
  if (!entry.source.startsWith('error:')) {
    authorCache[name] = entry;
    await persistCache();
  }
  return entry;
};

const decideRights = async (book, author) => {
  if (book.rights === 'unconditional') return { status: 'approved' };
  if (TRADITIONAL.has(author.name.toLowerCase().trim())) return { status: 'approved', authorName: 'Traditional' };
  if (author.deathYear) {
    if (author.deathYear <= 1956) return { status: 'approved' };
    return { status: 'hold', reason: `author died ${author.deathYear}; life+70 terms may still apply` };
  }
  const resolved = await resolveDeathYear(author.name);
  if (resolved.deathYear) {
    if (resolved.deathYear <= 1956) return { status: 'approved' };
    return { status: 'hold', reason: `author died ${resolved.deathYear}; life+70 terms may still apply` };
  }
  return { status: 'needs-review', reason: `author death year unknown (${resolved.source})` };
};

// --- main ---

const slugify = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const normalizeKey = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const previous = await readFile(outputPath, 'utf8').then(JSON.parse).catch(() => null);
const seenWorks = new Set((previous?.records ?? []).filter((record) => record.status === 'approved').map((record) => record.workKey));
if (previous) console.log(`resuming: ${previous.records.length} existing records, ${seenWorks.size} approved works`);

// Approved, held and duplicate decisions are terminal: every later run would
// demote them to "duplicate" because the catalog now contains the work.
// They are carried over verbatim, keyed by source page, and only pages whose
// earlier records are all needs-review are collected again.
const TERMINAL_STATUSES = new Set(['approved', 'hold', 'duplicate']);
const pageKeyOf = (record) => `${record.bookId}::${record.pageTitle}`;
const headByPage = new Map();
for (const record of previous?.records ?? []) {
  const pageKey = pageKeyOf(record);
  const existing = headByPage.get(pageKey);
  headByPage.set(pageKey, existing ? [...existing, record] : [record]);
}
const preservedByPage = new Map();
const recollectPages = new Set();
for (const [pageKey, pageRecords] of headByPage) {
  const terminal = pageRecords.find((record) => TERMINAL_STATUSES.has(record.status));
  if (terminal) preservedByPage.set(pageKey, terminal);
  else recollectPages.add(pageKey);
}

const records = [...preservedByPage.values()];
const failures = [];
const bookSummaries = [];

const { ALBUMS } = await import('../../src/data/catalog.ts');
const { normalizeCatalogText } = await import('../../src/data/normalize.ts');
const existingTitles = new Set();
for (const album of ALBUMS) for (const track of album.tracks) existingTitles.add(`${track.artistName}::${normalizeCatalogText(track.title)}`);

for (const book of config.books) {
  const pages = [];
  let continuation = undefined;
  do {
    const response = await api({ action: 'query', list: 'allpages', apprefix: book.prefix, apnamespace: '0', aplimit: 'max', ...(continuation ? { apcontinue: continuation } : {}) });
    pages.push(...response.query.allpages.map((page) => page.title));
    continuation = response.continue?.apcontinue;
  } while (continuation);
  const limited = book.maxSubpages ? pages.slice(0, book.maxSubpages) : pages;
  const pageLimit = Number(process.env.PD_LIMIT || 0);
  const targets = pageLimit ? limited.slice(0, pageLimit) : limited;
  console.log(`[${book.id}] ${targets.length} subpages`);

  const bookRecord = { ...book, collected: 0, approved: 0, holds: 0, needsReview: 0, duplicates: 0, failed: 0 };

  // Resolve current revision ids in batches; each parse is then pinned to that oldid.
  const revids = new Map();
  for (let start = 0; start < targets.length; start += 40) {
    const chunk = targets.slice(start, start + 40);
    const response = await api({ action: 'query', prop: 'revisions', titles: chunk.join('|'), rvprop: 'ids' });
    for (const page of Object.values(response.query.pages)) {
      if (page.revisions?.[0]?.revid) revids.set(page.title, page.revisions[0].revid);
    }
  }

  for (const [index, pageTitle] of targets.entries()) {
    const sectionTitle = pageTitle.slice(book.prefix.length).replace(/^"+|"+$/g, '').trim();
    try {
      const revid = revids.get(pageTitle);
      if (!revid) throw new Error('no revision found');

      const carriedPage = `${book.id}::${pageTitle}`;
      if (preservedByPage.has(carriedPage)) {
        bookRecord.collected += 1;
        const status = preservedByPage.get(carriedPage).status;
        if (status === 'approved') bookRecord.approved += 1;
        else if (status === 'hold') bookRecord.holds += 1;
        else if (status === 'duplicate') bookRecord.duplicates += 1;
        continue;
      }

      const parsed = await api({ action: 'parse', oldid: String(revid), prop: 'text' });
      const html = parsed.parse.text['*'];

      const authorHtml = firstMatch(html, /id="ws-author"([\s\S]{0,600}?)<\/span>/) || firstMatch(html, /id="ws-author"([\s\S]{0,600}?)<\/div>/);
      const author = parseAuthor(authorHtml);
      const yearMatch = /(\d{4})/.exec(stripTags(firstMatch(html, /id="ws-title"([\s\S]{0,800}?)<\/span>/)) || '');
      const bodyStart = html.indexOf('prp-pages-output');
      const bodyHtml = bodyStart >= 0 ? innerElement(html, html.indexOf('<div', html.indexOf('prp-pages-output') - 20)) : html.slice(html.indexOf('mw-parser-output'));

      const rawStanzas = extractStanzas(bodyHtml);
      const sections = buildSections(rawStanzas);
      const { problems, notes: validationNotes } = validateStanzas(sections);
      const quality = [...bodyHtml.matchAll(/data-page-quality="(\d)"/g)].map((match) => Number(match[1]));
      const minQuality = quality.length ? Math.min(...quality) : null;
      if (minQuality !== null && minQuality < 3) problems.push(`scan quality ${minQuality} below proofread threshold`);

      const authorDecision = await decideRights(book, author);
      const authorName = authorDecision.authorName ?? author.name;
      const workKey = `${normalizeKey(authorName)}::${normalizeKey(sectionTitle)}`;

      let status = problems.length ? 'needs-review' : authorDecision.status;
      let reason = problems.length ? problems.join('; ') : authorDecision.reason;
      if (status === 'approved' || status === 'hold') {
        if (existingTitles.has(`${sectionTitle}::`) || [...existingTitles].some((key) => key.endsWith(`::${normalizeCatalogText(sectionTitle)}`))) {
          // exact catalog title match needs author comparison; handled below by workKey
        }
        if (seenWorks.has(workKey)) { status = 'duplicate'; reason = 'already collected in this run'; }
      }
      if (status === 'approved') {
        if ([...existingTitles].some((key) => key.endsWith(`::${normalizeCatalogText(sectionTitle)}`))) {
          status = 'duplicate';
          reason = 'title already present in catalog';
        } else {
          seenWorks.add(workKey);
        }
      }

      records.push({
        bookId: book.id,
        pageTitle,
        workKey,
        workSlug: `${slugify(authorName)}-${slugify(sectionTitle)}`.slice(0, 120),
        title: sectionTitle,
        author: authorName,
        authorBirthYear: author.birthYear,
        authorDeathYear: author.deathYear,
        year: book.year,
        revisionId: revid,
        revisionUrl: `https://en.wikisource.org/w/index.php?title=${encodeURIComponent(pageTitle.replace(/ /g, '_')).replace(/'/g, '%27')}&oldid=${revid}`,
        pageQuality: minQuality,
        stanzas: sections,
        notes: validationNotes,
        status,
        reason: reason ?? null,
      });
      bookRecord.collected += 1;
      if (status === 'approved') bookRecord.approved += 1;
      else if (status === 'hold') bookRecord.holds += 1;
      else if (status === 'needs-review') bookRecord.needsReview += 1;
      else if (status === 'duplicate') bookRecord.duplicates += 1;
      if ((index + 1) % 25 === 0) console.log(`[${book.id}] ${index + 1}/${targets.length} (approved ${bookRecord.approved}, review ${bookRecord.needsReview}, hold ${bookRecord.holds})`);
    } catch (error) {
      failures.push({ bookId: book.id, pageTitle, error: String(error.message || error).slice(0, 200), stack: String(error.stack || '').split('\n').slice(0, 6).join(' | ') });
      bookRecord.failed += 1;
    }
  }
  bookSummaries.push(bookRecord);
  console.log(`[${book.id}] done: ${JSON.stringify({ collected: bookRecord.collected, approved: bookRecord.approved, needsReview: bookRecord.needsReview, holds: bookRecord.holds, duplicates: bookRecord.duplicates, failed: bookRecord.failed })}`);
}

const output = {
  schemaVersion: 1,
  method: 'wikisource-api',
  retrievedAt: new Date().toISOString(),
  books: bookSummaries.map(({ collected, approved, holds, needsReview, duplicates, failed, ...rest }) => ({ ...rest, counts: { collected, approved, needsReview, holds, duplicates, failed } })),
  records,
  failures,
};

await mkdir(resolve('src/data/imported'), { recursive: true });
await atomicJson(outputPath, output);

const totals = { collected: records.length, approved: 0, needsReview: 0, holds: 0, duplicates: 0, failed: 0 };
for (const record of records) {
  if (record.status === 'needs-review') totals.needsReview += 1;
  else if (record.status === 'approved') totals.approved += 1;
  else if (record.status === 'hold') totals.holds += 1;
  else if (record.status === 'duplicate') totals.duplicates += 1;
  else totals.failed += 1;
}
console.log('TOTALS', JSON.stringify(totals));
console.log(`wrote ${outputPath}`);

import { writeFile, mkdir } from 'node:fs/promises';
import { SONGS, FULL_LYRIC_SONGS, FULL_LYRIC_WORKS, ARTISTS, ALBUMS } from '../../src/data/catalog.ts';
import { normalizeCatalogText } from '../../src/data/normalize.ts';

// Full-lyric corpus audit. Distinguishes song pages from distinct works,
// checks text/provenance completeness, duplicates and rights classification.
// Network checks run only with --network.

const network = process.argv.includes('--network');

const JUNK_PATTERNS = [
  /Return to the top/i, /This page was last edited/i, /Lyrics unavailable/i,
  /\[\[|\]\]|<[^>]+>/, /\{\{|\}\}/,
];

const checkText = (song) => {
  const problems = [];
  const notes = [];
  if (!song.lyrics || !song.lyrics.trim()) problems.push('missing text');
  const stanzas = song.sections.map((section) => section.content.filter((line) => line.trim()));
  const totalLines = stanzas.reduce((sum, stanza) => sum + stanza.length, 0);
  if (stanzas.length < 2) notes.push(`single-stanza work: ${stanzas.length} stanza(s)`);
  if (totalLines < 8) problems.push(`few lines: ${totalLines}`);
  for (const [si, stanza] of stanzas.entries()) {
    if (!stanza.length) { problems.push(`empty stanza ${si + 1}`); continue; }
    for (const line of stanza) {
      if (JUNK_PATTERNS.some((pattern) => pattern.test(line))) problems.push(`junk line in stanza ${si + 1}: ${line.slice(0, 60)}`);
      if (line.length > 160) problems.push(`overlong line in stanza ${si + 1}`);
    }
  }
  return { problems, notes, stanzas: stanzas.length, lines: totalLines };
};

const checkProvenance = (song) => {
  const problems = [];
  // Original site works are their own source; provenance applies to imported texts.
  if (song.rights === 'original' && !song.source) return problems;
  const source = song.source;
  if (!source) { problems.push('missing source'); return problems; }
  if (!source.provider) problems.push('missing source.provider');
  if (!source.url) problems.push('missing source.url');
  if (!source.retrievedAt) problems.push('missing source.retrievedAt');
  if (!source.license) problems.push('missing source.license');
  if (song.rights === 'public-domain' && !source.revisionUrl) problems.push('public-domain without revisionUrl');
  if (song.rights === 'public-domain' && !source.evidenceUrl) problems.push('public-domain without evidenceUrl');
  if (song.rights === 'public-domain' && source.license !== 'Public domain') problems.push(`pd license label: ${source.license}`);
  if (!song.writers.length) problems.push('missing writers');
  return problems;
};

// Page/author duplicate groups (a work printed on more than one page).
const byKey = new Map();
for (const song of SONGS) {
  const key = `${song.artistId}::${normalizeCatalogText(song.title)}`;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(song);
}

const fullBySource = new Map();
const fullByRights = new Map();
for (const song of FULL_LYRIC_SONGS) {
  const provider = song.source?.provider ?? 'Original';
  fullBySource.set(provider, (fullBySource.get(provider) ?? 0) + 1);
  fullByRights.set(song.rights, (fullByRights.get(song.rights) ?? 0) + 1);
}

const worksReport = [];
for (const [key, pages] of byKey) {
  const fullPages = pages.filter((song) => song.lyricsAvailability === 'full');
  if (!fullPages.length) continue;
  const primary = fullPages[0];
  const text = checkText(primary);
  const provenance = checkProvenance(primary);
  worksReport.push({
    key,
    title: primary.title,
    artist: primary.artistName,
    provider: primary.source?.provider ?? 'Original',
    rights: primary.rights,
    fullPages: fullPages.length,
    totalSongPages: pages.length,
    stanzas: text.stanzas,
    lines: text.lines,
    textProblems: text.problems,
    textNotes: text.notes,
    provenanceProblems: provenance,
    pageSlugs: pages.map((song) => song.slug),
  });
}

// Distinct-works consistency: FULL_LYRIC_WORKS must match the dedupe above.
const auditWorks = new Set(worksReport.map((work) => work.key));
const catalogWorks = new Set(FULL_LYRIC_WORKS.map((song) => `${song.artistId}::${normalizeCatalogText(song.title)}`));
const consistency = {
  auditDistinctWorks: auditWorks.size,
  catalogDistinctWorks: catalogWorks.size,
  match: auditWorks.size === catalogWorks.size && [...auditWorks].every((key) => catalogWorks.has(key)),
};

const brokenText = worksReport.filter((work) => work.textProblems.length);
const brokenProvenance = worksReport.filter((work) => work.provenanceProblems.length);
const duplicatedWorks = worksReport.filter((work) => work.fullPages > 1);

const urlChecks = [];
if (network) {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const targets = new Map();
  for (const work of worksReport) {
    const song = FULL_LYRIC_SONGS.find((item) => `${item.artistId}::${normalizeCatalogText(item.title)}` === work.key);
    if (song?.source?.url && !targets.has(song.source.url)) targets.set(song.source.url, work.key);
  }
  for (const [url, key] of targets) {
    try {
      const { stdout } = await run('curl', ['--fail', '--silent', '--output', '/dev/null', '--write-out', '%{http_code}', '--max-time', '30', url], { timeout: 40_000 });
      urlChecks.push({ key, url, status: Number(stdout), ok: stdout === '200' });
    } catch (error) {
      urlChecks.push({ key, url, status: 0, ok: false, error: String(error.message || error).slice(0, 120) });
    }
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  artists: ARTISTS.length,
  albums: ALBUMS.length,
  songPages: SONGS.length,
  metadataOnlyPages: SONGS.filter((song) => song.lyricsAvailability === 'metadata-only').length,
  fullLyricPages: FULL_LYRIC_SONGS.length,
  fullLyricWorks: FULL_LYRIC_WORKS.length,
  auditDistinctWorks: worksReport.length,
  pagesPerWorkRatio: Number((FULL_LYRIC_SONGS.length / FULL_LYRIC_WORKS.length).toFixed(2)),
  fullBySource: Object.fromEntries([...fullBySource.entries()].sort()),
  fullByRights: Object.fromEntries([...fullByRights.entries()].sort()),
  counts: {
    worksWithTextProblems: brokenText.length,
    worksWithSingleStanza: worksReport.filter((work) => work.textNotes?.length).length,
    worksWithProvenanceProblems: brokenProvenance.length,
    worksWithMultipleFullPages: duplicatedWorks.length,
  },
  consistency,
  commercialLicenses: worksReport.filter((work) => work.rights === 'licensed').length,
  urlChecks,
  brokenText,
  brokenProvenance,
  duplicatedWorks,
  works: worksReport,
};

await mkdir('docs/audit', { recursive: true });
const stamp = summary.generatedAt.slice(0, 10);
await writeFile(`docs/audit/full-lyrics-${stamp}.json`, JSON.stringify(summary, null, 2));

console.log(JSON.stringify({
  songPages: summary.songPages,
  metadataOnlyPages: summary.metadataOnlyPages,
  fullLyricPages: summary.fullLyricPages,
  fullLyricWorks: summary.fullLyricWorks,
  pagesPerWorkRatio: summary.pagesPerWorkRatio,
  fullBySource: summary.fullBySource,
  fullByRights: summary.fullByRights,
  counts: summary.counts,
  consistency: summary.consistency,
  urlChecks: network ? {
    checked: urlChecks.length,
    failed: urlChecks.filter((check) => !check.ok),
  } : 'skipped (run with --network)',
  reportPath: `docs/audit/full-lyrics-${stamp}.json`,
}, null, 2));

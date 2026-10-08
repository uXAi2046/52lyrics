import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir, sha256 } from './http.mjs';
import { validateScoreReading } from './validate-score-reading.mjs';

// Re-extract from the pinned document bytes; never trust an edited intermediate text file.
execFileSync(process.env.CATALOG_PYTHON || 'python3', ['scripts/catalog/extract-lyrics.py'], { stdio: 'inherit' });
const manifest = JSON.parse(await readFile('scripts/catalog/lehrer-review-manifest.json', 'utf8'));
const extracted = JSON.parse(await readFile(resolve(cacheDir, 'lehrer/extracted.json'), 'utf8'));
const sources = JSON.parse(await readFile('src/data/imported/lehrer-sources.json', 'utf8'));
const holds = JSON.parse(await readFile('src/data/imported/lehrer-rights-holds.json', 'utf8'));
const output = [];
for (const review of manifest) {
  assert(!holds.some((hold) => hold.sourceSlug === review.sourceSlug), `Unresolved lyric rights: ${review.title}`);
  assert(!review.catalogPlacement || ['author-songbook', 'recorded-release'].includes(review.catalogPlacement), `Unknown catalog placement: ${review.title}`);
  const source = sources.songs.find((song) => song.slug === review.sourceSlug);
  const pdf = source?.pdfs.find((pdf) => pdf.sha256 === review.pdfSha256);
  assert(pdf, `Missing pinned source: ${review.title}`);
  const bytes = await readFile(resolve(cacheDir, 'lehrer', pdf.filename));
  assert.equal(sha256(bytes), review.pdfSha256, `Source document changed: ${review.title}`);
  const extraction = extracted.find((record) => record.filename === pdf.filename);
  if (pdf.kind === 'score') assert(review.scoreReading, `Score requires a reading-order review: ${review.title}`);
  let lines = review.pages.flatMap(({ page, start, end, bbox }) => {
    const extractedPage = extraction.pages[page];
    const region = bbox ? extractedPage.regions.find((region) => JSON.stringify(region.bbox) === JSON.stringify(bbox)) : extractedPage;
    assert(region && start >= 0 && end > start && end <= region.lines.length, `Invalid reviewed range: ${review.title}`);
    return region.lines.slice(start, end).map((line) => line.text);
  });
  if (review.manualLines) {
    assert.equal(review.pages.length, 0, `Do not mix extracted and manual text: ${review.title}`);
    assert.deepEqual(review.manualPages, extraction.pages.map((_, index) => index), `Manual review must cover the whole document: ${review.title}`);
    if (review.scoreReading) validateScoreReading(review, extraction, pdf.kind);
    else assert(extraction.pages.every((page) => page.lines.length === 0), `Manual transcription is reserved for image-only documents: ${review.title}`);
    assert(review.manualLines.every((line) => typeof line === 'string' && line.trim()), `Empty manual line: ${review.title}`);
    lines = [...review.manualLines];
  }
  for (const [before, correction] of Object.entries(review.corrections)) {
    const after = typeof correction === 'string' ? correction : correction.text;
    const occurrences = typeof correction === 'string' ? 1 : correction.occurrences;
    assert.equal(lines.filter((line) => line === before).length, occurrences, `Expected correction differs: ${review.title}: ${before}`);
    lines = lines.map((line) => line === before ? after : line);
  }
  assert.equal(lines.length, review.stanzaSizes.reduce((sum, size) => sum + size, 0), `Incomplete reviewed text: ${review.title}`);
  let offset = 0;
  const stanzas = review.stanzaSizes.map((size) => { const stanza = lines.slice(offset, offset + size); offset += size; return stanza; });
  if (review.sectionLabels) assert.equal(review.sectionLabels.length, stanzas.length, `Incorrect section labels: ${review.title}`);
  if (review.sectionLanguages) {
    assert.equal(review.sectionLanguages.length, stanzas.length, `Incorrect section languages: ${review.title}`);
    assert(review.sectionLanguages.every((language) => ['en', 'es'].includes(language)), `Unsupported section language: ${review.title}`);
    assert(review.edition, `Multilingual text requires an explicit edition: ${review.title}`);
  }
  if (review.underlyingWork) {
    const work = review.underlyingWork;
    assert(work.title && work.writers?.length && work.writers.every((writer) => typeof writer === 'string' && writer.trim()), `Missing original author: ${review.title}`);
    assert(work.evidenceUrls?.length && work.evidenceUrls.every((url) => new URL(url).protocol === 'https:'), `Missing original-work evidence: ${review.title}`);
    assert(work.rightsNote?.length > 40 && review.edition, `Missing adaptation rights or edition: ${review.title}`);
  }
  output.push({ title: review.title, sourceSlug: review.sourceSlug, pdfSha256: review.pdfSha256, catalogPlacement: review.catalogPlacement ?? 'recorded-release', stanzas, sectionLabels: review.sectionLabels ?? [], sectionLanguages: review.sectionLanguages ?? [], edition: review.edition ?? 'Author-published lyric sheet · original English words', underlyingWork: review.underlyingWork ?? null, description: review.description, about: review.about, themes: review.themes, moods: review.moods, note: review.note });
}
await atomicJson('src/data/imported/lehrer-reviewed.json', output);
console.log(`Published ${output.length} visually reviewed works (${output.reduce((sum, work) => sum + work.stanzas.flat().length, 0)} lyric lines).`);

import assert from 'node:assert/strict';

/** Score OCR is not prose: require an explicit, complete reading-order review. */
export function validateScoreReading(review, extraction, documentKind) {
  assert.equal(documentKind, 'score', 'Score review requires a score source');
  assert(review.manualLines?.length && review.pages.length === 0, 'Score lyrics must be manually reviewed');
  const allPages = extraction.pages.map((_, index) => index);
  assert.deepEqual(review.manualPages, allPages, 'Score review must cover every page');
  const reading = review.scoreReading;
  assert(reading?.repeatNote?.length > 40 && review.edition, 'Score review requires repeat and edition notes');
  assert(reading.segments?.length === review.stanzaSizes.length, 'Score review must map every stanza');
  const coveredPages = new Set();
  let offset = 0;
  for (const [index, segment] of reading.segments.entries()) {
    assert(segment.pages.length > 0 && segment.pages.every((page) => Number.isInteger(page) && allPages.includes(page)), 'Invalid score page reference');
    segment.pages.forEach((page) => coveredPages.add(page));
    assert(['upper', 'lower', 'single'].includes(segment.lyricRow), 'Missing score lyric row');
    assert(segment.note?.length > 15, 'Missing score passage explanation');
    assert.deepEqual(segment.lineRange, [offset, offset + review.stanzaSizes[index]], 'Score reading order has a gap or overlap');
    offset += review.stanzaSizes[index];
  }
  assert.deepEqual([...coveredPages].sort((a, b) => a - b), allPages, 'Score passages do not cover the document');
  assert.equal(offset, review.manualLines.length, 'Score transcription has unaccounted lines');
}

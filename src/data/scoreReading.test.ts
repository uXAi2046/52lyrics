import { describe, expect, it } from 'vitest';
import { validateScoreReading } from '../../scripts/catalog/validate-score-reading.mjs';
import manifest from '../../scripts/catalog/lehrer-review-manifest.json';
import { ALBUMS, FULL_LYRIC_WORKS, SONGS } from './catalog';
import sources from './imported/lehrer-sources.json';

const review = manifest.find((item) => item.sourceSlug === 'my-home-town')!;
const extraction = { pages: Array.from({ length: 4 }, () => ({ lines: [{ text: 'unreliable score OCR' }] })) };

describe('reviewed score transcription', () => {
  it('requires an exhaustive reading order instead of accepting score OCR', () => {
    expect(() => validateScoreReading(review, extraction, 'score')).not.toThrow();
    expect(() => validateScoreReading(review, extraction, 'lyric-sheet')).toThrow('score source');
    expect(() => validateScoreReading({ ...review, manualPages: [0] }, extraction, 'score')).toThrow('every page');
    expect(() => validateScoreReading({ ...review, scoreReading: undefined }, extraction, 'score')).toThrow('repeat and edition');
    const missingLine = structuredClone(review);
    missingLine.scoreReading!.segments[3].lineRange = [17, 21];
    expect(() => validateScoreReading(missingLine, extraction, 'score')).toThrow('gap or overlap');
    const missingPage = structuredClone(review);
    missingPage.scoreReading!.segments.forEach((segment) => { segment.pages = [0]; });
    expect(() => validateScoreReading(missingPage, extraction, 'score')).toThrow('cover the document');
  });

  it('publishes both verses and the coda to every existing album appearance', () => {
    const appearances = SONGS.filter((song) => song.artistName === 'Tom Lehrer' && song.title === 'My Home Town');
    expect(appearances).toHaveLength(5);
    expect(FULL_LYRIC_WORKS.filter((song) => song.artistName === 'Tom Lehrer' && song.title === 'My Home Town')).toHaveLength(1);
    for (const song of appearances) {
      expect(song.lyricsAvailability).toBe('full');
      expect(song.sections.map((section) => section.content.length)).toEqual([5, 5, 6, 5, 5, 5, 5]);
      expect(song.sections.map((section) => section.content[0])).toEqual([
        'I really have a yen', 'No fellow could ignore', 'I remember Dan, the druggist on the corner,',
        'The guy that taught us math,', 'That fellow was no fool', 'I remember Sam, he was the village idiot', 'The guy that took a knife',
      ]);
      expect(song.sections[4].content[3]).toBe('(Hum)');
      expect(song.sections.at(-1)?.content.at(-1)).toBe('In my home town.');
      expect(song.lyrics).not.toMatch(/\uFFFD|Dm7|G7|Words and Music|The The/);
      expect(song.source?.documentType).toBe('score-pdf');
      expect(song.source?.documentSha256).toBe('af7299562e375bf06c4e642c7e39ea69a568871568967296e91155c3ceff34fe');
    }
    for (const album of ALBUMS.filter((album) => album.artistName === 'Tom Lehrer' && album.title === 'Songs by Tom Lehrer')) {
      expect(album.tracks).toHaveLength(12);
      expect(album.tracks.every((song) => song.lyricsAvailability === 'full')).toBe(true);
    }
  });

  it('retains the DOCX and score evidence without approving an incomplete duet', () => {
    const source = sources.songs.find((source) => source.slug === 'hey-joe')!;
    expect(source.documents).toHaveLength(1);
    expect(source.documents[0].sha256).toBe('2b7bd571739cd71b1947a9aa01de0d8a340be583638c007a859cca21d56a7fcf');
    expect(source.documents[0].format).toBe('docx');
    expect(source.pdfs[0].kind).toBe('score');
    expect(FULL_LYRIC_WORKS.some((song) => song.source?.url === source.sourceUrl)).toBe(false);
  });
});

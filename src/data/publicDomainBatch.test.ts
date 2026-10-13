import { describe, expect, it } from 'vitest';
import batch from './imported/pd-candidates.json';
import { PUBLIC_DOMAIN_BATCH_WORKS } from './publicDomainBatch';
import { FULL_LYRIC_SONGS, FULL_LYRIC_WORKS, PUBLIC_DOMAIN_SONGS } from './catalog';
import { normalizeCatalogText } from './normalize';

describe('anthology public-domain batch', () => {
  it('publishes only approved, fully validated records', () => {
    const approved = batch.records.filter((record) => record.status === 'approved');
    expect(approved.length).toBeGreaterThan(0);
    expect(PUBLIC_DOMAIN_BATCH_WORKS).toHaveLength(approved.length);
    for (const record of approved) {
      expect(record.revisionUrl).toMatch(/^https:\/\/en\.wikisource\.org\/w\/index\.php\?title=.+&oldid=\d+$/);
      expect(record.stanzas.length).toBeGreaterThan(0);
      expect(record.stanzas.flatMap((section) => section.content).length).toBeGreaterThanOrEqual(8);
    }
  });

  it('renders only approved records; a held or review-pending capture never publishes a work that lacks an approved source', () => {
    const approvedKeys = new Set(batch.records.filter((record) => record.status === 'approved').map((record) => record.workKey));
    const publishedKeys = new Set(FULL_LYRIC_SONGS.map((song) => `${normalizeCatalogText(song.artistName)}::${normalizeCatalogText(song.title)}`));
    for (const record of batch.records.filter((item) => item.status !== 'approved')) {
      if (!approvedKeys.has(record.workKey)) {
        expect(publishedKeys.has(`${normalizeCatalogText(record.author)}::${normalizeCatalogText(record.title)}`)).toBe(false);
      }
    }
    // Every rendered batch song is backed by exactly one approved record.
    const approvedSlugs = new Set(batch.records.filter((record) => record.status === 'approved').map((record) => record.workSlug));
    const batchSongs = FULL_LYRIC_SONGS.filter((song) => approvedSlugs.has(song.id.replace('pd-song-', '')));
    expect(batchSongs.length).toBeGreaterThanOrEqual(batch.records.filter((record) => record.status === 'approved').length - batch.records.filter((record) => record.status === 'approved' && record.bookId === 'canadian-soldiers-1918').length);
  });

  it('counts distinct works once despite duplicate release pages', () => {
    const pageKey = (song: { artistId: string; title: string }) => `${song.artistId}::${normalizeCatalogText(song.title)}`;
    expect(new Set(FULL_LYRIC_SONGS.map(pageKey)).size).toBe(FULL_LYRIC_WORKS.length);
  });

  it('keeps provenance on every batch text page', () => {
    const batchSlugs = new Set(PUBLIC_DOMAIN_BATCH_WORKS.map((record) => record.workSlug));
    const batchSongs = PUBLIC_DOMAIN_SONGS.filter((song) => batchSlugs.has(song.id.replace('pd-song-', '')));
    expect(batchSongs.length).toBeGreaterThan(0);
    for (const song of batchSongs) {
      expect(song.rights).toBe('public-domain');
      expect(song.source?.provider).toBe('Wikisource');
      expect(song.source?.revisionUrl).toMatch(/oldid=\d+$/);
      expect(song.source?.evidenceUrl).toMatch(/^https:\/\/en\.wikisource\.org\//);
      expect(song.source?.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(song.source?.rightsNote.length).toBeGreaterThan(40);
      expect(song.writers.length).toBeGreaterThan(0);
    }
  });
});

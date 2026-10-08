import { describe, expect, it } from 'vitest';
import batch from './imported/wikisource.json';
import { validateWikisourceBatch } from './publicDomain';
import { HISTORICAL_SONGS as PUBLIC_DOMAIN_SONGS, findAlbum, findArtist, resolveCatalogItem } from './catalog';
import { COLLECTIONS } from './collections';
import { searchCatalog } from './search';

describe('browser-imported historical lyrics', () => {
  it('matches the eight reviewed browser captures, including every source line', () => {
    expect(() => validateWikisourceBatch(batch)).not.toThrow();
    expect(batch.records.reduce((sum, record) => sum + record.stanzas.flat().length, 0)).toBe(231);
    expect(PUBLIC_DOMAIN_SONGS).toHaveLength(8);
  });

  it('rejects missing, duplicate, unreviewed, malformed, and changed input', () => {
    for (const mutate of [
      (copy: typeof batch) => { copy.records.pop(); },
      (copy: typeof batch) => { copy.records[1] = copy.records[0]; },
      (copy: typeof batch) => { copy.records[0].revisionUrl = 'https://example.com/?oldid=15417564'; },
      (copy: typeof batch) => { copy.records[0].revisionUrl = copy.records[0].revisionUrl.replace('15417564', '1'); },
      (copy: typeof batch) => { copy.records[0].stanzas[0].pop(); },
      (copy: typeof batch) => { copy.records[0].stanzas[0][0] = 'Changed without review'; },
      (copy: typeof batch) => { copy.records[0].stanzas[0][0] = '<script>alert(1)</script>'; },
    ]) {
      const copy = structuredClone(batch);
      mutate(copy);
      expect(() => validateWikisourceBatch(copy)).toThrow();
    }
    expect(() => validateWikisourceBatch(null)).toThrow();
  });

  it('connects writers, editorial songbooks, sources, and search without invented recording data', () => {
    for (const song of PUBLIC_DOMAIN_SONGS) {
      expect(findArtist(song.artistId)?.topSongs).toContain(song);
      expect(findArtist(song.artistId)?.sourceUrl).toMatch(/^https:\/\/en.wikisource.org\//);
      expect(findAlbum(song.albumId)?.type).toBe('Songbook');
      expect(findAlbum(song.albumId)?.tracks).toContain(song);
      expect(song.duration).toBe('');
      expect(song.producers).toEqual([]);
      expect(song.source?.license).toBe('Public domain');
      expect(song.source?.revisionUrl).toMatch(/oldid=\d+$/);
      expect(searchCatalog(song.title).songs[0]?.id).toBe(song.id);
    }
    expect(searchCatalog('public domain', 'songs').songs.length).toBeGreaterThanOrEqual(8);
    expect(searchCatalog('public domain', 'songs').songs.every((song) => song.rights === 'public-domain')).toBe(true);
    expect(COLLECTIONS.every((collection) => collection.itemRefs.every(resolveCatalogItem))).toBe(true);
  });

  it('expands only the explicitly repeated refrain and keeps complete historical editions', () => {
    const kings = PUBLIC_DOMAIN_SONGS.find((song) => song.title.startsWith('We Three'))!;
    expect(kings.sections.filter((section) => section.type === 'chorus')).toHaveLength(5);
    expect(kings.sections.at(-1)?.content[0]).toBe('O star of wonder, star of light,');
    const grace = PUBLIC_DOMAIN_SONGS.find((song) => song.title === 'Amazing Grace')!;
    expect(grace.sections).toHaveLength(6);
    expect(grace.lyrics).not.toContain('ten thousand years');
    expect(PUBLIC_DOMAIN_SONGS.find((song) => song.title === 'Christmas Bells')?.sections).toHaveLength(7);
  });
});

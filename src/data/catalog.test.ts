import { describe, expect, it } from 'vitest';
import { ALBUMS, ARTISTS, FULL_LYRIC_SONGS, FULL_LYRIC_WORKS, SONGS, assertCatalogIntegrity } from './catalog';
import { searchCatalog } from './search';
import imported from './imported/musicbrainz.json';
import { ARTISTS as ORIGINAL_ARTISTS, ALBUMS as ORIGINAL_ALBUMS } from './mockData';

describe('catalog release integrity', () => {
  it('contains the expected release catalog', () => {
    expect(ARTISTS.length).toBeGreaterThan(32);
    expect(ALBUMS.length).toBeGreaterThan(33);
    expect(SONGS.length).toBeGreaterThan(179);
    // 25 original releases, eight historical songbooks, and one author-sheet songbook.
    expect(ALBUMS.length).toBe(34 + imported.artists.reduce((sum, artist) => sum + artist.albums.length, 0));
    expect(ORIGINAL_ARTISTS.every((artist) => ARTISTS.some((item) => item.id === artist.id && item.slug === artist.slug))).toBe(true);
    expect(ORIGINAL_ALBUMS.every((album) => ALBUMS.some((item) => item.id === album.id && item.slug === album.slug))).toBe(true);
    expect(FULL_LYRIC_WORKS).toHaveLength(108);
  });

  it('keeps complete lyrics rights-safe and metadata songs empty', () => {
    expect(() => assertCatalogIntegrity()).not.toThrow();
    expect(FULL_LYRIC_SONGS.filter((song) => song.rights === 'original')).toHaveLength(10);
    expect(FULL_LYRIC_SONGS.every((song) => ['original', 'licensed', 'public-domain'].includes(song.rights) && song.lyrics.length > 0)).toBe(true);
    expect(SONGS.filter((song) => song.lyricsAvailability === 'metadata-only').every((song) => !song.lyrics && !song.sections.length)).toBe(true);
    expect(SONGS.every((song) => song.coverUrl.startsWith('data:image/svg+xml'))).toBe(true);
  });

  it('uses unique slugs within each content type', () => {
    [ARTISTS, ALBUMS, SONGS].forEach((items) => {
      expect(new Set(items.map((item) => item.slug)).size).toBe(items.length);
    });
  });
});

describe('catalog search', () => {
  it('finds source recording names without duplicating their artist identity', () => {
    for (const artist of ARTISTS) {
      for (const name of artist.alternateNames || []) {
        expect(searchCatalog(name, 'artists').artists.map((item) => item.id)).toContain(artist.id);
        const results = searchCatalog(name, 'songs').songs;
        for (const song of SONGS.filter((item) => item.artistId === artist.id)) expect(results.map((item) => item.id)).toContain(song.id);
      }
    }
  });
  it('ranks an exact song title first', () => {
    const results = searchCatalog('City Lights');
    expect(results.songs[0]?.title).toBe('City Lights');
    expect(results.songs[0]?.lyricsAvailability).toBe('full');
  });

  it('keeps readable lyrics ahead of equally matching metadata editions', () => {
    const results = searchCatalog('Amazing Grace', 'songs').songs;
    expect(results.some((song) => song.title === 'Amazing Grace' && song.lyricsAvailability === 'metadata-only')).toBe(true);
    expect(results[0].id).toBe('pd-song-amazing-grace');
    expect(results[0].lyricsAvailability).toBe('full');
  });

  it('matches themes and respects a content-type filter', () => {
    expect(searchCatalog('vulnerability').songs.length).toBeGreaterThan(0);
    const artists = searchCatalog('pop', 'artists');
    expect(artists.songs).toHaveLength(0);
    expect(artists.albums).toHaveLength(0);
    expect(artists.artists.length).toBeGreaterThan(0);
  });

  it('finds a sourced title with either straight or typographic apostrophes', () => {
    const straight = searchCatalog("She's My Girl", 'songs').songs;
    const curved = searchCatalog('She’s My Girl', 'songs').songs;
    expect(straight.length).toBeGreaterThan(0);
    expect(straight.map((song) => song.id)).toEqual(curved.map((song) => song.id));
    expect(straight[0].title).toBe('She’s My Girl');
    expect(straight[0].lyricsAvailability).toBe('full');
  });

  it('matches hyphenated source titles without changing their canonical identity', () => {
    for (const title of ['L-Y', 'O-U (The Hound Song)', 'S-N (Snore, Sniff, and Sneeze)']) {
      const ordinary = searchCatalog(title, 'songs').songs;
      const typographic = searchCatalog(title.replace('-', '‐'), 'songs').songs;
      expect(ordinary.map((song) => song.id)).toEqual(typographic.map((song) => song.id));
      expect(ordinary[0].title).toBe(title.replace('-', '‐'));
      expect(ordinary[0].lyricsAvailability).toBe('full');
    }
  });
});

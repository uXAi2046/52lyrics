import { describe, expect, it } from 'vitest';
import { findArtist, findSong } from './catalog';
import { HOME_ARTIST_FILTERS, HOME_ARTIST_PICKS, HOME_READERS, HOME_RELEASE_PATHS, HOME_SPOTLIGHTS, recentHomeArtists } from './homeArtists';

describe('artist-led homepage', () => {
  it('uses distinct real artist identities and credited local photographs for editorial picks', () => {
    expect(new Set(HOME_ARTIST_PICKS.map(({ artist }) => artist.id)).size).toBe(HOME_ARTIST_PICKS.length);
    for (const { artist } of [...HOME_SPOTLIGHTS, ...HOME_ARTIST_PICKS]) {
      expect(findArtist(artist.slug)).toBe(artist);
      expect(artist.metadataSource).toBeDefined();
      expect(artist.imageCredit?.sourceUrl).toMatch(/^https:\/\/commons.wikimedia.org\//);
      expect(artist.imageUrl).toMatch(/^\/artwork\/imported\//);
    }
    for (const filter of HOME_ARTIST_FILTERS.slice(1)) expect(HOME_ARTIST_PICKS.some((pick) => pick.group === filter)).toBe(true);
  });

  it('links each artist to their own sourced edition and real opening tracks', () => {
    for (const { artist, album } of HOME_RELEASE_PATHS) {
      expect(album.artistId).toBe(artist.id);
      expect(artist.albums).toContain(album);
      expect(album.metadataSource?.url).toMatch(/^https:\/\/musicbrainz.org\/release\//);
      expect(album.tracks.length).toBeGreaterThanOrEqual(3);
      expect(album.tracks.slice(0, 3).every((song) => song.artistId === artist.id && song.albumId === album.id)).toBe(true);
    }
  });

  it('counts distinct readable works per artist and retains the City Lights shortcut', () => {
    expect(HOME_READERS.map(({ songs }) => songs.length)).toEqual([10, 90]);
    for (const { artist, songs } of HOME_READERS) {
      expect(songs.every((song) => song.artistId === artist.id && song.lyricsAvailability === 'full')).toBe(true);
      expect(new Set(songs.map((song) => song.title)).size).toBe(songs.length);
    }
    expect(findSong('the-midnight-echo-city-lights')?.rights).toBe('original');
  });

  it('projects song, album and artist visits into unique recent artists in recency order', () => {
    const [first, second] = HOME_RELEASE_PATHS;
    expect(recentHomeArtists([
      { type: 'song', id: first.album.tracks[0].id },
      { type: 'album', id: first.album.id },
      { type: 'artist', id: second.artist.id },
      { type: 'artist', id: first.artist.id },
      { type: 'artist', id: 'missing-artist' },
    ]).map((artist) => artist.id)).toEqual([first.artist.id, second.artist.id]);
    expect(recentHomeArtists([])).toEqual([]);
  });

  it('limits recent artists to four without replacing valid entries with broken references', () => {
    const refs = HOME_ARTIST_PICKS.map(({ artist }) => ({ type: 'artist' as const, id: artist.id }));
    expect(recentHomeArtists([{ type: 'song', id: 'missing-song' }, ...refs]).map((artist) => artist.id)).toEqual(refs.slice(0, 4).map((ref) => ref.id));
  });
});

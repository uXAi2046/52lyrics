import { describe, expect, it } from 'vitest';
import { ARTIST_PROFILES } from './artistProfiles';
import metadata from './imported/musicbrainz.json';
import { ARTISTS, findArtist } from './catalog';
import { ARTISTS as ORIGINAL_ARTISTS } from './mockData';

describe('source-linked artist profiles', () => {
  it('publishes only a complete identity-linked profile batch with the artist expansion', () => {
    if ('expansion' in metadata) {
      expect(metadata.artists.filter((artist) => artist.albums.length).length).toBeGreaterThanOrEqual(500);
      expect(ARTIST_PROFILES).toHaveLength(metadata.artists.length);
    } else {
      expect(ARTIST_PROFILES).toHaveLength(0);
    }
    expect(new Set(ARTIST_PROFILES.map((profile) => profile.wikidataId)).size).toBe(ARTIST_PROFILES.length);
    for (const profile of ARTIST_PROFILES) {
      const record = metadata.artists.find((artist) => artist.mbid === profile.mbid)!;
      expect(record.wikidataId).toBe(profile.wikidataId);
      expect(record.name).toBe(profile.name);
      expect(profile.sourceUrl).toBe(`https://www.wikidata.org/wiki/${profile.wikidataId}`);
      expect(profile.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      const artist = findArtist(record.existingId || `mb-artist-${record.mbid}`)!;
      if (!record.existingId) {
        expect(artist.genres).toEqual(record.genres.length ? record.genres : profile.genres.map((genre) => genre.name));
        if (profile.description) {
          expect(artist.biography).toContain(profile.description);
          expect(artist.profileSource).toMatchObject({ provider: 'Wikidata', url: profile.sourceUrl, license: 'CC0-1.0' });
        }
      }
    }
  });

  it('retains every original editorial biography and genre choice', () => {
    for (const original of ORIGINAL_ARTISTS) {
      const artist = ARTISTS.find((item) => item.id === original.id)!;
      expect(artist.biography).toBe(original.biography);
      expect(artist.genres).toEqual(original.genres);
    }
  });
});

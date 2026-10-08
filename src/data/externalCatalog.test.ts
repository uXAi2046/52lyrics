import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import batch from './imported/musicbrainz.json';
import photos from './imported/commons.json';
import { ALBUMS, ARTISTS, SONGS, findAlbum, findArtist } from './catalog';

describe('sourced release catalog', () => {
  it('connects every imported artist, edition and track without fabricating lyrics or credits', () => {
    for (const artist of batch.artists) {
      const item = findArtist(artist.existingId || `mb-artist-${artist.mbid}`)!;
      expect(item.metadataSource?.url).toBe(`https://musicbrainz.org/artist/${artist.mbid}`);
      const dates: { retrievedAt: string; baselineRetrievedAt?: string } = batch;
      const expectedDate = ('collectedAt' in artist && typeof artist.collectedAt === 'string'
        ? artist.collectedAt : dates.baselineRetrievedAt ?? dates.retrievedAt).slice(0, 10);
      expect(item.metadataSource?.retrievedAt).toBe(expectedDate);
      for (const release of artist.albums) {
        const album = findAlbum(`mb-album-${release.id}`)!;
        expect(album.artistId).toBe(item.id);
        expect(item.albums).toContain(album);
        expect(album.metadataSource?.url).toBe(`https://musicbrainz.org/release/${release.releaseId}`);
        expect(album.metadataSource?.retrievedAt).toBe(expectedDate);
        expect(album.tracks.map((track) => track.title)).toEqual(release.tracks.map((track) => track.title));
        expect(album.trackCount).toBe(release.tracks.length);
        expect(album.tracks.map((track) => [track.discNumber, track.discTrackNumber])).toEqual(release.tracks.map((track) => [track.disc, track.position]));
        for (const track of album.tracks) {
          if (track.source?.provider === 'Tom Lehrer') {
            expect(track.lyricsAvailability).toBe('full');
            expect(track.rights).toBe('public-domain');
            expect(track.source.documentSha256).toMatch(/^[a-f0-9]{64}$/);
            expect(track.writers).toEqual(['Tom Lehrer']);
          } else {
            expect(track.lyricsAvailability).toBe('metadata-only');
            expect(track.lyrics).toBe('');
            expect(track.writers).toEqual([]);
          }
          expect(track.producers).toEqual([]);
          expect(track.metadataSource?.license).toBe('CC0-1.0');
          expect(track.metadataSource?.retrievedAt).toBe(expectedDate);
        }
      }
    }
  });

  it('preserves the three-disc compilation boundaries and the source edition', () => {
    const album = ALBUMS.find((album) => album.title === 'The Remains of Tom Lehrer')!;
    expect(album.year).toBe(2000);
    expect(album.tracks).toHaveLength(74);
    expect([1, 2, 3].map((disc) => album.tracks.filter((track) => track.discNumber === disc).length)).toEqual([25, 24, 25]);
    expect(album.tracks[25].discTrackNumber).toBe(1);
    expect(album.tracks[49].discTrackNumber).toBe(1);
    expect(album.metadataSource?.edition).toContain('Compilation');
    expect(album.metadataSource?.edition).toContain('2000-05-23');
  });

  it('keeps artwork local and checks the actual downloaded image bytes and credit links', () => {
    expect(photos.records.length).toBeGreaterThanOrEqual(40);
    for (const image of photos.records) {
      expect(image.localPath).toMatch(/^\/artwork\/imported\/[a-f0-9]{20}\.(jpg|png)$/);
      const bytes = readFileSync(`public${image.localPath}`);
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(image.sha256);
      expect(image.author.trim()).not.toBe('');
      expect(image.sourceUrl).toMatch(/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
      expect(image.licenseUrl).toMatch(/^https:\/\/(creativecommons.org|commons.wikimedia.org)\//);
      expect(image.license).toMatch(/^(CC BY(?:-SA)? [234]\.[05]|CC BY-SA 2\.0 fr|CC0|Public domain)$/);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
    }
    expect(ARTISTS.filter((artist) => artist.imageCredit).length).toBeGreaterThanOrEqual(23);
    expect([...ALBUMS.map((album) => album.coverUrl), ...SONGS.map((song) => song.coverUrl), ...ARTISTS.map((artist) => artist.imageUrl)].every((url) => url.startsWith('data:image/svg+xml') || url.startsWith('/artwork/'))).toBe(true);
  });
});

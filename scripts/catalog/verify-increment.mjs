import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ARTISTS, ALBUMS, SONGS, FULL_LYRIC_WORKS, artistPath, findArtist, findAlbum, songPath } from '../../src/data/catalog.ts';

// Compare against an explicit pre-collection backup, not staging counters or source search results.
const [baselineDirectory, requestedAdded] = process.argv.slice(2);
assert(baselineDirectory && /^\d+$/.test(requestedAdded || ''), 'Usage: node --import tsx scripts/catalog/verify-increment.mjs BASELINE_DIRECTORY ADDED_ARTISTS');
const addedCount = Number(requestedAdded);
assert(Number.isSafeInteger(addedCount) && addedCount > 0);
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const before = await json(resolve(baselineDirectory, 'musicbrainz.json'));
const after = await json('src/data/imported/musicbrainz.json');
assert.equal(after.baselineRetrievedAt, before.baselineRetrievedAt ?? before.retrievedAt, 'Original source retrieval date changed');
assert.deepEqual(after.artists.slice(0, before.artists.length), before.artists, 'Previously published records or their order changed');
for (const name of ['commons', 'artist-profiles']) {
  const original = await json(resolve(baselineDirectory, `${name}.json`));
  const current = await json(`src/data/imported/${name}.json`);
  const records = new Map(current.records.map((record) => [record.wikidataId, record]));
  for (const record of original.records) assert.deepEqual(records.get(record.wikidataId), record, `Existing ${name} record changed: ${record.name}`);
}
const added = after.artists.slice(before.artists.length);
assert.equal(added.length, addedCount, 'Wrong number of new artist identities');
assert.equal(after.artists.filter((artist) => artist.albums.length).length - before.artists.filter((artist) => artist.albums.length).length, addedCount);
assert.equal(FULL_LYRIC_WORKS.length, 108, 'Previously reviewed lyric corpus changed');
const rows = added.map((record) => {
  const artist = findArtist(`mb-artist-${record.mbid}`);
  assert(artist && record.albums.length > 0, `Missing artist/release: ${record.name}`);
  for (const release of record.albums) {
    const album = findAlbum(`mb-album-${release.id}`);
    assert(album && artist.albums.includes(album), `Disconnected album: ${record.name}`);
    assert.deepEqual(album.tracks.map((song) => song.id), release.tracks.map((track) => `mb-song-${track.id}`));
    for (const song of album.tracks) {
      assert.equal(song.lyricsAvailability, 'metadata-only');
      assert.equal(song.lyrics, '');
      assert.equal(song.sections.length, 0);
      assert.equal(song.rights, 'unavailable');
      assert(songPath(song).startsWith('/lyrics/'));
    }
  }
  return { name: artist.name, path: artistPath(artist), albums: record.albums.map((album) => ({ title: album.title, tracks: album.tracks.length, source: `https://musicbrainz.org/release/${album.releaseId}` })) };
});
console.log(JSON.stringify({
  verifiedAt: new Date().toISOString(), preservedArtists: before.artists.length,
  addedArtists: added.length, addedAlbums: added.reduce((total, artist) => total + artist.albums.length, 0),
  addedSongPages: added.reduce((total, artist) => total + artist.albums.reduce((count, album) => count + album.tracks.length, 0), 0),
  totalArtistsAndWriters: ARTISTS.length, totalAlbumsAndSongbooks: ALBUMS.length, totalSongPages: SONGS.length,
  distinctFullLyricWorks: FULL_LYRIC_WORKS.length, artists: rows,
}, null, 2));

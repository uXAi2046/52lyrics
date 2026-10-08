import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { FULL_LYRIC_WORKS } from '../../src/data/catalog.ts';
import { cacheDir, sha256 } from './http.mjs';
import { validateArtistIdentity } from './expansion-core.mjs';
import { verifyArtistProfiles } from './verify-artist-profiles.mjs';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const metadata = await json('src/data/imported/musicbrainz.json');
const seeds = await json(resolve(cacheDir, 'musicbrainz/seeds.json'));
const photos = await json('src/data/imported/commons.json');
const sources = await json('src/data/imported/lehrer-sources.json');
const holds = await json('src/data/imported/lehrer-rights-holds.json');
const profiles = await json('src/data/imported/artist-profiles.json');
const excludedReleaseIds = new Set((await json('scripts/catalog/metadata-exclusions.json')).map((item) => item.releaseGroupId));
assert.deepEqual(metadata.failures, [], 'Metadata collection has unresolved failures');
assert.deepEqual(photos.skipped, [], 'Photo collection has unresolved omissions');
if (metadata.expansion) {
  const profileCounts = await verifyArtistProfiles(profiles, metadata.artists);
  assert.equal(profileCounts.pending, 0, 'Missing expanded artist profile');
  assert(Number.isSafeInteger(metadata.expansion.target) && metadata.expansion.target >= 500, 'Invalid expanded collection target');
  assert(metadata.artists.filter((artist) => artist.albums.length > 0).length >= metadata.expansion.target, 'Expanded collection has not reached its declared artist target');
  const previous = seeds.map((seed) => {
    const artist = metadata.artists.find((item) => seed.existingId ? item.existingId === seed.existingId : item.name === seed.name);
    assert(artist, `An original configured artist is missing: ${seed.name}`);
    return artist.mbid;
  });
  const expected = [...previous, ...metadata.expansion.admittedArtistIds];
  assert.equal(new Set(expected).size, expected.length, 'Duplicate admitted identity');
  assert.deepEqual(metadata.artists.map((artist) => artist.mbid).sort(), expected.sort(), 'Expansion identity inventory differs');
  assert.equal(new Set(metadata.artists.map((artist) => artist.wikidataId)).size, metadata.artists.length, 'Duplicate Wikidata identity');
  const photoIds = new Set(photos.records.map((photo) => photo.wikidataId));
  const fallbacks = new Set((photos.fallbacks || []).map((photo) => photo.wikidataId));
  assert(metadata.artists.every((artist) => photoIds.has(artist.wikidataId) || fallbacks.has(artist.wikidataId)), 'Unreviewed expanded artist photograph');
} else {
  assert.deepEqual(metadata.artists.map((artist) => artist.name).sort(), seeds.map((artist) => artist.name).sort(), 'A configured artist is missing');
}
let releases = 0;
let tracks = 0;
for (const artist of metadata.artists) {
  if (artist.identitySourceUrl) {
    const identity = await json(resolve(cacheDir, sha256(artist.identitySourceUrl)));
    validateArtistIdentity(artist, identity);
    assert.equal(identity.id, artist.mbid);
  }
  for (const album of artist.albums) {
    assert(!excludedReleaseIds.has(album.id), `Reviewed exclusion is published: ${artist.name} / ${album.title}`);
    const url = `https://musicbrainz.org/ws/2/release/${album.releaseId}?${new URLSearchParams({ inc: 'recordings+artist-credits', fmt: 'json' })}`;
    const original = await json(resolve(cacheDir, sha256(url)));
    assert.equal(original['artist-credit'][0]?.artist?.id, artist.mbid, `Wrong primary artist: ${album.title}`);
    const expected = original.media.flatMap((medium) => (medium.tracks || []).map((track) => [track.id, track.title, track.recording?.id, medium.position, track.position]));
    const actual = album.tracks.map((track) => [track.id, track.title, track.recordingId, track.disc, track.position]);
    assert.deepEqual(actual, expected, `Release differs from downloaded original: ${album.title}`);
    releases++;
    tracks += actual.length;
  }
}
for (const photo of photos.records) {
  assert.equal(sha256(await readFile(`public${photo.localPath}`)), photo.sha256, `Photo changed: ${photo.name}`);
  assert(photo.author && photo.license && photo.licenseUrl && photo.sourceUrl, `Incomplete photo attribution: ${photo.name}`);
}
const approved = FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer');
const accounted = [...approved.map((song) => song.source.url), ...holds.map((hold) => hold.sourceUrl)];
assert.equal(new Set(accounted).size, accounted.length, 'Duplicate approval or approval/hold conflict');
assert.deepEqual(accounted.sort(), sources.songs.map((source) => source.sourceUrl).sort(), 'Unreviewed author source');
let documents = 0;
for (const source of sources.songs) {
  const files = [...source.pdfs, ...source.documents];
  assert(files.length, `No source document: ${source.title}`);
  for (const file of files) {
    assert.equal(sha256(await readFile(resolve(cacheDir, 'lehrer', file.filename))), file.sha256, `Changed document: ${file.filename}`);
    documents++;
  }
}
console.log(`Verified source originals: ${metadata.artists.length} configured artists, ${releases} releases, ${tracks} tracks, ${photos.records.length} photographs, ${documents} author documents; ${approved.length} approved works and ${holds.length} explicit holds.`);
if (metadata.expansion) console.log(`Verified ${profiles.records.length} artist profiles against their original Wikidata query receipts.`);

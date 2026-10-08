import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir, sha256 } from './http.mjs';
import { readAlbum, validateArtistIdentity, validateExpansion } from './expansion-core.mjs';
import { imageDimensions } from './image-dimensions.mjs';
import { verifyArtistProfiles } from './verify-artist-profiles.mjs';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const verifyOnly = process.argv.includes('--verify-progress');
assert(process.argv.slice(2).every((arg) => arg === '--verify-progress'), 'Unknown publication argument');
const cached = async (url) => {
  const bytes = await readFile(resolve(cacheDir, sha256(url)));
  const receipt = await json(resolve(cacheDir, `${sha256(url)}.json`));
  assert.equal(receipt.url, url, 'Source URL receipt mismatch');
  assert.equal(receipt.sha256, sha256(bytes), 'Cached source checksum mismatch');
  return JSON.parse(bytes.toString('utf8'));
};
const endpoint = (kind, query = {}) => `https://musicbrainz.org/ws/2/${kind}?${new URLSearchParams({ ...query, fmt: 'json' })}`;
const staged = await json(resolve(cacheDir, 'musicbrainz/expansion.json'));
const photos = await json(resolve(cacheDir, 'images-expansion.json'));
const profiles = await json(resolve(cacheDir, 'artist-profiles-expansion.json'));
const current = await json('src/data/imported/musicbrainz.json');
const currentPhotos = await json('src/data/imported/commons.json');
const currentProfiles = await json('src/data/imported/artist-profiles.json');
const discovery = await json('scripts/catalog/artist-expansion-seeds.json');
const exclusions = await json('scripts/catalog/metadata-exclusions.json');
const excludedReleaseIds = new Set(exclusions.map((item) => item.releaseGroupId));
const counts = validateExpansion(staged);
const profileCounts = await verifyArtistProfiles(profiles, staged.artists);
if (!verifyOnly) {
  assert.equal(staged.status, 'complete', 'Artist collection has not finished');
  assert(Number.isSafeInteger(staged.target) && staged.target >= 500, 'Invalid collection target');
  assert(counts.artistsWithReleases >= staged.target, `${staged.target} distinct artists with releases are required`);
  assert.equal(photos.status, 'complete', 'Image review has not finished');
  assert.equal(profiles.status, 'complete', 'Artist-profile collection has not finished');
  assert.equal(profileCounts.pending, 0, 'An artist profile has not been checked');
}
// Never erase user edits or earlier curated releases during promotion.
for (const artist of current.artists) {
  assert.deepEqual(staged.artists.find((item) => item.mbid === artist.mbid), artist, `Published artist changed since collection started: ${artist.name}`);
}
for (const photo of currentPhotos.records) {
  assert.deepEqual(photos.records.find((item) => item.wikidataId === photo.wikidataId), photo, `An existing photograph would change: ${photo.name}`);
}
for (const profile of currentProfiles.records) {
  assert.deepEqual(profiles.records.find((item) => item.wikidataId === profile.wikidataId), profile, `An existing source profile would change: ${profile.name}`);
}

const discovered = new Set();
for (const query of discovery.queries) {
  const response = await cached(query.url);
  assert.equal(response.results.bindings.length, query.count, 'Discovery source count changed');
  for (const row of response.results.bindings) {
    discovered.add(`${row.artist.value.split('/').at(-1)}:${row.mbid.value}:${row.artistLabel.value}`);
  }
}
const originalIds = new Set(staged.baselineArtistIds);
for (const artist of staged.artists) {
  if (!originalIds.has(artist.mbid)) {
    assert(discovered.has(`${artist.wikidataId}:${artist.requestedMbid}:${artist.name}`), `Artist has no matching discovery source: ${artist.name}`);
    const identity = await cached(artist.identitySourceUrl);
    validateArtistIdentity(artist, identity);
    assert.equal(identity.id, artist.mbid);
    assert.equal(identity.name, artist.nameInSource);
    assert.equal(identity.type, artist.entityType);
  }
  for (const album of artist.albums) {
    assert(!excludedReleaseIds.has(album.id), `Reviewed exclusion is still admitted: ${artist.name} / ${album.title}`);
    const original = await cached(endpoint(`release/${album.releaseId}`, { inc: 'recordings+artist-credits' }));
    assert.equal(original['artist-credit'][0]?.artist?.id, artist.mbid, `Wrong primary release artist: ${album.title}`);
    const tracks = original.media.flatMap((medium) => (medium.tracks || []).map((track) => [track.id, track.title, track.recording?.id, medium.position, track.position]));
    assert.deepEqual(album.tracks.map((track) => [track.id, track.title, track.recordingId, track.disc, track.position]), tracks, `Track sequence changed: ${album.title}`);
    if (!originalIds.has(artist.mbid)) {
      let group;
      for (let offset = 0; offset < 1000; offset += 100) {
        const response = await cached(endpoint('release-group', { artist: artist.mbid, type: 'album', limit: '100', offset: String(offset) }));
        group = response['release-groups'].find((item) => item.id === album.id);
        if (group || offset + response['release-groups'].length >= response['release-group-count']) break;
      }
      assert(group, `Album group not found in artist's source discography: ${album.title}`);
      assert.equal(group['primary-type'], 'Album');
      assert(!group['secondary-types'].length, 'New artist requires an eligible studio release');
      assert.deepEqual(readAlbum(group, original, artist.mbid), album, `Album differs from source: ${album.title}`);
    }
  }
}

const photoIds = new Set();
for (const photo of photos.records) {
  assert(!photoIds.has(photo.wikidataId), 'Duplicate photo identity');
  photoIds.add(photo.wikidataId);
  assert(/^\/artwork\/imported\/[a-f0-9]{20}\.(jpg|png)$/.test(photo.localPath), 'Invalid photo path');
  assert(/^(CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC BY-SA 2\.0 fr|CC0|Public domain)$/.test(photo.license), 'Unapproved photo license');
  assert(photo.author && photo.licenseUrl && photo.sourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:'), 'Missing photo credit');
  const bytes = await readFile(`public${photo.localPath}`);
  assert.equal(sha256(bytes), photo.sha256, `Photo checksum failed: ${photo.name}`);
  assert.deepEqual(imageDimensions(bytes), { width: photo.width, height: photo.height });
}
const fallbackIds = new Set(photos.fallbacks.map((item) => item.wikidataId));
assert.equal(fallbackIds.size, photos.fallbacks.length, 'Duplicate photo fallback');
assert([...fallbackIds].every((id) => !photoIds.has(id)), 'Photo/fallback conflict');
const pendingImages = staged.artists.filter((artist) => !photoIds.has(artist.wikidataId) && !fallbackIds.has(artist.wikidataId));
if (verifyOnly) {
  console.log(JSON.stringify({ stagingVerified: true, published: false, target: staged.target, status: staged.status, ...counts, photographs: photos.records.length, localAvatarFallbacks: photos.fallbacks.length, pendingImages: pendingImages.length, artistProfiles: profileCounts }));
  process.exit(0);
}
assert.equal(pendingImages.length, 0, 'An artist image has not been reviewed');

const expansion = {
  target: staged.target, verifiedAt: new Date().toISOString(), ...counts,
  discoveryCandidates: discovery.artists.length, discoveryRetrievedAt: discovery.retrievedAt,
  admittedArtistIds: staged.artists.filter((artist) => !originalIds.has(artist.mbid)).map((artist) => artist.mbid),
  photographs: photos.records.length, localAvatarFallbacks: photos.fallbacks.length,
  heldCandidateCount: staged.rejectedCandidates.filter((item) => !item.resolvedArtistMbid).length,
  artistProfiles: profileCounts,
};
const publishedMetadata = {
  schemaVersion: 1, provider: staged.provider, license: staged.license, licenseUrl: staged.licenseUrl,
  retrievedAt: staged.retrievedAt, curatedRetrievedAt: staged.curatedRetrievedAt,
  baselineRetrievedAt: current.baselineRetrievedAt ?? current.retrievedAt, expansion,
  artists: staged.artists, failures: [], exclusions,
};
const publishedPhotos = {
  schemaVersion: 1, records: photos.records, skipped: [],
  fallbacks: photos.fallbacks.map(({ name, mbid, wikidataId, fallback }) => ({ name, mbid, wikidataId, fallback })),
};
// Both batches have passed read-only validation before either published file changes.
// Extra reviewed photos are harmless if the metadata write fails; no existing records are removed.
await atomicJson('src/data/imported/commons.json', publishedPhotos);
await atomicJson('src/data/imported/artist-profiles.json', { schemaVersion: 1, provider: profiles.provider, license: profiles.license, records: profiles.records });
await atomicJson('src/data/imported/musicbrainz.json', publishedMetadata);
console.log(JSON.stringify({ published: true, ...expansion }));

import assert from 'node:assert/strict';
import { access, mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir } from './http.mjs';
import { validateExpansion } from './expansion-core.mjs';

// Offline review migration: all collectors must be terminal before checkpoint edits.
assert.equal(process.argv.length, 2, 'No arguments are accepted');
for (const name of ['musicbrainz/expansion.lock', 'images-expansion.lock', 'artist-profiles-expansion.lock']) {
  try { await access(resolve(cacheDir, name)); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  throw new Error(`Stop the collector and confirm it is terminal first: ${name}`);
}
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const paths = ['musicbrainz/expansion.json', 'images-expansion.json', 'artist-profiles-expansion.json'];
const [metadata, images, profiles] = await Promise.all(paths.map((path) => json(resolve(cacheDir, path))));
const excluded = new Map((await json('scripts/catalog/metadata-exclusions.json')).map((item) => [item.releaseGroupId, item]));
const held = metadata.artists.filter((artist) => artist.albums.some((album) => excluded.has(album.id)));
if (!held.length) { console.log('No admitted exclusions to quarantine.'); process.exit(0); }
const baseline = new Set(metadata.baselineArtistIds);
for (const artist of held) {
  assert(!baseline.has(artist.mbid), `Refusing to change published artist: ${artist.name}`);
  assert(artist.albums.every((album) => excluded.has(album.id)), `Mixed eligible/excluded releases require individual review: ${artist.name}`);
}
const ids = new Set(held.map((artist) => artist.wikidataId));
const at = new Date().toISOString();
const originals = [metadata, images, profiles].map((state) => structuredClone(state));
metadata.quarantinedArtists ||= [];
for (const artist of held) {
  const reasons = artist.albums.map((album) => excluded.get(album.id));
  metadata.quarantinedArtists.push({ artist, reasons, reviewedAt: at });
  metadata.rejectedCandidates.push({ mbid: artist.requestedMbid || artist.mbid, wikidataId: artist.wikidataId, name: artist.name, reason: `Reviewed non-music release: ${reasons.map((item) => item.title).join('; ')}`, at });
}
metadata.artists = metadata.artists.filter((artist) => !ids.has(artist.wikidataId));
metadata.status = 'interrupted';
metadata.retrievedAt = at;
metadata.counts = validateExpansion(metadata);
for (const state of [images, profiles]) {
  state.quarantinedRecords = [...(state.quarantinedRecords || []), ...state.records.filter((record) => ids.has(record.wikidataId))];
  state.records = state.records.filter((record) => !ids.has(record.wikidataId));
}
images.quarantinedFallbacks = [...(images.quarantinedFallbacks || []), ...images.fallbacks.filter((item) => ids.has(item.wikidataId))];
images.fallbacks = images.fallbacks.filter((item) => !ids.has(item.wikidataId));
images.attempted = images.attempted.filter((id) => !ids.has(id));
const backup = resolve(cacheDir, 'review-backups', `excluded-${at.replaceAll(':', '-')}-${process.pid}`);
await mkdir(backup, { recursive: true });
// Preserve all three originals before the first checkpoint changes. Raw sources/images stay in place.
for (let index = 0; index < paths.length; index++) await atomicJson(resolve(backup, `${index}.json`), originals[index]);
for (const [index, state] of [metadata, images, profiles].entries()) await atomicJson(resolve(cacheDir, paths[index]), state);
console.log(JSON.stringify({ quarantined: held.map((artist) => artist.name), backup, counts: metadata.counts }));

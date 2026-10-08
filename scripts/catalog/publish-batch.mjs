import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir, sha256 } from './http.mjs';
import { imageDimensions } from './image-dimensions.mjs';

const provider = process.argv[2];
if (!['images', 'musicbrainz'].includes(provider)) throw new Error('Usage: node scripts/catalog/publish-batch.mjs images|musicbrainz');
const source = resolve(cacheDir, provider === 'images' ? 'images.json' : 'musicbrainz/batch.json');
const batch = JSON.parse(await readFile(source, 'utf8'));
if (batch.schemaVersion !== 1) throw new Error('Unsupported batch schema.');
if (provider === 'images') {
  if (!batch.records?.length) throw new Error('Empty image batch.');
  for (const record of batch.records) {
    if (!/^\/artwork\/imported\/[a-f0-9]{20}\.(jpg|png)$/.test(record.localPath)) throw new Error('Invalid local image path.');
    if (!/^https:\/\/commons.wikimedia.org\/wiki\/File:/.test(record.sourceUrl) || !record.author || !record.license) throw new Error('Missing image attribution.');
    if (!/^(CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC BY-SA 2\.0 fr|CC0|Public domain)$/.test(record.license)) throw new Error(`Unsupported image license: ${record.name}`);
    const licenseUrl = new URL(record.licenseUrl);
    if (!['creativecommons.org', 'commons.wikimedia.org'].includes(licenseUrl.hostname) || !['https:', 'http:'].includes(licenseUrl.protocol)) throw new Error('Unrecognized image license link.');
    licenseUrl.protocol = 'https:';
    record.licenseUrl = licenseUrl.href;
    const bytes = await readFile(resolve('public', `.${record.localPath}`));
    if (sha256(bytes) !== record.sha256) throw new Error(`Image checksum failed: ${record.name}`);
    record.reportedDimensions = { width: record.width, height: record.height };
    Object.assign(record, imageDimensions(bytes));
  }
} else {
  if (batch.license !== 'CC0-1.0' || !batch.artists?.length) throw new Error('Invalid metadata batch.');
  const seeds = JSON.parse(await readFile(resolve(cacheDir, 'musicbrainz/seeds.json'), 'utf8'));
  const processed = new Set([...batch.artists, ...batch.failures].map((item) => item.name));
  if (seeds.some((seed) => !processed.has(seed.name))) throw new Error('Collection is still running or incomplete; wait for the collector to finish before promotion.');
  let curated;
  try { curated = JSON.parse(await readFile(resolve(cacheDir, 'musicbrainz/curated.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (curated) {
    const targets = JSON.parse(await readFile('scripts/catalog/curated-release-groups.json', 'utf8'));
    if (curated.schemaVersion !== 1 || curated.failures.length || targets.length !== curated.records.length || targets.some((target) => !curated.records.some((record) => record.artistId === target.artistId && record.album.id === target.releaseGroupId))) throw new Error('Curated release collection is incomplete or failed.');
    for (const record of curated.records) {
      const artist = batch.artists.find((artist) => artist.mbid === record.artistId);
      if (!artist) throw new Error(`Missing curated artist: ${record.artistId}`);
      if (!artist.albums.some((album) => album.id === record.album.id)) artist.albums.push(record.album);
    }
    batch.curatedRetrievedAt = curated.retrievedAt;
  }
  const ids = new Set();
  batch.exclusions = [];
  const quarantined = JSON.parse(await readFile('scripts/catalog/metadata-exclusions.json', 'utf8'));
  const normalizeTitle = (value) => ({ '÷': 'divide', '×': 'multiply', '+': 'plus', '=': 'equals', '−': 'subtract' })[value] || value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const artist of batch.artists) {
    const kept = [];
    for (const album of artist.albums) {
      const exclusion = quarantined.find((item) => item.releaseGroupId === album.id);
      if (exclusion) { batch.exclusions.push(exclusion); continue; }
      const url = `https://musicbrainz.org/ws/2/release/${album.releaseId}?${new URLSearchParams({ inc: 'recordings+artist-credits', fmt: 'json' })}`;
      const original = JSON.parse(await readFile(resolve(cacheDir, sha256(url)), 'utf8'));
      if (original['artist-credit'][0]?.artist?.id !== artist.mbid || artist.existingAlbums.some((title) => normalizeTitle(title) === normalizeTitle(album.title))) {
        batch.exclusions.push({ artist: artist.name, album: album.title, reason: original['artist-credit'][0]?.artist?.id !== artist.mbid ? 'Artist is not the primary credited release artist.' : 'Already present under an equivalent title.' });
        continue;
      }
      const sourceTracks = original.media.flatMap((medium) => medium.tracks || []);
      if (sourceTracks.length !== album.tracks.length || sourceTracks.some((track, index) => track.id !== album.tracks[index].id || track.title !== album.tracks[index].title)) throw new Error(`Track sequence differs from downloaded source: ${album.title}`);
      if (ids.has(album.id) || !album.tracks.length) throw new Error('Duplicate or empty release.');
      ids.add(album.id);
      for (const track of album.tracks) {
        if (!track.id || !track.title || !track.recordingId) throw new Error('Incomplete recording reference.');
      }
      kept.push(album);
    }
    artist.albums = kept;
  }
}
const output = resolve('src/data/imported', provider === 'images' ? 'commons.json' : 'musicbrainz.json');
await atomicJson(output, batch);
console.log(`Published verified ${provider} checkpoint: ${output}`);

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir, sourceJson } from './http.mjs';

const targets = JSON.parse(await readFile('scripts/catalog/curated-release-groups.json', 'utf8'));
const catalog = JSON.parse(await readFile(resolve(cacheDir, 'musicbrainz/batch.json'), 'utf8'));
const records = [];
const failures = [];
const endpoint = (kind, query) => `https://musicbrainz.org/ws/2/${kind}?${new URLSearchParams({ ...query, fmt: 'json' })}`;
for (const target of targets) {
  try {
    assert(catalog.artists.some((artist) => artist.mbid === target.artistId && artist.name === target.artist), `Artist identity is not in the verified roster: ${target.artist}`);
    const group = await sourceJson(endpoint(`release-group/${target.releaseGroupId}`, { inc: 'artist-credits' }));
    assert.equal(group.title, target.title, 'Curated group title changed; review before importing.');
    assert.equal(group['artist-credit'][0]?.artist?.id, target.artistId, 'Different primary album artist.');
    assert.equal(group['primary-type'], 'Album');
    assert(/^\d{4}/.test(group['first-release-date']), 'Missing release year.');
    const result = await sourceJson(endpoint('release', { 'release-group': group.id, status: 'official', inc: 'media', limit: '100' }));
    const candidates = result.releases.filter((release) => release.status === 'Official' && release.media?.some((medium) => medium['track-count'] > 0));
    candidates.sort((left, right) => (left.date || '9999').localeCompare(right.date || '9999') || Number(!['US', 'GB'].includes(left.country)) - Number(!['US', 'GB'].includes(right.country)) || left.id.localeCompare(right.id));
    assert(candidates.length, 'No official track-listed edition.');
    const release = await sourceJson(endpoint(`release/${candidates[0].id}`, { inc: 'recordings+artist-credits' }));
    assert.equal(release['artist-credit'][0]?.artist?.id, target.artistId, 'Different primary edition artist.');
    const tracks = release.media.flatMap((medium) => (medium.tracks || []).map((track) => ({ id: track.id, recordingId: track.recording?.id, title: track.title, position: track.position, disc: medium.position, number: track.number, lengthMs: track.length || track.recording?.length || null, artistCredit: (track['artist-credit'] || release['artist-credit']).map((credit) => credit.name).join(' / ') })));
    assert(tracks.length, 'Empty track list.');
    records.push({ artistId: target.artistId, album: { id: group.id, title: group.title, firstReleaseDate: group['first-release-date'], secondaryTypes: group['secondary-types'], releaseId: release.id, editionTitle: release.title, editionDate: release.date || null, country: release.country || null, barcode: release.barcode || null, evidenceUrls: target.evidenceUrls, tracks } });
    console.log(`${target.title}: ${tracks.length} tracks, ${group['secondary-types'].join(', ')}, edition ${release.date || 'undated'} ${release.country || ''}`);
  } catch (error) {
    failures.push({ releaseGroupId: target.releaseGroupId, error: error.message });
    console.error(`${target.title}: ${error.message}`);
  }
  await atomicJson(resolve(cacheDir, 'musicbrainz/curated.json'), { schemaVersion: 1, retrievedAt: new Date().toISOString(), records, failures });
}
console.log(JSON.stringify({ releases: records.length, tracks: records.reduce((sum, item) => sum + item.album.tracks.length, 0), failures }));

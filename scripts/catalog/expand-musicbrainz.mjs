import assert from 'node:assert/strict';
import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir, sourceJson } from './http.mjs';
import { readAlbum, resolveExpansionTarget, resolveRecordingIdentity, selectAlbumGroups, validateExpansion } from './expansion-core.mjs';

const args = process.argv.slice(2);
assert(args.every((argument) => argument === '--retry-held-identities' || /^--target=\d+$/.test(argument)), 'Unknown collector argument');
const targetArgs = args.filter((argument) => argument.startsWith('--target='));
assert(targetArgs.length <= 1, 'Specify the target only once');
const requestedTarget = targetArgs.length ? Number(targetArgs[0].split('=')[1]) : undefined;

const directory = resolve(cacheDir, 'musicbrainz');
await mkdir(directory, { recursive: true });
const checkpoint = resolve(directory, 'expansion.json');
const lockPath = resolve(directory, 'expansion.lock');
const lock = await open(lockPath, 'wx');
await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
let stopping = false;
process.on('SIGINT', () => { stopping = true; });
process.on('SIGTERM', () => { stopping = true; });
const endpoint = (kind, query = {}) => `https://musicbrainz.org/ws/2/${kind}?${new URLSearchParams({ ...query, fmt: 'json' })}`;
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));

try {
  const seeds = await json('scripts/catalog/artist-expansion-seeds.json');
  const baseline = await json('src/data/imported/musicbrainz.json');
  const exclusions = await json('scripts/catalog/metadata-exclusions.json');
  const excluded = new Set(exclusions.map((item) => item.releaseGroupId));
  let state;
  try { state = await json(checkpoint); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  state ||= {
    ...baseline, target: 500, status: 'running', startedAt: new Date().toISOString(),
    baselineArtistIds: baseline.artists.map((artist) => artist.mbid),
    discoveryRetrievedAt: seeds.retrievedAt, attempted: [], rejectedCandidates: [],
  };
  validateExpansion(state);
  state.target = resolveExpansionTarget(state.target, requestedTarget);
  assert(baseline.artists.every((artist) => state.artists.some((item) => item.mbid === artist.mbid)), 'Checkpoint would lose a published artist');
  const seen = new Set(state.artists.map((artist) => artist.mbid));
  const usedAlbums = new Set(state.artists.flatMap((artist) => artist.albums.map((album) => album.id)));
  const wikidata = new Set(state.artists.map((artist) => artist.wikidataId));
  if (process.argv.includes('--retry-held-identities')) {
    const retry = new Set(state.rejectedCandidates.filter((item) => !item.resolvedArtistMbid && (/Identity label mismatch|Duplicate\/empty album/.test(item.reason) || /No complete eligible studio album/.test(item.reason) && seeds.artists.find((seed) => seed.mbid === item.mbid)?.mbids?.length > 1)).map((item) => item.mbid));
    state.attempted = state.attempted.filter((id) => !retry.has(id));
  }
  const attempted = new Set(state.attempted);
  const save = async () => {
    state.retrievedAt = new Date().toISOString();
    state.counts = validateExpansion(state);
    await atomicJson(checkpoint, state);
  };
  state.status = 'running';
  await save();
  console.log(`Resuming ${state.counts.artistsWithReleases}/${state.target} artists with verified releases; ${attempted.size} attempted new candidates.`);
  for (const seed of seeds.artists) {
    if (stopping || state.counts.artistsWithReleases >= state.target) break;
    if (seen.has(seed.mbid) || wikidata.has(seed.wikidataId) || attempted.has(seed.mbid)) continue;
    try {
      const readEditions = async (mbid) => {
      assert(!seen.has(mbid), 'Candidate redirects to an existing artist');
      const albums = [];
      const tried = [];
      // Browse pagination is needed for long discographies; stop once one complete studio release is found.
      for (let offset = 0; offset < 1000 && !albums.length && !stopping; offset += 100) {
        const groupUrl = endpoint('release-group', { artist: mbid, type: 'album', limit: '100', offset: String(offset) });
        const response = await sourceJson(groupUrl);
        assert(Array.isArray(response['release-groups']), 'Invalid release-group response');
        const groups = selectAlbumGroups(response['release-groups'], usedAlbums, excluded, new Date().toISOString().slice(0, 10));
        for (const group of groups) {
          if (albums.length || stopping) break;
          const editions = await sourceJson(endpoint('release', { 'release-group': group.id, status: 'official', inc: 'media', limit: '100' }));
          assert(Array.isArray(editions.releases), 'Invalid release response');
          const candidates = editions.releases.filter((release) => release.status === 'Official' && release.media?.some((medium) => medium['track-count'] > 0) && !/interview|instrumental|karaoke/i.test(release.disambiguation || '')).sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.id.localeCompare(b.id));
          for (const candidate of candidates.slice(0, 3)) {
            const release = await sourceJson(endpoint(`release/${candidate.id}`, { inc: 'recordings+artist-credits' }));
            try { albums.push(readAlbum(group, release, mbid)); break; }
            catch (error) { tried.push({ releaseId: candidate.id, reason: error.message }); }
          }
        }
        if (offset + response['release-groups'].length >= response['release-group-count'] || !response['release-groups'].length) break;
      }
      return { albums, tried };
      };
      const { entity, requestedMbid, albums, tried } = await resolveRecordingIdentity(seed,
        (candidate) => sourceJson(endpoint(`artist/${candidate}`, { inc: 'aliases' })), readEditions, () => stopping);
      const artist = {
        ...seed, mbid: entity.id, requestedMbid, nameInSource: entity.name,
        entityType: entity.type, area: entity.area?.name || null,
        begin: entity['life-span']?.begin || null, end: entity['life-span']?.end || null,
        ended: entity['life-span']?.ended || false, commonsImage: null, albums,
        identitySourceUrl: endpoint(`artist/${requestedMbid}`, { inc: 'aliases' }),
        collectedAt: new Date().toISOString(), rejectedEditions: tried,
      };
      state.artists.push(artist);
      // Validate before a checkpoint is promoted even into staging.
      try { validateExpansion(state); }
      catch (error) { state.artists.pop(); throw error; }
      seen.add(artist.mbid); wikidata.add(artist.wikidataId);
      for (const album of albums) usedAlbums.add(album.id);
      for (const previous of state.rejectedCandidates) if (previous.mbid === seed.mbid) previous.resolvedArtistMbid = artist.mbid;
      console.log(`[${state.artists.filter((item) => item.albums.length > 0).length}/${state.target}] ${artist.name}: ${albums[0].title} (${albums[0].tracks.length} tracks)`);
    } catch (error) {
      if (stopping) break;
      state.rejectedCandidates.push({ mbid: seed.mbid, wikidataId: seed.wikidataId, name: seed.name, reason: error.message, at: new Date().toISOString() });
      console.log(`Candidate held: ${seed.name}: ${error.message.split('\n')[0]}`);
    }
    state.attempted.push(seed.mbid); attempted.add(seed.mbid);
    await save();
  }
  state.status = state.counts.artistsWithReleases >= state.target ? 'complete' : stopping ? 'interrupted' : 'exhausted';
  await save();
  console.log(JSON.stringify({ status: state.status, ...state.counts, heldCandidates: state.rejectedCandidates.filter((item) => !item.resolvedArtistMbid).length }));
} finally {
  await lock.close();
  await unlink(lockPath);
}

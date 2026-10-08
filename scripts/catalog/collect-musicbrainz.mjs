import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { ARTISTS } from '../../src/data/mockData.ts';
import { atomicJson, cacheDir, sourceJson } from './http.mjs';

// Identity is resolved by the Wikipedia article's Wikidata MusicBrainz ID, not a fuzzy name match.
const additions = [
  ['The Beatles', 'The Beatles', 'Rock'], ['The Rolling Stones', 'The Rolling Stones', 'Rock'],
  ['Fleetwood Mac', 'Fleetwood Mac', 'Rock'], ['David Bowie', 'David Bowie', 'Art rock'],
  ['Queen', 'Queen (band)', 'Rock'], ['Stevie Wonder', 'Stevie Wonder', 'Soul'],
  ['Aretha Franklin', 'Aretha Franklin', 'Soul'], ['Joni Mitchell', 'Joni Mitchell', 'Folk'],
  ['Prince', 'Prince (musician)', 'Funk'], ['Bob Dylan', 'Bob Dylan', 'Folk'],
  ['Nina Simone', 'Nina Simone', 'Jazz'], ['Elton John', 'Elton John', 'Pop'],
  ['Radiohead', 'Radiohead', 'Alternative rock'], ['Oasis', 'Oasis (band)', 'Britpop'],
  ['Blur', 'Blur (band)', 'Britpop'], ['Nirvana', 'Nirvana (band)', 'Grunge'],
  ['The Cure', 'The Cure', 'Post-punk'], ['R.E.M.', 'R.E.M.', 'Alternative rock'],
  ['Tracy Chapman', 'Tracy Chapman', 'Folk'], ['Kate Bush', 'Kate Bush', 'Art pop'],
  ['Frank Ocean', 'Frank Ocean', 'R&B'], ['Lana Del Rey', 'Lana Del Rey', 'Alternative pop'],
  ['Amy Winehouse', 'Amy Winehouse', 'Soul'], ['Bruce Springsteen', 'Bruce Springsteen', 'Rock'],
  ['Tom Lehrer', 'Tom Lehrer', 'Musical satire'],
];
const wikiNames = { 'Beyonce': 'Beyoncé', 'Beach Boys': 'The Beach Boys', 'SZA': 'SZA', 'AC/DC': 'AC/DC' };
const seeds = [
  ...ARTISTS.filter((artist) => artist.name !== 'The Midnight Echo').map((artist) => ({ name: artist.name, wikipedia: wikiNames[artist.name] || artist.name, genres: artist.genres, existingId: artist.id, existingAlbums: artist.albums.map((album) => album.title) })),
  ...additions.map(([name, wikipedia, genre]) => ({ name, wikipedia, genres: [genre], existingId: null, existingAlbums: [] })),
];
const normalize = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const endpoint = (kind, query) => `https://musicbrainz.org/ws/2/${kind}?${new URLSearchParams({ ...query, fmt: 'json' })}`;
const artists = [];
const failures = [];
const quarantined = JSON.parse(await readFile('scripts/catalog/metadata-exclusions.json', 'utf8'));
await mkdir(resolve(cacheDir, 'musicbrainz'), { recursive: true });
await atomicJson(resolve(cacheDir, 'musicbrainz/seeds.json'), seeds);
for (const seed of seeds) {
  try {
    const wikipedia = await sourceJson(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', titles: seed.wikipedia, prop: 'pageprops|pageimages', piprop: 'name', redirects: '1', format: 'json' })}`);
    const page = Object.values(wikipedia.query.pages)[0];
    const wikidataId = page.pageprops?.wikibase_item;
    if (!wikidataId) throw new Error('No unambiguous Wikidata entity.');
    const entities = await sourceJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json`);
    const claims = entities.entities[wikidataId].claims;
    const mbids = claims.P434?.filter((claim) => claim.rank !== 'deprecated').sort((left, right) => Number(right.rank === 'preferred') - Number(left.rank === 'preferred')).map((claim) => claim.mainsnak.datavalue?.value).filter(Boolean);
    if (!mbids?.length) throw new Error('Missing MusicBrainz identity.');
    let data;
    for (const candidate of mbids) {
      const entity = await sourceJson(endpoint(`artist/${candidate}`, {}));
      if (normalize(entity.name).replace(/^the/, '') === normalize(seed.name).replace(/^the/, '')) { data = entity; break; }
    }
    if (!data) throw new Error('No matching primary MusicBrainz artist identity.');
    const mbid = data.id;
    const groupData = await sourceJson(endpoint('release-group', { artist: mbid, type: 'album', limit: '100' }));
    const groups = groupData['release-groups'].filter((group) => group['primary-type'] === 'Album' && !group['secondary-types'].length && /^\d{4}/.test(group['first-release-date']) && !seed.existingAlbums.some((title) => normalize(title) === normalize(group.title))).sort((left, right) => left['first-release-date'].localeCompare(right['first-release-date']));
    const albums = [];
    for (const group of groups) {
      if (albums.length >= 3) break;
      if (quarantined.some((item) => item.releaseGroupId === group.id)) continue;
      const releases = await sourceJson(endpoint('release', { 'release-group': group.id, status: 'official', inc: 'media', limit: '100' }));
      const candidates = releases.releases.filter((release) => release.status === 'Official' && release.media?.some((medium) => medium['track-count'] > 0) && !/interview|instrumental|karaoke/i.test(release.disambiguation || ''));
      candidates.sort((left, right) => (left.date || '9999').localeCompare(right.date || '9999') || Number(!['US', 'GB'].includes(left.country)) - Number(!['US', 'GB'].includes(right.country)) || left.id.localeCompare(right.id));
      if (!candidates.length) continue;
      const release = await sourceJson(endpoint(`release/${candidates[0].id}`, { inc: 'recordings+artist-credits' }));
      if (release['artist-credit'][0]?.artist?.id !== mbid) continue;
      const tracks = release.media.flatMap((medium) => (medium.tracks || []).map((track) => ({ id: track.id, recordingId: track.recording?.id, title: track.title, position: track.position, disc: medium.position, number: track.number, lengthMs: track.length || track.recording?.length || null, artistCredit: (track['artist-credit'] || release['artist-credit']).map((credit) => credit.name).join(' / ') })));
      if (!tracks.length) continue;
      albums.push({ id: group.id, title: group.title, firstReleaseDate: group['first-release-date'], releaseId: release.id, editionTitle: release.title, editionDate: release.date || null, country: release.country || null, barcode: release.barcode || null, tracks });
      console.log(`${seed.name}: ${group.title} (${tracks.length} tracks)`);
    }
    artists.push({ ...seed, mbid, wikidataId, wikipedia: page.title, commonsImage: page.pageimage || null, nameInSource: data.name, entityType: data.type, area: data.area?.name || null, begin: data['life-span'].begin, end: data['life-span'].end, ended: data['life-span'].ended, albums });
  } catch (error) {
    failures.push({ name: seed.name, error: error.message });
    console.error(`Skipped ${seed.name}: ${error.message}`);
  }
  await atomicJson(resolve(cacheDir, 'musicbrainz/batch.json'), { schemaVersion: 1, provider: 'MusicBrainz', license: 'CC0-1.0', licenseUrl: 'https://musicbrainz.org/doc/About/Data_License', retrievedAt: new Date().toISOString(), artists, failures });
}
console.log(JSON.stringify({ artists: artists.length, albums: artists.reduce((sum, artist) => sum + artist.albums.length, 0), songs: artists.flatMap((artist) => artist.albums.flatMap((album) => album.tracks)).length, failures }));

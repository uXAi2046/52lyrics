import assert from 'node:assert/strict';

export const isMbid = (value) => typeof value === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(value);
/** Raising a completed checkpoint's target must preserve its records and attempted candidates. */
export function resolveExpansionTarget(current = 500, requested = current) {
  assert(Number.isSafeInteger(current) && current >= 500, 'Invalid checkpoint target');
  assert(Number.isSafeInteger(requested) && requested >= current, 'Target must be an integer and must not decrease');
  return requested;
}
const identityText = (value) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').replace(/^the/, '');

export function validateArtistIdentity(seed, entity) {
  assert(isMbid(entity.id), 'Invalid canonical MusicBrainz ID');
  assert(['Person', 'Group'].includes(entity.type), `Not a recording person/group: ${entity.type}`);
  if (seed.selectionKind === 'singers') assert.equal(entity.type, 'Person', 'Singer identity points to a group');
  if (seed.selectionKind === 'groups') assert.equal(entity.type, 'Group', 'Group identity points to a person');
  const names = [entity.name, ...(entity.aliases || []).map((alias) => alias.name)].filter(Boolean);
  assert(names.some((name) => identityText(name) === identityText(seed.name)), `Identity label mismatch: ${seed.name} / ${entity.name}`);
}

/** A matching writer/person identity may have no artist releases; try the other source-linked identities. */
export async function resolveRecordingIdentity(seed, readIdentity, readEditions, shouldStop = () => false) {
  const rejected = [];
  for (const requestedMbid of new Set(seed.mbids || [seed.mbid])) {
    if (shouldStop()) break;
    try {
      const entity = await readIdentity(requestedMbid);
      validateArtistIdentity(seed, entity);
      const { albums, tried } = await readEditions(entity.id);
      assert(albums.length, 'No complete eligible studio album found');
      return { entity, requestedMbid, albums, tried, rejected };
    } catch (error) { rejected.push({ mbid: requestedMbid, reason: error.message }); }
  }
  throw new Error(`No eligible source-linked recording identity: ${rejected.map((item) => `${item.mbid}: ${item.reason}`).join('; ')}`);
}

export function selectAlbumGroups(groups, usedAlbums, excluded, today) {
  return groups.filter((group) => group['primary-type'] === 'Album' && !group['secondary-types']?.length && /^\d{4}/.test(group['first-release-date']) && group['first-release-date'] <= today && !excluded.has(group.id) && !usedAlbums.has(group.id)).sort((a, b) => a['first-release-date'].localeCompare(b['first-release-date']) || a.id.localeCompare(b.id));
}

/** Require the complete source edition, never silently accept missing discs/tracks. */
export function readAlbum(group, release, mbid) {
  assert(isMbid(group.id) && isMbid(release.id), 'Invalid release identity');
  assert.equal(release.status, 'Official', 'Not an official edition');
  assert.equal(release['artist-credit']?.[0]?.artist?.id, mbid, 'Wrong primary release artist');
  assert(release.media?.length, 'Missing release media');
  const tracks = release.media.flatMap((medium) => {
    assert(Number.isInteger(medium.position) && medium.position > 0, 'Invalid disc position');
    assert(Array.isArray(medium.tracks) && medium.tracks.length > 0 && medium.tracks.length === medium['track-count'], 'Incomplete source medium');
    return medium.tracks.map((track, index) => {
      assert(isMbid(track.id) && isMbid(track.recording?.id) && track.title?.trim(), 'Incomplete source track');
      assert.equal(track.position, index + 1, 'Nonsequential source tracks');
      return {
        id: track.id, recordingId: track.recording.id, title: track.title,
        position: track.position, disc: medium.position, number: track.number,
        lengthMs: track.length ?? track.recording.length ?? null,
        artistCredit: (track['artist-credit'] || release['artist-credit']).map((credit) => credit.name).join(' / '),
      };
    });
  });
  assert.equal(new Set(tracks.map((track) => track.id)).size, tracks.length, 'Duplicate edition tracks');
  return {
    id: group.id, title: group.title, firstReleaseDate: group['first-release-date'],
    releaseId: release.id, editionTitle: release.title, editionDate: release.date || null,
    country: release.country || null, barcode: release.barcode || null, tracks,
  };
}

export function validateExpansion(state) {
  assert.equal(state.schemaVersion, 1);
  assert.equal(state.provider, 'MusicBrainz');
  assert.equal(state.license, 'CC0-1.0');
  const identities = new Set();
  const wikidata = new Set();
  const albums = new Set();
  const tracks = new Set();
  for (const artist of state.artists) {
    assert(isMbid(artist.mbid) && !identities.has(artist.mbid), `Duplicate/invalid artist: ${artist.name}`);
    assert(/^Q\d+$/.test(artist.wikidataId) && !wikidata.has(artist.wikidataId), `Duplicate/invalid Wikidata identity: ${artist.name}`);
    assert(['Person', 'Group'].includes(artist.entityType), `Invalid artist: ${artist.name}`);
    assert(artist.albums.length > 0 || state.baselineArtistIds?.includes(artist.mbid), `Empty new artist: ${artist.name}`);
    identities.add(artist.mbid); wikidata.add(artist.wikidataId);
    for (const album of artist.albums) {
      assert(isMbid(album.id) && !albums.has(album.id) && album.tracks.length > 0, 'Duplicate/empty album');
      albums.add(album.id);
      for (const track of album.tracks) {
        assert(isMbid(track.id) && isMbid(track.recordingId) && !tracks.has(track.id) && track.title.trim(), 'Duplicate/invalid track');
        tracks.add(track.id);
      }
    }
  }
  return { artists: identities.size, artistsWithReleases: state.artists.filter((artist) => artist.albums.length > 0).length, albums: albums.size, tracks: tracks.size };
}

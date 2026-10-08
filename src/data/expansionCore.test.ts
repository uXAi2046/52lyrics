import { describe, expect, it } from 'vitest';
import exclusions from '../../scripts/catalog/metadata-exclusions.json';
// The collector module is also exercised without network requests.
import { readAlbum, resolveExpansionTarget, resolveRecordingIdentity, selectAlbumGroups, validateArtistIdentity, validateExpansion } from '../../scripts/catalog/expansion-core.mjs';

const mbid = (index: number) => `00000000-0000-0000-0000-${String(index).padStart(12, '0')}`;
const artistId = mbid(1);
const group = { id: mbid(2), title: 'Test edition', 'first-release-date': '2000' };
const release = () => ({
  id: mbid(3), title: group.title, status: 'Official',
  'artist-credit': [{ name: 'Test artist', artist: { id: artistId } }],
  media: [{ position: 1, 'track-count': 1, tracks: [{ id: mbid(4), title: 'Test track', position: 1, number: '1', recording: { id: mbid(5) } }] }],
});

describe('incremental artist collection admission', () => {
  it('resumes the existing target or explicitly raises it without allowing a lower or invalid target', () => {
    expect(resolveExpansionTarget()).toBe(500);
    expect(resolveExpansionTarget(600)).toBe(600);
    expect(resolveExpansionTarget(500, 600)).toBe(600);
    for (const target of [499, 599.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
      expect(() => resolveExpansionTarget(600, target)).toThrow();
    }
    expect(() => resolveExpansionTarget(0, 600)).toThrow();
  });
  it('does not admit reviewed radio/comedy recordings when the source omits their secondary type', () => {
    const spoken = [
      { id: 'eae010fe-04f1-4eaa-9bbd-0bb3f793bc3d', title: 'The Quick and the Dead - Volume 1: The Atom Bomb', 'first-release-date': '1950' },
      { id: '66e88896-b5dd-48cf-92bb-371de5e931ba', title: 'Laughs, Luck ... and Lucy', 'first-release-date': '1996' },
    ].map((item) => ({ ...item, 'primary-type': 'Album', 'secondary-types': [] }));
    expect(selectAlbumGroups(spoken, new Set(), new Set(exclusions.map((item) => item.releaseGroupId)), '2026-09-08')).toEqual([]);
  });
  it('tries the recording persona when a matching legal-name identity has no eligible releases', async () => {
    const seed = { name: 'Tupac Shakur', mbids: [mbid(10), mbid(11)] };
    const identity = async (id: string) => ({ id, type: 'Person', name: id === mbid(10) ? 'Tupac Shakur' : '2Pac', aliases: [{ name: 'Tupac Shakur' }] });
    const editions = async (id: string) => ({ albums: id === mbid(10) ? [] : [readAlbum(group, release(), artistId)], tried: [] });
    const result = await resolveRecordingIdentity(seed, identity, editions);
    expect(result.requestedMbid).toBe(mbid(11));
    expect(result.entity.name).toBe('2Pac');
    expect(result.rejected).toHaveLength(1);
    expect(result.rejected[0].reason).toContain('No complete eligible');
  });

  it('skips an already cataloged collaboration and continues to the next eligible album', () => {
    const shared = { ...group, 'primary-type': 'Album', 'secondary-types': [] };
    const solo = { ...shared, id: mbid(8), 'first-release-date': '2001' };
    const future = { ...shared, id: mbid(9), 'first-release-date': '2099' };
    expect(selectAlbumGroups([future, shared, solo], new Set([shared.id]), new Set(), '2026-09-08')).toEqual([solo]);
    expect(selectAlbumGroups([solo], new Set(), new Set([solo.id]), '2026-09-08')).toEqual([]);
  });
  it('accepts primary names or documented aliases, not a fuzzy lookalike', () => {
    expect(() => validateArtistIdentity({ name: 'Beyoncé' }, { id: artistId, name: 'Beyonce', type: 'Person' })).not.toThrow();
    expect(() => validateArtistIdentity({ name: 'Stage Name' }, { id: artistId, name: 'Primary Name', aliases: [{ name: 'Stage Name' }], type: 'Person' })).not.toThrow();
    expect(() => validateArtistIdentity({ name: 'Queen' }, { id: artistId, name: 'Queens', type: 'Group' })).toThrow(/mismatch/);
    expect(() => validateArtistIdentity({ name: 'Character' }, { id: artistId, name: 'Character', type: 'Character' })).toThrow(/person\/group/);
    expect(() => validateArtistIdentity({ name: 'Same Name', selectionKind: 'singers' }, { id: artistId, name: 'Same Name', type: 'Group' })).toThrow(/points to a group/);
  });

  it('requires a complete official edition credited to this artist', () => {
    expect(readAlbum(group, release(), artistId).tracks).toHaveLength(1);
    const incomplete = release(); incomplete.media[0]['track-count'] = 2;
    expect(() => readAlbum(group, incomplete, artistId)).toThrow(/Incomplete/);
    expect(() => readAlbum(group, release(), mbid(99))).toThrow(/Wrong primary/);
    const unofficial = release(); unofficial.status = 'Bootleg';
    expect(() => readAlbum(group, unofficial, artistId)).toThrow(/official/);
    const missingRecording = release(); missingRecording.media[0].tracks[0].recording.id = '';
    expect(() => readAlbum(group, missingRecording, artistId)).toThrow(/Incomplete/);
  });

  it('does not count preserved empty profiles toward the content target or permit duplicate identities', () => {
    const artist = { name: 'Test artist', mbid: artistId, wikidataId: 'Q1', entityType: 'Person', albums: [readAlbum(group, release(), artistId)] };
    const empty = { ...artist, mbid: mbid(10), wikidataId: 'Q2', albums: [] };
    const state = { schemaVersion: 1, provider: 'MusicBrainz', license: 'CC0-1.0', artists: [artist, empty], baselineArtistIds: [empty.mbid] };
    expect(validateExpansion(state)).toMatchObject({ artists: 2, artistsWithReleases: 1, albums: 1, tracks: 1 });
    expect(() => validateExpansion({ ...state, baselineArtistIds: [] })).toThrow(/Empty new/);
    expect(() => validateExpansion({ ...state, artists: [artist, artist] })).toThrow(/Duplicate/);
    expect(() => validateExpansion({ ...state, artists: [artist, { ...empty, wikidataId: artist.wikidataId }] })).toThrow(/Wikidata/);
  });
});

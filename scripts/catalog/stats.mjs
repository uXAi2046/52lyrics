import { ARTISTS, ALBUMS, SONGS, FULL_LYRIC_SONGS, FULL_LYRIC_WORKS, PUBLIC_DOMAIN_SONGS } from '../../src/data/catalog.ts';
import { normalizeCatalogText } from '../../src/data/normalize.ts';
import images from '../../src/data/imported/commons.json' with { type: 'json' };
import metadata from '../../src/data/imported/musicbrainz.json' with { type: 'json' };
import sources from '../../src/data/imported/lehrer-sources.json' with { type: 'json' };
import holds from '../../src/data/imported/lehrer-rights-holds.json' with { type: 'json' };
import profiles from '../../src/data/imported/artist-profiles.json' with { type: 'json' };
import candidates from '../../src/data/imported/pd-candidates.json' with { type: 'json' };

// Catalog statistics. Song/lyrics counts are reported both as pages (catalog
// entries, including duplicate releases) and as distinct works. Metadata-only
// entries are never counted as lyrics progress.

const approvedUrls = new Set(FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer').map((song) => song.source.url));
const heldSlugs = new Set(holds.map((hold) => hold.sourceSlug));

const fullBySource = {};
const fullByRights = {};
for (const song of FULL_LYRIC_SONGS) {
  const provider = song.source?.provider ?? 'Original';
  fullBySource[provider] = (fullBySource[provider] ?? 0) + 1;
  fullByRights[song.rights] = (fullByRights[song.rights] ?? 0) + 1;
}
const worksBySource = {};
for (const song of FULL_LYRIC_WORKS) {
  const provider = song.source?.provider ?? 'Original';
  worksBySource[provider] = (worksBySource[provider] ?? 0) + 1;
}

const candidateStatus = {};
for (const record of candidates.records) candidateStatus[record.status] = (candidateStatus[record.status] ?? 0) + 1;
const approvedCandidates = candidates.records.filter((record) => record.status === 'approved');
const holdCandidates = candidates.records.filter((record) => record.status === 'hold' || record.status === 'needs-review');

console.log(JSON.stringify({
  songPages: SONGS.length,
  uniqueArtistAndTitlePairs: new Set(SONGS.map((song) => `${song.artistId}:${normalizeCatalogText(song.title)}`)).size,
  lyricPages: {
    fullLyricPages: FULL_LYRIC_SONGS.length,
    metadataOnlyPages: SONGS.length - FULL_LYRIC_SONGS.length,
  },
  fullLyricWorks: FULL_LYRIC_WORKS.length,
  fullLyricPagesBySource: fullBySource,
  fullLyricPagesByRights: fullByRights,
  fullLyricWorksBySource: worksBySource,
  pipeline: {
    source: 'src/data/imported/pd-candidates.json',
    candidates: candidates.records.length,
    ...candidateStatus,
    approvedWorks: new Set(approvedCandidates.map((record) => record.workKey)).size,
    holdsAndReviews: holdCandidates.length,
  },
  artistsAndWriters: ARTISTS.length,
  sourcedRecordingArtists: metadata.artists.length,
  artistsWithImportedReleases: metadata.artists.filter((artist) => artist.albums.length > 0).length,
  sourcedArtistProfiles: profiles.records.length,
  albumsAndSongbooks: ALBUMS.length,
  publicDomainPages: PUBLIC_DOMAIN_SONGS.length,
  downloadedPhotographs: images.records.length,
  artistsWithPhotographs: ARTISTS.filter((artist) => artist.imageCredit).length,
  authorPdfSources: sources.songs.length,
  reviewedAuthorWorks: FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer').length,
  heldAuthorSources: sources.songs.filter((source) => heldSlugs.has(source.slug)).length,
  pendingAuthorSources: sources.songs.filter((source) => !heldSlugs.has(source.slug) && !approvedUrls.has(source.sourceUrl)).length,
}, null, 2));

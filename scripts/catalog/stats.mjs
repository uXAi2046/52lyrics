import { ARTISTS, ALBUMS, SONGS, FULL_LYRIC_SONGS, FULL_LYRIC_WORKS } from '../../src/data/catalog.ts';
import { normalizeCatalogText } from '../../src/data/normalize.ts';
import images from '../../src/data/imported/commons.json' with { type: 'json' };
import metadata from '../../src/data/imported/musicbrainz.json' with { type: 'json' };
import sources from '../../src/data/imported/lehrer-sources.json' with { type: 'json' };
import holds from '../../src/data/imported/lehrer-rights-holds.json' with { type: 'json' };
import profiles from '../../src/data/imported/artist-profiles.json' with { type: 'json' };

const approvedUrls = new Set(FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer').map((song) => song.source.url));
const heldSlugs = new Set(holds.map((hold) => hold.sourceSlug));

console.log(JSON.stringify({
  artistsAndWriters: ARTISTS.length,
  sourcedRecordingArtists: metadata.artists.length,
  artistsWithImportedReleases: metadata.artists.filter((artist) => artist.albums.length > 0).length,
  sourcedArtistProfiles: profiles.records.length,
  albumsAndSongbooks: ALBUMS.length,
  songEntries: SONGS.length,
  uniqueArtistAndTitlePairs: new Set(SONGS.map((song) => `${song.artistId}:${normalizeCatalogText(song.title)}`)).size,
  fullLyricEntries: FULL_LYRIC_SONGS.length,
  fullLyricWorks: FULL_LYRIC_WORKS.length,
  downloadedPhotographs: images.records.length,
  artistsWithPhotographs: ARTISTS.filter((artist) => artist.imageCredit).length,
  authorPdfSources: sources.songs.length,
  reviewedAuthorWorks: FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer').length,
  heldAuthorSources: sources.songs.filter((source) => heldSlugs.has(source.slug)).length,
  pendingAuthorSources: sources.songs.filter((source) => !heldSlugs.has(source.slug) && !approvedUrls.has(source.sourceUrl)).length,
}, null, 2));

import type { Album, Artist, MetadataSource, Song } from '../types';
import batch from './imported/musicbrainz.json';
import images from './imported/commons.json';
import { buildImageUrl, slugify } from './mockData';
import { withReviewedLyrics } from './reviewedLyrics';
import { artistProfilesByIdentity } from './artistProfiles';

export const IMAGE_CREDITS = images.records;
// The baseline timestamp is optional in pre-expansion snapshots, not tied to JSON inference.
const snapshotDates: { retrievedAt: string; baselineRetrievedAt?: string } = batch;
const baselineRetrievedAt = snapshotDates.baselineRetrievedAt ?? snapshotDates.retrievedAt;
const source = (entity: string, edition?: string, retrievedAt = batch.retrievedAt): MetadataSource => ({
  provider: 'MusicBrainz', url: `https://musicbrainz.org/${entity}`, license: 'CC0-1.0',
  retrievedAt: retrievedAt.slice(0, 10), ...(edition ? { edition } : {}),
});
const duration = (milliseconds: number | null) => {
  if (!milliseconds) return '';
  const seconds = Math.round(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};

/** Preserve existing IDs and reading links; newly sourced releases get stable external IDs. */
export function withExternalCatalog(baseArtists: Artist[], baseAlbums: Album[]) {
  const artists = baseArtists.map((artist) => ({ ...artist, albums: [...artist.albums], topSongs: [...artist.topSongs] }));
  const albums = [...baseAlbums];
  const usedSlugs = new Set(artists.map((artist) => artist.slug));
  for (const record of batch.artists) {
    const retrievedAt = 'collectedAt' in record && typeof record.collectedAt === 'string' ? record.collectedAt : baselineRetrievedAt;
    const profile = artistProfilesByIdentity.get(record.wikidataId);
    if (profile && profile.mbid !== record.mbid) throw new Error(`Profile belongs to a different recording identity: ${record.name}`);
    // Names are not identities: distinct artists can legitimately share a stage name.
    let artist = artists.find((candidate) => candidate.id === (record.existingId || `mb-artist-${record.mbid}`));
    if (!artist) {
      const preferredSlug = slugify(record.name);
      const slug = preferredSlug && !usedSlugs.has(preferredSlug) ? preferredSlug : `${preferredSlug || 'artist'}-${record.mbid}`;
      usedSlugs.add(slug);
      const genres = record.genres.length ? record.genres : profile?.genres.map((genre) => genre.name) || [];
      const sourceSummary = profile?.description ? `${record.nameInSource}: ${profile.description}${/[.!?]$/.test(profile.description) ? '' : '.'}` : `${record.nameInSource} is a ${record.entityType === 'Person' ? 'recording artist' : 'music group'}${record.area ? ` associated with ${record.area}` : ''}.`;
      artist = {
        id: `mb-artist-${record.mbid}`, slug, name: record.name,
        genres, entityType: record.entityType === 'Person' ? 'Person' : 'MusicGroup',
        timelineLabel: record.entityType === 'Person' ? 'Lifespan' : 'Formed',
        activeYears: record.begin ? `${record.begin.slice(0, 4)}${record.end ? `–${record.end.slice(0, 4)}` : record.entityType === 'Person' ? '–' : ''}` : 'Date not supplied',
        location: record.area || 'Location not supplied',
        biography: `${sourceSummary} Explore the sourced release editions and their complete track sequences below. ${record.genres.length ? 'Genre labels are 52lyrics editorial categories' : profile?.genres.length ? 'Genre labels follow Wikidata' : 'No genre labels are supplied'}; release facts are credited to MusicBrainz.`,
        ...(profile && (profile.description || !record.genres.length && profile.genres.length) ? { profileSource: { provider: 'Wikidata' as const, url: profile.sourceUrl, license: 'CC0-1.0' as const, retrievedAt: profile.retrievedAt.slice(0, 10) } } : {}),
        songCount: 0, imageUrl: buildImageUrl(record.name), albums: [], topSongs: [],
        seoDescription: `Explore ${record.name}: sourced album editions, track lists, song information, and local saving.`,
      };
      artists.push(artist);
    }
    artist.metadataSource = source(`artist/${record.mbid}`, undefined, retrievedAt);
    artist.alternateNames = record.nameInSource !== record.name ? [record.nameInSource] : [];
    artist.entityType = record.entityType === 'Person' ? 'Person' : 'MusicGroup';
    for (const release of record.albums) {
      const albumId = `mb-album-${release.id}`;
      const albumTitle = release.title;
      // Short MBID suffix distinguishes identically titled editions and symbolic album titles.
      const albumSlug = `${artist.slug}-${slugify(albumTitle) || 'album'}-${release.id.slice(0, 8)}`;
      const coverUrl = buildImageUrl(`${artist.name} ${albumTitle}`);
      const releaseTypes = 'secondaryTypes' in release && Array.isArray(release.secondaryTypes) ? release.secondaryTypes as string[] : [];
      const edition = [release.editionTitle, ...releaseTypes, release.editionDate, release.country].filter(Boolean).join(' · ');
      const tracks: Song[] = release.tracks.map((track, index): Song => ({
        id: `mb-song-${track.id}`, slug: `${artist.slug}-${slugify(track.title) || 'track'}-${track.id.slice(0, 8)}`,
        title: track.title, artistId: artist.id, artistName: artist.name, albumId, albumTitle,
        duration: duration(track.lengthMs), trackNumber: index + 1, discNumber: track.disc, discTrackNumber: track.position,
        lyrics: '', sections: [], lyricsAvailability: 'metadata-only', rights: 'unavailable',
        writers: [], producers: [], copyright: 'Lyrics and recording rights remain with their respective owners. No lyric text is reproduced.',
        genres: artist.genres, coverUrl, releaseYear: Number(release.firstReleaseDate.slice(0, 4)), releaseDate: release.firstReleaseDate,
        description: `${track.title} is included on ${albumTitle} by ${artist.name}.`,
        about: `This entry documents disc ${track.disc}, track ${track.number} of the sourced release edition: ${edition}. The recording artist credit is ${track.artistCredit}.`,
        themes: ['Album archive', `${release.firstReleaseDate.slice(0, 3)}0s`], moods: [],
        editorialNotes: [track.lengthMs ? `The source lists a running time of ${duration(track.lengthMs)} for this track.` : 'A track duration was not supplied by the source.', 'Songwriter and producer credits are not supplied in this import. The abstract cover is a 52lyrics catalog illustration, not the original album sleeve.'],
        seoDescription: `${track.title} by ${artist.name}: ${albumTitle} release details, track position, source links, and related songs.`,
        metadataSource: source(`recording/${track.recordingId}`, edition, retrievedAt),
      })).map(withReviewedLyrics);
      const album: Album = {
        id: albumId, slug: albumSlug, title: albumTitle, artistId: artist.id, artistName: artist.name,
        releaseDate: release.firstReleaseDate, year: Number(release.firstReleaseDate.slice(0, 4)),
        trackCount: tracks.length, coverUrl, tracks, type: 'Album',
        seoDescription: `${albumTitle} by ${artist.name}. ${tracks.length} tracks from a documented MusicBrainz release edition. Dates and bonus tracks may differ across editions.`,
        metadataSource: source(`release/${release.releaseId}`, edition, retrievedAt),
      };
      albums.push(album);
      artist.albums.push(album);
    }
    artist.songCount = artist.albums.reduce((sum, album) => sum + album.tracks.length, 0);
    if (!artist.topSongs.length) artist.topSongs = artist.albums.flatMap((album) => album.tracks).slice(0, 5);
  }
  for (const artist of artists) {
    const identity = batch.artists.find((record) => artist.metadataSource?.url === `https://musicbrainz.org/artist/${record.mbid}`);
    const photo = identity && images.records.find((record) => record.wikidataId === identity.wikidataId);
    if (photo) {
      artist.imageUrl = photo.localPath;
      artist.imageCredit = { author: photo.author, sourceUrl: photo.sourceUrl, license: photo.license, licenseUrl: photo.licenseUrl, attribution: photo.attribution };
    }
  }
  return { artists, albums };
}

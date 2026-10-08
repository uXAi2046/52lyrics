import type { Album, Artist, CatalogItemRef, Song } from '../types';
import { ALBUMS as BASE_ALBUMS, ARTISTS as BASE_ARTISTS, HOT_SONGS, slugify } from './mockData';
import { PUBLIC_DOMAIN_ALBUMS, PUBLIC_DOMAIN_ARTISTS } from './publicDomain';
import { withExternalCatalog } from './externalCatalog';
import { normalizeCatalogText } from './normalize';
import { createAuthorSongbook } from './authorSongbook';

export { HOT_SONGS, slugify };
const external = withExternalCatalog(BASE_ARTISTS, BASE_ALBUMS);
const authorSongbook = createAuthorSongbook(external.artists);
export const ALBUMS = [...external.albums, ...PUBLIC_DOMAIN_ALBUMS, ...(authorSongbook ? [authorSongbook] : [])];
export const ARTISTS = [...external.artists.map((artist) => authorSongbook?.artistId === artist.id
  ? { ...artist, albums: [...artist.albums, authorSongbook], songCount: artist.songCount + authorSongbook.trackCount }
  : artist), ...PUBLIC_DOMAIN_ARTISTS];
export const MOCK_DATA = { albums: ALBUMS, artists: ARTISTS, hotSongs: HOT_SONGS };

export const SONGS: Song[] = ALBUMS.flatMap((album) => album.tracks);
export const FULL_LYRIC_SONGS = SONGS.filter((song) => song.lyricsAvailability === 'full');
export const FULL_LYRIC_WORKS = FULL_LYRIC_SONGS.filter((song, index, all) => all.findIndex((other) => other.artistId === song.artistId && normalizeCatalogText(other.title) === normalizeCatalogText(song.title)) === index);
export const PUBLIC_DOMAIN_SONGS = SONGS.filter((song) => song.rights === 'public-domain');
export const HISTORICAL_SONGS = PUBLIC_DOMAIN_SONGS.filter((song) => song.source?.provider === 'Wikisource');

// ID and canonical lookups must not scan a growing catalog for every rendered card/track.
const artistIds = new Map(ARTISTS.map((item) => [item.id, item]));
const artistSlugs = new Map(ARTISTS.map((item) => [item.slug, item]));
const albumIds = new Map(ALBUMS.map((item) => [item.id, item]));
const albumSlugs = new Map(ALBUMS.map((item) => [item.slug, item]));
const songIds = new Map(SONGS.map((item) => [item.id, item]));
const songSlugs = new Map(SONGS.map((item) => [item.slug, item]));

export const findArtist = (value?: string) =>
  artistIds.get(value) || artistSlugs.get(value);

export const findAlbum = (value?: string) =>
  albumIds.get(value) || albumSlugs.get(value);

export const findSong = (value?: string) =>
  songIds.get(value) || songSlugs.get(value);

export const artistPath = (artist: Pick<Artist, 'slug'>) => `/artists/${artist.slug}`;
export const albumPath = (album: Pick<Album, 'slug'>) => `/albums/${album.slug}`;
export const songPath = (song: Pick<Song, 'slug'>) => `/lyrics/${song.slug}`;

export const resolveCatalogItem = (ref: CatalogItemRef) => {
  if (ref.type === 'artist') return findArtist(ref.id);
  if (ref.type === 'album') return findAlbum(ref.id);
  return findSong(ref.id);
};

export const catalogItemPath = (ref: CatalogItemRef) => {
  const item = resolveCatalogItem(ref);
  if (!item) return '/discover';
  if (ref.type === 'artist') return artistPath(item as Artist);
  if (ref.type === 'album') return albumPath(item as Album);
  return songPath(item as Song);
};

export const assertCatalogIntegrity = () => {
  const ids = [...ARTISTS, ...ALBUMS, ...SONGS].map((item) => item.id);
  if (new Set(ids).size !== ids.length) throw new Error('Catalog IDs must be unique.');
  [ARTISTS, ALBUMS, SONGS].forEach((items) => {
    const slugs = items.map((item) => item.slug);
    if (new Set(slugs).size !== slugs.length) throw new Error('Catalog slugs must be unique within a content type.');
  });

  SONGS.forEach((song) => {
    if (!findArtist(song.artistId) || !findAlbum(song.albumId)) {
      throw new Error(`Broken catalog reference for ${song.title}.`);
    }
    if (song.lyricsAvailability === 'full' && (!['original', 'licensed', 'public-domain'].includes(song.rights) || !song.lyrics || !song.sections.length)) {
      throw new Error(`Full lyrics require explicit rights for ${song.title}.`);
    }
    if (song.rights === 'public-domain' && (!song.source?.revisionUrl || !song.source.evidenceUrl || song.source.license !== 'Public domain')) {
      throw new Error(`Public-domain lyrics require provenance: ${song.title}.`);
    }
    const album = findAlbum(song.albumId)!;
    if (album.artistId !== song.artistId || !album.tracks.some((track) => track.id === song.id)) throw new Error(`Inconsistent songbook: ${song.title}.`);
    if (song.lyricsAvailability === 'metadata-only' && (song.lyrics || song.sections.length)) {
      throw new Error(`Metadata-only song contains lyric content: ${song.title}.`);
    }
    if (/^https?:\/\//.test(song.coverUrl)) {
      throw new Error(`Remote artwork is not allowed: ${song.title}.`);
    }
  });
};

assertCatalogIntegrity();

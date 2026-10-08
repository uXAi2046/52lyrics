import type { SearchResults } from '../types';
import { ALBUMS, ARTISTS, SONGS, findArtist } from './catalog';
import { normalizeCatalogText as normalize } from './normalize';

export type SearchType = 'all' | 'songs' | 'artists' | 'albums';

const score = (query: string, values: string[]) => {
  let best = 0;
  values.forEach((value) => {
    if (value === query) best = Math.max(best, 100);
    else if (value.startsWith(query)) best = Math.max(best, 75);
    else if (value.includes(query)) best = Math.max(best, 45);
  });
  return best;
};

// Normalize immutable source labels once, not on every keystroke across the full archive.
const songIndex = SONGS.map((item) => ({ item, values: [item.title, item.artistName, ...(findArtist(item.artistId)?.alternateNames || []), item.albumTitle, ...item.writers, ...item.themes, ...item.moods].map(normalize) }));
const artistIndex = ARTISTS.map((item) => ({ item, values: [item.name, ...(item.alternateNames || []), ...item.genres, item.location].map(normalize) }));
const albumIndex = ALBUMS.map((item) => ({ item, values: [item.title, item.artistName, ...(findArtist(item.artistId)?.alternateNames || []), item.year === null ? '' : String(item.year)].map(normalize) }));

export const searchCatalog = (
  query: string,
  type: SearchType = 'all',
  limit = Number.POSITIVE_INFINITY,
): SearchResults => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return { songs: [], artists: [], albums: [], total: 0 };

  const songs = type === 'all' || type === 'songs'
    ? songIndex.map(({ item, values }) => ({
        item,
        score: score(normalizedQuery, values),
      }))
        .filter(({ score: itemScore }) => itemScore > 0)
        // Preserve match relevance; only break ties in favor of a text the visitor can read.
        .sort((left, right) => right.score - left.score
          || Number(right.item.lyricsAvailability === 'full') - Number(left.item.lyricsAvailability === 'full')
          || left.item.title.localeCompare(right.item.title))
        .slice(0, limit)
        .map(({ item }) => item)
    : [];

  const artists = type === 'all' || type === 'artists'
    ? artistIndex.map(({ item, values }) => ({
        item,
        score: score(normalizedQuery, values),
      }))
        .filter(({ score: itemScore }) => itemScore > 0)
        .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name))
        .slice(0, limit)
        .map(({ item }) => item)
    : [];

  const albums = type === 'all' || type === 'albums'
    ? albumIndex.map(({ item, values }) => ({
        item,
        score: score(normalizedQuery, values),
      }))
        .filter(({ score: itemScore }) => itemScore > 0)
        .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
        .slice(0, limit)
        .map(({ item }) => item)
    : [];

  return { songs, artists, albums, total: songs.length + artists.length + albums.length };
};

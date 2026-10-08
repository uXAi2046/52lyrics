import { findArtist, FULL_LYRIC_WORKS, resolveCatalogItem } from './catalog';
import type { Artist, CatalogItemRef } from '../types';
import type { HomeRegion } from './homeExperience';

const artist = (slug: string): Artist => {
  const item = findArtist(slug);
  if (!item) throw new Error(`Missing homepage artist: ${slug}`);
  return item;
};

// Editorial selections, not a popularity ranking or an exhaustive genre classification.
export const HOME_SPOTLIGHTS = [
  { artist: artist('beyonce'), note: 'Pop, R&B, and a voice at the center of it all.', position: 'center 28%' },
  { artist: artist('david-bowie'), note: 'An artist file for the curious. Follow the early records, track by track.', position: 'center 22%' },
  { artist: artist('nina-simone'), note: 'Begin with Little Girl Blue. Stay to explore the next record.', position: 'center 32%' },
];
export const HOME_ARTIST_FILTERS = ['All picks', 'Pop', 'Rock', 'Soul & jazz', 'Hip-hop'] as const;
export type HomeArtistFilter = typeof HOME_ARTIST_FILTERS[number];
export const HOME_ARTIST_PICKS = [
  { slug: 'lady-gaga', group: 'Pop' }, { slug: 'david-bowie', group: 'Rock' },
  { slug: 'nina-simone', group: 'Soul & jazz' }, { slug: 'kendrick-lamar', group: 'Hip-hop' },
  { slug: 'dua-lipa', group: 'Pop' }, { slug: 'radiohead', group: 'Rock' },
  { slug: 'stevie-wonder', group: 'Soul & jazz' }, { slug: 'taylor-swift', group: 'Pop' },
  { slug: 'the-beatles', group: 'Rock' }, { slug: 'adele', group: 'Soul & jazz' },
  { slug: 'the-weeknd', group: 'Pop' }, { slug: 'tupac-shakur', group: 'Hip-hop' },
].map((pick) => ({ artist: artist(pick.slug), group: pick.group }));

export const HOME_RELEASE_PATHS = ['beyonce', 'radiohead', 'stevie-wonder'].map((slug) => {
  const item = artist(slug);
  const album = item.albums.find((release) => release.metadataSource && release.type === 'Album');
  if (!album) throw new Error(`Missing sourced homepage release: ${slug}`);
  return { artist: item, album };
});
export const HOME_READERS = ['the-midnight-echo', 'tom-lehrer'].map((slug) => {
  const item = artist(slug);
  return { artist: item, songs: FULL_LYRIC_WORKS.filter((song) => song.artistId === item.id) };
});

// Geographic entry points use credited artist files; locale changes their order of introduction only.
export const HOME_REGION_PICKS: Record<HomeRegion, Artist[]> = {
  'north-america': ['beyonce', 'kendrick-lamar', 'lhasa-de-sela'].map(artist),
  'british-isles': ['adele', 'radiohead', 'hozier'].map(artist),
  world: ['kylie-minogue', 'lorde', 'roisin-murphy'].map(artist),
};

/** A song or album visit also belongs to an artist; keep the most recent unique people/groups. */
export function recentHomeArtists(refs: CatalogItemRef[]): Artist[] {
  const artists = new Map<string, Artist>();
  for (const ref of refs) {
    const item = resolveCatalogItem(ref);
    const owner = item && ('artistId' in item ? findArtist(item.artistId) : item);
    if (owner && !artists.has(owner.id)) artists.set(owner.id, owner);
    if (artists.size === 4) break;
  }
  return [...artists.values()];
}

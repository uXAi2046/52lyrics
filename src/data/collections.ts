import type { CatalogItemRef, DiscoveryCollection } from '../types';
import { ALBUMS, ARTISTS, FULL_LYRIC_SONGS, FULL_LYRIC_WORKS, PUBLIC_DOMAIN_SONGS, SONGS } from './catalog';

const songRef = (title: string): CatalogItemRef => ({
  type: 'song',
  id: SONGS.find((song) => song.title === title)?.id || '',
});

const artistRef = (name: string): CatalogItemRef => ({
  type: 'artist',
  id: ARTISTS.find((artist) => artist.name === name)?.id || '',
});

const albumRef = (title: string): CatalogItemRef => ({
  type: 'album',
  id: ALBUMS.find((album) => album.title === title)?.id || '',
});

const collectionSeeds: DiscoveryCollection[] = [
  {
    slug: 'album-archive',
    title: 'Inside the album archive',
    description: 'Follow real release editions from the opening track to the last. Artist identities, track order, and durations link back to their sources; lyric availability is separate.',
    eyebrow: 'Sourced release files',
    accent: 'iris',
    itemRefs: ARTISTS.flatMap((artist) => artist.albums.filter((album) => album.metadataSource).slice(0, 1).map((album) => ({ type: 'album' as const, id: album.id }))),
    themes: ['Album archive', 'Albums'],
    moods: ['Expansive'],
  },
  {
    slug: 'lyrics-you-can-read-now',
    title: 'Lyrics you can read now',
    description: 'Complete, original songs from The Midnight Echo—written for this catalog and ready to read.',
    eyebrow: 'Rights-safe originals',
    accent: 'coral',
    itemRefs: FULL_LYRIC_SONGS.filter((song) => song.rights === 'original').map((song) => ({ type: 'song', id: song.id })),
    themes: ['Original', 'Lyrics'],
    moods: ['Immersive'],
  },
  {
    slug: 'public-domain-classics',
    title: 'Public-domain classics',
    description: 'Eight historical lyrics about home, hope, winter, and giving. Each text links to its Wikisource edition and copyright evidence.',
    eyebrow: 'The historical songbook',
    accent: 'cream',
    itemRefs: PUBLIC_DOMAIN_SONGS.filter((song) => song.source?.provider === 'Wikisource').map((song) => ({ type: 'song', id: song.id })),
    themes: ['Public domain', 'History'],
    moods: ['Reflective', 'Tender', 'Hopeful'],
  },
  {
    slug: 'after-dark',
    title: 'After dark',
    description: 'Nocturnal records for city windows, empty roads, and the hour when thoughts get louder.',
    eyebrow: 'A late-night sequence',
    accent: 'iris',
    itemRefs: [songRef('City Lights'), songRef('Blinding Lights'), songRef('Midnight Rain'), albumRef('Neon Nights')],
    themes: ['Nightlife', 'Motion'],
    moods: ['Neon', 'Reflective'],
  },
  {
    slug: 'tom-lehrer-archive',
    title: 'The wit of Tom Lehrer',
    description: 'Musical satire, sourced album editions, and author-published lyrics. Complete texts appear only after the source sheet has been checked; other tracks keep their song-notes label.',
    eyebrow: 'The author’s archive',
    accent: 'coral',
    itemRefs: FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer').map((song) => ({ type: 'song' as const, id: song.id })),
    themes: ['Public domain', 'Satire', 'Songwriting'],
    moods: ['Wry', 'Theatrical'],
  },
  {
    slug: 'wordplay-classroom',
    title: 'The wordplay classroom',
    description: 'Letters become characters, menus turn into rhymes, and everyday routines reveal their mathematics. Complete author-published texts, with source notes and reading sections.',
    eyebrow: 'Language, numbers, imagination',
    accent: 'iris',
    itemRefs: FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer' && song.themes.includes('Learning')).map((song) => ({ type: 'song' as const, id: song.id })),
    themes: ['Learning', 'Language', 'Mathematics', 'Public domain'],
    moods: ['Playful', 'Curious'],
  },
  {
    slug: 'pop-confessions',
    title: 'Pop confessions',
    description: 'Songs that turn private doubts and hard truths into direct, memorable writing.',
    eyebrow: 'Close listening',
    accent: 'cream',
    itemRefs: [songRef('Anti-Hero'), songRef('Easy on Me'), songRef('Flowers'), songRef('Fading Signals')],
    themes: ['Vulnerability', 'Change'],
    moods: ['Confessional', 'Tender'],
  },
  {
    slug: 'dancefloor',
    title: 'Dancefloor',
    description: 'Rhythm-first records selected for momentum, bright hooks, and after-hours energy.',
    eyebrow: 'Movement studies',
    accent: 'coral',
    itemRefs: [songRef('Levitating'), songRef('Break My Soul'), songRef('24K Magic'), albumRef('Future Nostalgia')],
    themes: ['Dance', 'Chemistry'],
    moods: ['Upbeat', 'Electric'],
  },
  {
    slug: 'essential-songwriters',
    title: 'Essential songwriters',
    description: 'Artists whose catalogs reward attention to phrasing, structure, and point of view.',
    eyebrow: 'Artist index',
    accent: 'iris',
    itemRefs: [artistRef('Taylor Swift'), artistRef('Adele'), artistRef('SZA'), artistRef('Kendrick Lamar')],
    themes: ['Songwriting'],
    moods: ['Focused'],
  },
  {
    slug: 'decades-in-rotation',
    title: 'Decades in rotation',
    description: 'A line from foundational studio albums to the records shaping the current conversation.',
    eyebrow: '1966—2023',
    accent: 'cream',
    itemRefs: [albumRef('Pet Sounds'), albumRef('Back in Black'), albumRef('18 Months'), albumRef('SOS'), albumRef('GUTS')],
    themes: ['History', 'Albums'],
    moods: ['Expansive'],
  },
];

export const COLLECTIONS: DiscoveryCollection[] = collectionSeeds.map((collection) => ({
  ...collection,
  itemRefs: collection.itemRefs.filter((ref) => ref.id),
}));

export const findCollection = (slug: string) =>
  COLLECTIONS.find((collection) => collection.slug === slug);

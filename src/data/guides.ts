export const GUIDES = [
  {
    slug: 'follow-a-song-to-its-release',
    eyebrow: 'Release guide · 01',
    title: 'Follow a song to its release edition',
    description: 'Why a song can appear on more than one record, what a track list proves, and how 52lyrics connects recordings to sourced releases.',
  },
  {
    slug: 'which-lyrics-can-you-read',
    eyebrow: 'Reading guide · 02',
    title: 'Which lyrics can you read here?',
    description: 'A practical guide to full lyrics, song notes, original works, and verified historical texts in the 52lyrics catalog.',
  },
  {
    slug: 'read-the-historical-songbook',
    eyebrow: 'Archive guide · 03',
    title: 'Read the historical songbook',
    description: 'Start with three historical texts and learn how to inspect the exact edition, credit, and rights evidence behind each one.',
  },
  {
    slug: 'tom-lehrer-lyrics-source-guide',
    eyebrow: 'Author archive · 04',
    title: 'Tom Lehrer lyrics: follow the author’s source sheets',
    description: 'Read reviewed Tom Lehrer lyrics alongside the author’s published documents, and see why a lyric sheet is not the same as a recording.',
  },
  {
    slug: 'amazing-grace-1840-lyrics',
    eyebrow: 'Text edition · 05',
    title: 'Amazing Grace lyrics in the 1840 Olney Hymns edition',
    description: 'Explore the six-stanza historical text, its printed title, and the edition boundary behind this 52lyrics reading page.',
  },
] as const;

export const guidePath = (slug: string) => `/guides/${slug}`;
export const findGuide = (slug?: string) => GUIDES.find((guide) => guide.slug === slug);

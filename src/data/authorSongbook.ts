import type { Album, Artist, Song } from '../types';
import reviewed from './imported/lehrer-reviewed.json';
import { buildImageUrl } from './mockData';
import { withReviewedLyrics } from './reviewedLyrics';

/** Explicit reading placements never invent a recording release for an orphan title. */
export function createAuthorSongbook(artists: Artist[]): Album | undefined {
  const texts = reviewed.filter((review) => review.catalogPlacement === 'author-songbook');
  if (!texts.length) return;
  const artist = artists.find((artist) => artist.name === 'Tom Lehrer');
  if (!artist) throw new Error('The author songbook requires the verified Tom Lehrer artist.');
  const id = 'tl-songbook-author-lyric-sheets';
  const title = 'Tom Lehrer: Author Lyric Sheets';
  const coverUrl = buildImageUrl(title);
  const tracks: Song[] = texts.map((text, index) => withReviewedLyrics({
    id: `tl-text-${text.sourceSlug}`, slug: `tom-lehrer-${text.sourceSlug}`, title: text.title,
    artistId: artist.id, artistName: artist.name, albumId: id, albumTitle: title,
    duration: '', trackNumber: index + 1, releaseYear: null, releaseDate: '',
    lyrics: '', sections: [], lyricsAvailability: 'metadata-only', rights: 'unavailable',
    writers: [], producers: [], copyright: '', genres: ['Author-published lyrics'], coverUrl,
    description: text.description, about: text.about, themes: text.themes, moods: text.moods,
    editorialNotes: [], seoDescription: text.description,
  }));
  if (tracks.some((song) => song.lyricsAvailability !== 'full')) throw new Error('An author-songbook text has not been approved.');
  return {
    id, slug: 'tom-lehrer-author-lyric-sheets', title, artistId: artist.id, artistName: artist.name,
    releaseDate: '', year: null, trackCount: tracks.length, coverUrl, tracks, type: 'Songbook',
    seoDescription: 'An editorial songbook, not a recorded album. Read complete author-published lyric sheets by Tom Lehrer, with checked text editions and source links. Dates and running times are not inferred from website timestamps.',
  };
}

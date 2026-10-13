import type { Album, Artist, LyricSection, Song } from '../types';
import batch from './imported/pd-candidates.json';
import { buildImageUrl, slugify } from './mockData';

// Songbook anthologies transcribed on Wikisource. Only records with pipeline
// status "approved" become catalog entries; everything else stays in the
// collection pipeline (hold / needs-review) and is never rendered.

const approved = batch.records.filter((record) => record.status === 'approved');

if (batch.schemaVersion !== 1 || batch.method !== 'wikisource-api') throw new Error('Unsupported public-domain batch.');
if (!/^\d{4}-\d{2}-\d{2}/.test(batch.retrievedAt)) throw new Error('Missing retrieval date.');
for (const record of approved) {
  if (!record.revisionId || !/^https:\/\/en\.wikisource\.org\/w\/index\.php\?title=.+&oldid=\d+$/.test(record.revisionUrl)) throw new Error(`Missing pinned revision: ${record.title}`);
  if (!Array.isArray(record.stanzas) || record.stanzas.length < 1) throw new Error(`Missing stanzas: ${record.title}`);
  const lines = record.stanzas.flatMap((section) => section.content);
  if (lines.length < 8) throw new Error(`Incomplete lyric text: ${record.title}`);
  for (const section of record.stanzas) {
    if (section.type !== 'verse' && section.type !== 'chorus') throw new Error(`Unexpected section type: ${record.title}`);
    if (!Array.isArray(section.content) || !section.content.length || section.content.some((line) => typeof line !== 'string' || !line.trim())) throw new Error(`Invalid stanza: ${record.title}`);
  }
  if (record.pageQuality !== null && record.pageQuality < 3) throw new Error(`Unproofread scan published: ${record.title}`);
}

type BatchBook = (typeof batch.books)[number];
const books = new Map<string, BatchBook>(batch.books.map((book) => [book.id, book]));

export const PUBLIC_DOMAIN_BATCH_WORKS = approved;

const sections = (record: (typeof approved)[number]): LyricSection[] =>
  record.stanzas.map((section, index) => ({
    type: section.type,
    ...(section.type === 'verse' ? { number: record.stanzas.slice(0, index + 1).filter((item) => item.type === 'verse').length } : {}),
    content: section.content,
  }));

export const PUBLIC_DOMAIN_BATCH_ARTISTS: Artist[] = [];
export const PUBLIC_DOMAIN_BATCH_ALBUMS: Album[] = [];

const usedSongSlugs = new Set<string>();
const usedIds = new Set<string>();
const albumFor = new Map<string, Album>();

for (const record of approved) {
  const book = books.get(record.bookId)!;
  const authorSlug = slugify(record.author);
  const artistId = `pd-artist-${authorSlug}`;
  const albumId = `pd-songbook-${authorSlug}`;
  let artist = PUBLIC_DOMAIN_BATCH_ARTISTS.find((item) => item.id === artistId);
  if (!artist) {
    artist = {
      id: artistId,
      slug: authorSlug,
      name: record.author,
      genres: [...book.themes],
      entityType: 'Person',
      role: 'Songwriter',
      timelineLabel: record.authorDeathYear ? 'Lifespan' : 'Active',
      activeYears: record.authorBirthYear && record.authorDeathYear
        ? `${record.authorBirthYear}–${record.authorDeathYear}`
        : record.authorDeathYear ? `died ${record.authorDeathYear}` : 'Dates not supplied',
      location: 'Historical songwriter',
      sourceUrl: book.sourceUrl,
      biography: `${record.author} appears in ${book.title} (${book.year}), a songbook transcribed and proofread on Wikisource. ${record.authorDeathYear ? `${record.author.split(' ')[0]} died in ${record.authorDeathYear}.` : 'The source does not supply dates for this author.'}`,
      songCount: 0,
      imageUrl: buildImageUrl(record.author),
      albums: [],
      topSongs: [],
      seoDescription: `Read complete public-domain lyrics collected under the name ${record.author} from sourced historical songbooks.`,
    };
    PUBLIC_DOMAIN_BATCH_ARTISTS.push(artist);
  }
  let album = albumFor.get(albumId);
  if (!album) {
    album = {
      id: albumId,
      slug: `${authorSlug}-collected-lyrics`,
      title: `${record.author}: Collected Lyrics`,
      artistId,
      artistName: record.author,
      releaseDate: String(book.year),
      year: book.year,
      trackCount: 0,
      coverUrl: buildImageUrl(`${record.author} Collected Lyrics`),
      tracks: [],
      type: 'Songbook',
      seoDescription: `Complete public-domain song texts by ${record.author}, from sourced and pinned Wikisource editions.`,
    };
    albumFor.set(albumId, album);
    PUBLIC_DOMAIN_BATCH_ALBUMS.push(album);
    artist.albums.push(album);
  }

  const songId = `pd-song-${record.workSlug}`;
  if (usedIds.has(songId)) throw new Error(`Duplicate batch song id: ${songId}`);
  usedIds.add(songId);
  let songSlug = `${authorSlug}-${slugify(record.title)}`;
  if (usedSongSlugs.has(songSlug)) songSlug = `${songSlug}-${book.id}`;
  if (usedSongSlugs.has(songSlug)) throw new Error(`Duplicate batch song slug: ${songSlug}`);
  usedSongSlugs.add(songSlug);

  const songSections = sections(record);
  const edition = `${book.title} (${book.year})${book.editor ? `, edited by ${book.editor}` : ''}, “${record.title}”`;
  const authorship = record.author === 'Traditional'
    ? 'Traditional words. '
    : `Words by ${record.author}${record.authorDeathYear ? ` (${record.authorDeathYear ? `died ${record.authorDeathYear}` : ''})` : ''}. `;
  const song: Song = {
    id: songId,
    slug: songSlug,
    title: record.title,
    artistId,
    artistName: record.author,
    albumId,
    albumTitle: album.title,
    duration: '',
    trackNumber: album.tracks.length + 1,
    releaseYear: book.year,
    releaseDate: String(book.year),
    lyrics: songSections.map((section) => section.content.join('\n')).join('\n\n'),
    sections: songSections,
    lyricsAvailability: 'full',
    rights: 'public-domain',
    writers: [record.author],
    producers: [],
    copyright: `${authorship}Historical text published in ${book.title} (${book.year}); public domain. No claim to a modern recording or arrangement.`,
    coverUrl: buildImageUrl(`${record.author} ${record.title}`),
    genres: ['Historical song', ...book.themes],
    description: `“${record.title}” as printed in ${book.title} (${book.year}).`,
    about: `This text comes from ${book.title}${book.editor ? `, edited by ${book.editor}` : ''}, a historical songbook transcribed on Wikisource and reproduced from the pinned revision linked below.${record.notes?.includes('single-stanza') ? ' The source prints the song as a single block without verse breaks; the displayed text follows the source.' : ''}`,
    themes: ['Public domain', ...book.themes],
    moods: [],
    editorialNotes: [
      `Source edition: ${edition}. Page revision ${record.revisionId}, retrieved ${batch.retrievedAt.slice(0, 10)}.`,
      record.pageQuality !== null ? `The source scan pages are proofread on Wikisource (quality level ${record.pageQuality}).` : 'The source is a direct Wikisource transcription.',
      book.rightsNote,
    ],
    seoDescription: `Read ${record.title} by ${record.author}: complete public-domain lyrics from ${book.title} (${book.year}), with the pinned source revision.`,
    source: {
      provider: 'Wikisource',
      url: book.sourceUrl,
      revisionUrl: record.revisionUrl,
      retrievedAt: batch.retrievedAt.slice(0, 10),
      edition,
      license: 'Public domain',
      evidenceUrl: book.sourceUrl,
      rightsNote: `${book.rightsNote}${record.authorDeathYear ? ` The credited author died in ${record.authorDeathYear}.` : ''}`,
      transcriptionLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  };
  album.tracks.push(song);
  album.trackCount = album.tracks.length;
  artist.songCount = artist.albums.reduce((sum, item) => sum + item.tracks.length, 0);
  if (!artist.topSongs.length) artist.topSongs = album.tracks.slice(0, 5);
}

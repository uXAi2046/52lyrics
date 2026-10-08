import type { LyricSection, Song } from '../types';
import sources from './imported/lehrer-sources.json';
import importedReviews from './imported/lehrer-reviewed.json';
import { normalizeCatalogText } from './normalize';
import holds from './imported/lehrer-rights-holds.json';

// Compared line by line with the rendered author PDF, not accepted from its OCR layer.
const reviews = [{
  title: 'Poisoning Pigeons in the Park',
  sourceSlug: 'poisoning-pigeons-in-the-park',
  sectionLabels: [] as string[],
  sectionLanguages: [] as string[],
  edition: 'Author-published lyric sheet · original English words',
  underlyingWork: null,
  pdfSha256: 'e0191b7894d36f1c66106d0b5924fe9f1ac5c6ebb38b94dc3ca3c665aa1f4530',
  description: 'A deliberately macabre springtime song: a cheerful courtship scene takes a darkly comic turn.',
  about: 'Lehrer pairs the language of a sunny park outing with an outrageous narrator. This is fictional musical satire, not advice about animals or poisons. Read the complete author-published lyric sheet below; performance introductions and spoken asides are not part of this edition.',
  themes: ['Satire', 'Spring', 'Dark comedy'], moods: ['Wry', 'Theatrical'],
  note: 'The six stanzas and every lyric line have been visually checked against the author-published sheet.',
  stanzas: [
    [
      'Spring is here, spring is here.',
      'Life is skittles, and life is beer.',
      'I think the loveliest time of the year',
      "Is the spring, I do, don't you? Course you do!",
      "But there's one thing that makes spring complete for me",
      'And makes every Sunday a treat for me:',
    ],
    [
      'All the world seems in tune',
      'On a spring afternoon',
      "When we're poisoning pigeons in the park.",
      "Every Sunday you'll see",
      'My sweetheart and me',
      'As we poison the pigeons in the park.',
    ],
    [
      'When they see us coming',
      "The birdies all try an' hide,",
      'But they still go for peanuts',
      'When coated with cyan-hide.',
      "The sun's shining bright,",
      'Everything seems all right',
      "When we're poisoning pigeons in the park.",
    ],
    [
      "We've gained notoriety",
      'And caused much anxiety',
      'In the Audubon Society',
      'With our games.',
      'They call it impiety',
      'And lack of propriety',
      'And quite a variety of unpleasant names.',
      "But it's not against any religion",
      'To want to dispose of a pigeon.',
    ],
    [
      "So, if Sunday you're free,",
      "Why don't you come with me,",
      "And we'll poison the pigeons in the park.",
      "And maybe we'll do",
      'In a squirrel or two',
      "While we're poisoning pigeons in the park.",
    ],
    [
      "We'll murder them all amid laughter and merriment,",
      'Except for the few we take home to experiment.',
      "My pulse will be quickenin'",
      'With each drop of strychnine',
      'We feed to a pigeon',
      '(It just takes a smidgin)',
      'To poison a pigeon in the park.',
    ],
  ],
}, ...importedReviews];

export function withReviewedLyrics(song: Song): Song {
  if (song.artistName !== 'Tom Lehrer') return song;
  const review = reviews.find((item) => normalizeCatalogText(item.title) === normalizeCatalogText(song.title));
  if (!review) return song;
  if (holds.some((hold) => hold.sourceSlug === review.sourceSlug)) throw new Error(`Unresolved lyric rights: ${song.title}`);
  const record = sources.songs.find((item) => item.slug === review.sourceSlug);
  const pdf = record?.pdfs.find((item) => item.sha256 === review.pdfSha256);
  if (!pdf) throw new Error(`Reviewed lyric source changed: ${song.title}`);
  const sections: LyricSection[] = review.stanzas.map((content, index) => ({ type: 'verse', number: index + 1, label: review.sectionLabels[index], language: review.sectionLanguages[index] as LyricSection['language'], content }));
  const underlyingWork = review.underlyingWork ?? undefined;
  return {
    ...song, lyrics: review.stanzas.map((stanza) => stanza.join('\n')).join('\n\n'), sections,
    lyricsAvailability: 'full', rights: 'public-domain', writers: [...(underlyingWork?.writers ?? []), 'Tom Lehrer'],
    copyright: underlyingWork
      ? `Original words by ${underlyingWork.writers.join(', ')}; adaptation by Tom Lehrer. The original-work evidence and Lehrer's public-domain declaration are linked below. This text edition is not a performance transcription.`
      : 'Words by Tom Lehrer, released into the public domain by the author. This is the author-published text edition, not a transcription of a particular performance.',
    description: review.description, about: review.about,
    themes: ['Public domain', ...review.themes], moods: review.moods,
    editorialNotes: [review.note, 'The source sheet is linked below and has been visually checked against the displayed words. Section numbers are editorial reading aids.'],
    seoDescription: `Read ${song.title} by Tom Lehrer: complete public-domain lyrics, author source, stanza navigation and album context.`,
    source: {
      provider: 'Tom Lehrer', url: record.sourceUrl, revisionUrl: pdf.url,
      documentSha256: pdf.sha256, retrievedAt: sources.retrievedAt.slice(0, 10),
      documentType: pdf.kind === 'score' ? 'score-pdf' : 'lyric-sheet-pdf',
      edition: review.edition,
      underlyingWork,
      license: 'Public domain', evidenceUrl: sources.evidenceUrl,
      rightsNote: "Tom Lehrer's November 26, 2022 declaration relinquishes copyright in lyrics he wrote. It does not grant rights to third-party music, photographs or album artwork. " + (underlyingWork ? 'This adaptation also relies on the separate original-work evidence below.' : 'This edition uses only his words.'),
      transcriptionLicenseUrl: sources.evidenceUrl,
    },
  };
}

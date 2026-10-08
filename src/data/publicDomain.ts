import type { Album, Artist, LyricSection, Song } from '../types';
import batch from './imported/wikisource.json';
import { buildImageUrl, slugify } from './mockData';

// Editorial metadata is separate from the browser-extracted text. Edition years
// describe the text being presented; these entries do not represent recordings.
export const PUBLIC_DOMAIN_EDITIONS = [
  { slug: 'amazing-grace', title: 'Amazing Grace', author: 'John Newton', lifespan: '1725–1807', region: 'England', authorPage: 'Author:John_Newton_(1725-1807)', year: 1840, edition: 'Olney Hymns (1840), Book 1, Hymn 41', evidencePage: 'Olney_Hymns_(1840)', stanzaSizes: [4, 4, 4, 4, 4, 4], themes: ['Faith', 'Renewal'], moods: ['Reflective', 'Hopeful'], description: 'A hymn of gratitude, endurance, and grace, presented in the six-stanza Olney Hymns text.', note: 'This is the 1840 printed text, titled Faith’s Review and Expectation. Later added verses and modern arrangements are not included.' },
  { slug: 'in-the-bleak-midwinter', title: 'In the Bleak Midwinter', author: 'Christina Rossetti', lifespan: '1830–1894', region: 'England', authorPage: 'Author:Christina_Georgina_Rossetti', year: 1904, edition: 'A Christmas Carol, text attributed to the 1904 Poetical Works', stanzaSizes: [8, 8, 8, 8, 8], themes: ['Winter', 'Giving'], moods: ['Quiet', 'Tender'], description: 'Winter imagery gives way to a small, personal gift in this five-stanza Christmas poem.', note: 'Wikisource identifies this text with the 1904 collected edition under the title A Christmas Carol. Only Rossetti’s words are reproduced, not a musical arrangement.' },
  { slug: 'softly-and-tenderly', title: 'Softly and Tenderly', author: 'Will L. Thompson', lifespan: '1847–1909', region: 'United States', authorPage: 'Author:Will_Lamartine_Thompson', year: 1880, edition: 'Softly and Tenderly (1880), Wikisource transcription', stanzaSizes: [4, 4, 4, 4, 4], refrainIndex: 1, themes: ['Faith', 'Homecoming'], moods: ['Tender', 'Restorative'], description: 'A repeated invitation to come home anchors this nineteenth-century hymn.', note: 'The source prints four verses and one refrain. The refrain appears once here, as in the source; the page credits Timeless Truths for its transcription.' },
  { slug: 'we-three-kings', title: 'We Three Kings of Orient Are', author: 'John Henry Hopkins', lifespan: '1820–1891', region: 'United States', authorPage: 'Author:John_Henry_Hopkins', year: 1857, edition: 'We Three Kings of Orient Are (1857), Wikisource transcription', stanzaSizes: [4, 4, 4, 4, 4, 4], refrainIndex: 1, repeatRefrain: true, themes: ['Journey', 'Christmas'], moods: ['Expansive', 'Reflective'], description: 'A journey guided by a star unfolds through verses about three symbolic gifts.', note: 'The source’s repeated “Refrain” instructions are expanded into the same four lines for continuous reading. The lyricist is John Henry Hopkins Jr. (1820–1891).' },
  { slug: 'what-child-is-this', title: 'What Child Is This?', author: 'William Chatterton Dix', lifespan: '1837–1898', region: 'England', authorPage: 'Author:William_Chatterton_Dix', year: 1865, edition: 'What Child Is This?, Wikisource transcription of the historical lyric', stanzaSizes: [8, 8, 8], themes: ['Christmas', 'Wonder'], moods: ['Tender', 'Quiet'], description: 'Three question-and-answer stanzas move from a sleeping child to a song of welcome.', note: 'This entry presents the three-stanza lyric associated with Greensleeves. It does not include a recording or a modern adaptation.' },
  { slug: 'good-king-wenceslas', title: 'Good King Wenceslas', author: 'John Mason Neale', lifespan: '1818–1866', region: 'England', authorPage: 'Author:John_Mason_Neale', year: 1853, edition: 'Carols for Christmas-tide (1853), No. XI', evidencePage: 'Good_King_Wenceslas', evidenceRevision: '15139680', stanzaSizes: [8, 8, 8, 8, 8], themes: ['Winter', 'Giving'], moods: ['Hopeful', 'Warm'], description: 'A king and his page cross a bitter winter night to bring food and warmth to a stranger.', note: 'The words come from the Carols for Christmas-tide transcription. Historic spelling and punctuation, including its unusual quotation marks, are retained.' },
  { slug: 'christmas-bells', title: 'Christmas Bells', author: 'Henry Wadsworth Longfellow', lifespan: '1807–1882', region: 'United States', authorPage: 'Author:Henry_Wadsworth_Longfellow', year: 1867, edition: 'Flower-de-Luce (1867), Christmas Bells', evidencePage: 'Flower-de-Luce_(Collection)', evidenceRevision: '9512903', stanzaSizes: [5, 5, 5, 5, 5, 5, 5], themes: ['Peace', 'Christmas'], moods: ['Reflective', 'Hopeful'], description: 'Bells and the noise of war meet in a seven-stanza poem that returns to the hope of peace.', note: 'This is the complete seven-stanza poem in Flower-de-Luce, the source of I Heard the Bells on Christmas Day. It is not the shortened lyric or arrangement of a later recording.' },
  { slug: 'home-sweet-home', title: 'Home, Sweet Home', author: 'John Howard Payne', lifespan: '1791–1852', region: 'United States', authorPage: 'Author:John_Howard_Payne', year: 1904, edition: 'Poems That Every Child Should Know (1904), Home, Sweet Home', evidencePage: 'Author:John_Howard_Payne', evidenceRevision: '14666790', stanzaSizes: [6, 6, 6, 6], themes: ['Homecoming', 'Belonging'], moods: ['Nostalgic', 'Warm'], description: 'A longing for familiar rooms and family runs through four stanzas about the pull of home.', note: 'The four-stanza text follows the 1904 anthology edited by Mary Elizabeth Burt. Its editorial introduction is excluded. This is the historical text attributed to Payne, not a modern performer’s recording.' },
];

const wikiUrl = (page: string) => `https://en.wikisource.org/wiki/${encodeURIComponent(page)}`;

// Fingerprints recorded from the browser extraction before writing local data.
// These detect accidental edits; they are not security or licensing proofs.
export const REVIEWED_SNAPSHOTS: Record<string, { revision: string; checksum: string }> = {
  'amazing-grace': { revision: '15417564', checksum: '51aef6de' },
  'in-the-bleak-midwinter': { revision: '4279369', checksum: 'ad9f56f4' },
  'softly-and-tenderly': { revision: '15761336', checksum: 'e3982165' },
  'we-three-kings': { revision: '15738447', checksum: '3f8be6a5' },
  'what-child-is-this': { revision: '2809319', checksum: '1a8b8268' },
  'good-king-wenceslas': { revision: '13810799', checksum: '48d96e07' },
  'christmas-bells': { revision: '7725728', checksum: '4c567509' },
  'home-sweet-home': { revision: '14861458', checksum: '32cfd2a4' },
};

const fingerprint = (stanzas: string[][]) => {
  let hash = 2166136261;
  for (const char of JSON.stringify(stanzas)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash.toString(16);
};

export function validateWikisourceBatch(input: unknown): asserts input is typeof batch {
  if (!input || typeof input !== 'object') throw new Error('Missing Wikisource batch.');
  const value = input as typeof batch;
  if (value.schemaVersion !== 1 || value.method !== 'browser-dom' || !/^\d{4}-\d{2}-\d{2}$/.test(value.retrievedAt || '')) throw new Error('Unsupported Wikisource batch.');
  if (!Array.isArray(value.records) || value.records.length !== PUBLIC_DOMAIN_EDITIONS.length) throw new Error('Incomplete Wikisource batch.');
  if (new Set(value.records.map((record) => record.slug)).size !== value.records.length) throw new Error('Duplicate imported song.');
  for (const record of value.records) {
    const edition = PUBLIC_DOMAIN_EDITIONS.find((item) => item.slug === record.slug);
    if (!edition) throw new Error('Unreviewed Wikisource source.');
    const url = new URL(record.revisionUrl);
    if (url.origin !== 'https://en.wikisource.org' || url.pathname !== '/w/index.php' || !/^\d+$/.test(url.searchParams.get('oldid') || '') || !url.searchParams.get('title')) throw new Error(`Missing pinned revision: ${record.slug}`);
    if (!Array.isArray(record.stanzas) || record.stanzas.length !== edition.stanzaSizes.length) throw new Error(`Incomplete stanzas: ${record.slug}`);
    record.stanzas.forEach((stanza, index) => {
      if (!Array.isArray(stanza) || stanza.length !== edition.stanzaSizes[index] || stanza.some((line) => typeof line !== 'string' || !line.trim() || /<[^>]+>|\n|Return to the top|This page was last edited|Lyrics unavailable/.test(line))) throw new Error(`Invalid lyric text: ${record.slug}`);
    });
    const reviewed = REVIEWED_SNAPSHOTS[record.slug];
    if (url.searchParams.get('oldid') !== reviewed.revision || fingerprint(record.stanzas) !== reviewed.checksum) throw new Error(`Unreviewed revision or changed text: ${record.slug}`);
  }
}

validateWikisourceBatch(batch);

export const PUBLIC_DOMAIN_ARTISTS: Artist[] = [];
export const PUBLIC_DOMAIN_ALBUMS: Album[] = [];

for (const edition of PUBLIC_DOMAIN_EDITIONS) {
  const record = batch.records.find((item) => item.slug === edition.slug)!;
  const authorSlug = slugify(edition.author);
  const artistId = `pd-artist-${authorSlug}`;
  const albumId = `pd-songbook-${authorSlug}`;
  const albumTitle = `${edition.author}: Selected Lyrics`;
  const coverUrl = buildImageUrl(`${edition.author} Songbook`);
  let verse = 0;
  const sections: LyricSection[] = record.stanzas.flatMap((content, index) => {
    const section: LyricSection = index === edition.refrainIndex
      ? { type: 'chorus', content }
      : { type: 'verse', number: ++verse, content };
    return edition.repeatRefrain && index > edition.refrainIndex!
      ? [section, { type: 'chorus', content: record.stanzas[edition.refrainIndex!] }]
      : [section];
  });
  const sourcePage = new URL(record.revisionUrl).searchParams.get('title')!;
  const evidenceUrl = edition.evidencePage
    ? (edition.evidenceRevision ? `https://en.wikisource.org/w/index.php?title=${encodeURIComponent(edition.evidencePage)}&oldid=${edition.evidenceRevision}` : wikiUrl(edition.evidencePage))
    : record.revisionUrl;
  const song: Song = {
    id: `pd-song-${edition.slug}`, slug: `${authorSlug}-${edition.slug}`, title: edition.title,
    artistId, artistName: edition.author, albumId, albumTitle,
    duration: '', trackNumber: 1, releaseYear: edition.year, releaseDate: String(edition.year),
    lyrics: sections.map((section) => section.content.join('\n')).join('\n\n'), sections,
    lyricsAvailability: 'full', rights: 'public-domain', writers: [edition.author], producers: [],
    copyright: `Historical words by ${edition.author}. Public-domain text; no claim to a modern recording or arrangement.`,
    coverUrl, genres: ['Historical song', ...(edition.themes.includes('Christmas') || edition.themes.includes('Winter') ? ['Carol'] : [])],
    description: edition.description, about: edition.note,
    themes: ['Public domain', ...edition.themes], moods: edition.moods,
    editorialNotes: [edition.note],
    seoDescription: `Read ${edition.title} by ${edition.author}: full public-domain lyrics, chapter navigation, and a linked Wikisource edition.`,
    source: {
      provider: 'Wikisource', url: wikiUrl(sourcePage), revisionUrl: record.revisionUrl,
      retrievedAt: batch.retrievedAt, edition: edition.edition, license: 'Public domain', evidenceUrl,
      rightsNote: `The historical text is published before 1931 and its credited author died more than 100 years ago. See the source's copyright statement; later editions, translations and recordings may have separate rights.`,
      transcriptionLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  };
  const album: Album = {
    id: albumId, slug: `${authorSlug}-selected-lyrics`, title: albumTitle,
    artistId, artistName: edition.author, releaseDate: String(edition.year), year: edition.year,
    trackCount: 1, coverUrl, tracks: [song], type: 'Songbook',
    seoDescription: `A 52lyrics reading selection of historical words by ${edition.author}. An editorial songbook, not a recorded album.`,
  };
  PUBLIC_DOMAIN_ALBUMS.push(album);
  PUBLIC_DOMAIN_ARTISTS.push({
    id: artistId, slug: authorSlug, name: edition.author, role: 'Songwriter', sourceUrl: wikiUrl(edition.authorPage),
    activeYears: edition.lifespan, location: edition.region, genres: ['Historical lyrics'],
    biography: `${edition.author} (${edition.lifespan}) is the credited writer of ${edition.title}. This author file connects the historical text to its source edition and public-domain reading notes.`,
    songCount: 1, imageUrl: buildImageUrl(edition.author), albums: [album], topSongs: [song],
    seoDescription: `Explore historical lyrics by ${edition.author}, with complete texts and source editions.`,
  });
}

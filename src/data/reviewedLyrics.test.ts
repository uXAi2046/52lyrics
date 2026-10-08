import { describe, expect, it } from 'vitest';
import { ALBUMS, FULL_LYRIC_SONGS, FULL_LYRIC_WORKS } from './catalog';
import { COLLECTIONS } from './collections';
import { normalizeCatalogText } from './normalize';
import sources from './imported/lehrer-sources.json';
import reviewed from './imported/lehrer-reviewed.json';

describe('visually reviewed author lyric sheets', () => {
  it('includes the complete reviewed sheet, not OCR artifacts or unrelated boilerplate', () => {
    const song = FULL_LYRIC_SONGS.find((song) => song.title === 'Poisoning Pigeons in the Park')!;
    expect(song.source?.provider).toBe('Tom Lehrer');
    expect(song.sections.map((section) => section.content.length)).toEqual([6, 6, 7, 9, 6, 7]);
    expect(song.sections[0].content[0]).toBe('Spring is here, spring is here.');
    expect(song.sections.at(-1)?.content.at(-1)).toBe('To poison a pigeon in the park.');
    expect(song.lyrics).not.toMatch(/_,,|words and music by|view or download/);
    expect(song.source?.documentSha256).toBe('e0191b7894d36f1c66106d0b5924fe9f1ac5c6ebb38b94dc3ca3c665aa1f4530');
    expect(song.source?.evidenceUrl).toBe('https://tomlehrersongs.com/');
    expect(sources.songs.find((source) => source.slug === 'poisoning-pigeons-in-the-park')?.pdfs[0].sha256).toBe(song.source?.documentSha256);
    expect(sources.songs).toHaveLength(96);
    expect(sources.excluded).toEqual([]);
  });

  it('connects every reviewed lyric body to all matching editions and excludes separately credited footnotes', () => {
    expect(reviewed).toHaveLength(89);
    expect(reviewed.reduce((sum, item) => sum + item.stanzas.flat().length, 0)).toBe(2998);
    for (const review of reviewed) {
      const songs = FULL_LYRIC_SONGS.filter((song) => song.artistName === 'Tom Lehrer' && normalizeCatalogText(song.title) === normalizeCatalogText(review.title));
      expect(songs.length).toBeGreaterThan(0);
      expect(songs.every((song) => song.lyrics === review.stanzas.map((stanza) => stanza.join('\n')).join('\n\n'))).toBe(true);
      const source = sources.songs.find((source) => source.slug === review.sourceSlug);
      expect(source?.pdfs.some((pdf) => pdf.sha256 === review.pdfSha256)).toBe(true);
      expect(songs.every((song) => song.source?.documentSha256 === review.pdfSha256)).toBe(true);
    }
    expect(reviewed.find((review) => review.sourceSlug === 'i-hold-your-hand-in-mine')?.stanzas.flat().join('\n')).not.toMatch(/Shuch|Gangsta|qsl/);
    expect(reviewed.find((review) => review.sourceSlug === 'the-wild-west-is-where-i-want-to-be')?.stanzas.flat()).toContain('How I long to see the mush-');
    expect(reviewed.find((review) => review.sourceSlug === 'the-wiener-schnitzel-waltz')?.stanzas.flat()).toContain('The music was lovely and quite Rudolf Frimly.');
  });

  it('preserves two-column order and keeps alternate versions separate', () => {
    const irish = reviewed.find((review) => review.sourceSlug === 'the-irish-ballad')!;
    expect(irish.stanzas.map((stanza) => stanza.length)).toEqual([8, 8, 8, 8, 8, 8, 8, 8]);
    expect(irish.stanzas[3].at(-1)).toBe("Playin' a violin.");
    expect(irish.stanzas[4][0]).toBe('She weighted her brother down with stones,');
    const mexico = reviewed.find((review) => review.sourceSlug === 'in-old-mexico')!;
    expect(mexico.stanzas[5].at(-1)).toBe('But I digress.)');
    expect(mexico.stanzas[6][0]).toBe('The moment had come.');
    expect(mexico.stanzas.flat()).not.toContain('For though, try as I may,');
    const together = reviewed.find((review) => review.sourceSlug === 'we-will-all-go-together-when-we-go')!;
    expect(together.stanzas.flat()).toHaveLength(56);
    expect(together.stanzas[6][0]).toBe('Oh, we will all char together when we char.');
    expect(together.stanzas.flat()).not.toContain('-');
    const gray = reviewed.find((review) => review.sourceSlug === 'when-you-are-old-and-gray')!;
    expect(gray.stanzas.flat()).toHaveLength(34);
    expect(gray.stanzas.flat()).not.toContain('While enjoying our compatibility,');
  });

  it('retains source section titles and identifies unspecified ad-libs without inventing words', () => {
    const clementine = FULL_LYRIC_WORKS.find((song) => song.title === 'Clementine')!;
    expect(clementine.sections.map((section) => section.label)).toEqual(['I. Cole Porter', 'II. Mozart', 'III. Bop', 'IV. Gilbert and Sullivan']);
    const script = reviewed.find((review) => review.sourceSlug === 'lobachevsky')!;
    expect(script.stanzas.flat()).toHaveLength(73);
    expect(script.stanzas.flat().filter((line) => line === '[Spoken Russian ad-lib; words not specified in the source]')).toHaveLength(2);
    expect(script.stanzas.flat()).not.toContain('(**)');
  });

  it('makes the complete More of Tom Lehrer album readable and lists every reviewed work in Discover', () => {
    const album = ALBUMS.find((album) => album.artistName === 'Tom Lehrer' && album.title === 'More of Tom Lehrer')!;
    expect(album.tracks).toHaveLength(11);
    expect(album.tracks.every((song) => song.lyricsAvailability === 'full')).toBe(true);
    const works = FULL_LYRIC_WORKS.filter((song) => song.source?.provider === 'Tom Lehrer');
    expect(works).toHaveLength(90);
    expect(COLLECTIONS.find((collection) => collection.slug === 'tom-lehrer-archive')?.itemRefs.map((ref) => ref.id)).toEqual(works.map((song) => song.id));
  });

  it('retains every line of the image-only Alma sheet and both New Math demonstrations', () => {
    const alma = reviewed.find((review) => review.sourceSlug === 'alma')!;
    expect(alma.stanzas.map((stanza) => stanza.length)).toEqual([4, 4, 3, 4, 4, 3, 4, 4, 3, 4, 4, 6]);
    expect(alma.stanzas[0][0]).toBe('The loveliest girl in Vienna');
    expect(alma.stanzas.at(-1)?.at(-1)).toBe('With Gustav and Walter and Franz!');
    const math = reviewed.find((review) => review.sourceSlug === 'new-math')!;
    expect(math.stanzas.flat()).toHaveLength(79);
    expect(math.stanzas[6].at(-1)).toBe('That only a child can do it!');
    expect(math.stanzas[8][0]).toBe("You can't take three from two,");
    expect(math.stanzas.at(-1)?.at(-1)).toBe('That only a child can do it!');
    expect(math.stanzas.flat().join('\n')).not.toMatch(/342|173|169|147/);
    expect(math.about).toContain('342 - 173 = 169 in base ten');
    expect(math.about).toContain('342 - 173 = 147 in base eight');
  });

  it('completes the fourteen-song live album without turning an introduction into fake lyrics', () => {
    const album = ALBUMS.find((album) => album.title === 'That Was the Year That Was')!;
    expect(album.year).toBe(1965);
    expect(album.tracks).toHaveLength(14);
    expect(album.tracks.every((song) => song.lyricsAvailability === 'full')).toBe(true);
    expect(album.metadataSource?.edition).toContain('Live');
    const next = album.tracks.find((song) => song.title === 'Who’s Next?')!;
    expect(next.about).toContain('not a verbatim transcription');
    expect(next.lyrics).not.toContain('Then Indonesia claimed that they');
    const revisited = ALBUMS.find((album) => album.title === 'Revisited' && album.artistName === 'Tom Lehrer')!;
    expect(revisited.tracks[0].title).toBe('Introduction');
    expect(revisited.tracks[0].lyricsAvailability).toBe('metadata-only');
    expect(revisited.tracks[0].lyrics).toBe('');
  });

  it('connects the newly reviewed compilation tracks, leaving only genuinely unreviewed entries unavailable', () => {
    const album = ALBUMS.find((album) => album.title === 'The Remains of Tom Lehrer')!;
    expect(album.tracks.filter((song) => song.lyricsAvailability === 'full')).toHaveLength(73);
    expect(album.tracks.filter((song) => song.lyricsAvailability !== 'full').map((song) => song.title)).toEqual(['Introduction']);
    const sizes: Record<string, number[]> = {
      'hanukkah-in-santa-monica': [10, 6, 5, 9], 'i-got-it-from-agnes': [8, 6, 6, 6, 9],
      'l-y': [5, 5, 5, 5, 5, 5, 6], 'n-apostrophe-t': [14, 14, 23],
      'selling-out': [7, 7, 6, 9], 'silent-e': [4, 4, 2, 4, 2, 6],
      'thats-mathematics': [4, 4, 9, 6, 6], 'o-u': [4, 4], 's-n': [4, 7, 8, 9, 7],
    };
    for (const [slug, expected] of Object.entries(sizes)) {
      expect(reviewed.find((review) => review.sourceSlug === slug)?.stanzas.map((stanza) => stanza.length)).toEqual(expected);
    }
    const snore = reviewed.find((review) => review.sourceSlug === 's-n')!;
    expect(snore.stanzas.flat()).not.toContain('And lie down on my bed');
    expect(snore.stanzas.at(-1)?.at(-1)).toBe('(snore -- sniff -- sneeze, repeated while fading out)');
    const math = reviewed.find((review) => review.sourceSlug === 'thats-mathematics')!;
    expect(math.stanzas.flat().join('\n')).not.toContain('Andrew Wiles');
    expect(math.about).toContain('optional Andrew Wiles verse');
    const selling = album.tracks.find((song) => song.title === 'Selling Out')!;
    expect(selling.sections.map((section) => section.label)).toEqual(['A · Son', 'B · Daughter', 'C · Father', 'D · Mother']);
    expect(selling.lyrics).not.toContain('Suggested routine');
  });

  it('gives the newly readable language songs a complete, deduplicated discovery route', () => {
    const collection = COLLECTIONS.find((collection) => collection.slug === 'wordplay-classroom')!;
    expect(collection.itemRefs).toHaveLength(11);
    expect(new Set(collection.itemRefs.map((ref) => ref.id)).size).toBe(11);
    for (const ref of collection.itemRefs) {
      expect(FULL_LYRIC_WORKS.find((song) => song.id === ref.id)?.themes).toContain('Learning');
    }
  });
});

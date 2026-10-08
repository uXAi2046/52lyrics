import { describe, expect, it } from 'vitest';
import { createAuthorSongbook } from './authorSongbook';
import { ALBUMS, ARTISTS, FULL_LYRIC_WORKS, SONGS, resolveCatalogItem } from './catalog';
import reviewed from './imported/lehrer-reviewed.json';
import holds from './imported/lehrer-rights-holds.json';
import sources from './imported/lehrer-sources.json';
import { searchCatalog } from './search';

const book = ALBUMS.find((album) => album.id === 'tl-songbook-author-lyric-sheets')!;
const expectedSizes: Record<string, number[]> = {
  'all-i-need-is-a-job': [12, 15], 'are-there-any-questions': [20, 20],
  'baby-is-it-love': [3, 3, 4, 4, 11], 'the-derivative-song-dy-dx': [9],
  'dodging-the-draft-at-harvard': [12, 15], 'dont-major-in-physics': [8, 4, 8, 4, 8, 4],
  'finch-and-dench': [7, 7, 13], 'fugue-for-scientists': [6, 6, 6, 4, 4, 4, 4, 4, 3, 4],
  'gsas-alma-mater': [4, 5, 4, 4, 5], 'hail-chemistry': [3, 5],
  'high-school-hymn': [6, 6], 'a-liter-and-a-gram': [6, 4, 6, 4],
  relativity: [5, 5, 6, 5], 'the-slide-rule-song': [4, 4, 4, 3],
  'deep-doodoo': [11, 11, 11, 11, 5], 'hes-not-the-one': [8, 12, 6, 5, 8, 12, 5, 5, 14],
  'ice-cream-tango': [9, 11, 9, 12], 'the-love-song-of-the-physical-anthropologist': [5, 5, 6, 7],
  'were-gonna-put-a-man-on-the-moon': [3, 3, 6, 6, 8], 'the-menu-song': [11, 14, 14, 16],
  'the-mumble-song': [5, 5, 4, 5], 'no-rice': [8, 8, 10, 9],
  'polaroid-photography-song': [2, 2, 2, 3, 3, 4, 2, 4, 2, 3, 2],
  'political-action-song': [9, 9, 9], 'post-thanksgiving-hymn': [7, 7, 7],
  scenery: [10, 3, 3, 9, 3, 4], 'take-me-for-a-walk': [4, 4, 4, 7, 13, 4, 4, 4, 4, 10],
  'thank-him-for-me': [4, 5, 6, 6, 4, 5, 6], 'theres-a-delta-for-every-epsilon': [5, 5, 8, 5],
  'without-an-s': [5, 5, 6, 5, 6, 5],
  'the-professors-song': [9, 9, 9], 's-equals-one-half-g-t-squared': [4, 12, 6, 5, 5, 8, 3, 3],
  'the-sac-song': [4, 4, 4, 4], sociology: [14, 14, 14, 14],
  'speeds-song': [4, 4, 4, 4], 'the-subway-song': [8],
  'te-amo': [4, 13, 6, 5, 12, 12, 3, 3], unsong: [10, 2, 10, 8, 2, 11, 2],
  'were-talkin-algebra': [8, 10, 8, 10, 8, 10, 8, 10], 'why-not-fight': [2, 10, 8, 6, 3, 1],
  'i-cant-think-why': [9, 9, 9], 'the-night-i-appeared-as-macbeth': [11, 14, 11, 14],
  trees: [15], 'tango-de-la-menegilda': [8, 11, 7, 8, 10, 7],
};

describe('author-sheet songbook', () => {
  it('places only the forty-four explicitly selected texts under the existing author', () => {
    const texts = reviewed.filter((review) => review.catalogPlacement === 'author-songbook');
    expect(texts.map((text) => text.sourceSlug)).toEqual(Object.keys(expectedSizes));
    expect(reviewed.filter((review) => review.catalogPlacement === 'recorded-release')).toHaveLength(45);
    expect(book.type).toBe('Songbook');
    expect(book.trackCount).toBe(44);
    expect(book.tracks.map((song) => song.id)).toEqual(texts.map((text) => `tl-text-${text.sourceSlug}`));
    expect(resolveCatalogItem({ type: 'album', id: book.id })).toBe(book);
    const author = ARTISTS.find((artist) => artist.id === book.artistId)!;
    expect(author.name).toBe('Tom Lehrer');
    expect(author.imageCredit?.sourceUrl).toMatch(/^https:\/\/commons.wikimedia.org\//);
    expect(author.albums.filter((album) => album.id === book.id)).toHaveLength(1);
    expect(author.songCount).toBe(SONGS.filter((song) => song.artistId === author.id).length);
    expect(() => createAuthorSongbook([])).toThrow('requires the verified Tom Lehrer artist');
  });

  it('keeps source provenance without inventing release dates, durations or recordings', () => {
    expect(book.year).toBeNull();
    expect(book.releaseDate).toBe('');
    expect(book.metadataSource).toBeUndefined();
    for (const [index, song] of book.tracks.entries()) {
      expect(song.albumId).toBe(book.id);
      expect(song.artistId).toBe(book.artistId);
      expect(song.trackNumber).toBe(index + 1);
      expect(song.releaseYear).toBeNull();
      expect(song.releaseDate).toBe('');
      expect(song.duration).toBe('');
      expect(song.metadataSource).toBeUndefined();
      expect(song.rights).toBe('public-domain');
      expect(song.source?.provider).toBe('Tom Lehrer');
      expect(song.coverUrl).toMatch(/^data:image\/svg\+xml/);
      expect(FULL_LYRIC_WORKS).toContain(song);
    }
  });

  it('retains every reviewed block and expands only explicitly marked repeats', () => {
    for (const [slug, sizes] of Object.entries(expectedSizes)) {
      const song = book.tracks.find((song) => song.id === `tl-text-${slug}`)!;
      expect(song.sections.map((section) => section.content.length)).toEqual(sizes);
    }
    expect(book.tracks.reduce((sum, song) => sum + song.sections.reduce((lines, section) => lines + section.content.length, 0), 0)).toBe(1432);
    const physics = book.tracks.find((song) => song.id === 'tl-text-dont-major-in-physics')!;
    expect(physics.sections.map((section) => section.label)).toEqual(['First student', 'Chorus 1', 'Second student', 'Chorus 2', 'Third student', 'Chorus 3']);
    expect(physics.sections[1].content).toEqual(physics.sections[3].content);
    expect(physics.sections[1].content).toEqual(physics.sections[5].content);
    expect(book.tracks.find((song) => song.id === 'tl-text-the-derivative-song-dy-dx')?.about).toContain('Billy Higgins');
  });

  it('keeps main versions, character parts and exact scan corrections without adding optional scenes', () => {
    const text = (slug: string) => book.tracks.find((song) => song.id === 'tl-text-' + slug)!;
    const menu = text('the-menu-song');
    expect(menu.sections.map((section) => section.label)).toEqual(['Soup', 'Sandwich', 'Salad', 'Dessert']);
    expect(menu.sections[2].content.at(-2)).toBe('C: Gasoline salad? You gotta be kidding.');
    expect(menu.sections.at(-1)?.content.at(-1)).toBe('soap flakes.');
    expect(menu.lyrics).not.toMatch(/1911|\(\*\)|preceded by/);
    expect(menu.about).toContain('television ending was changed');
    const trio = text('hes-not-the-one');
    expect(trio.lyrics).toContain('[S goes back to J]');
    expect(trio.lyrics).toContain('while S and J encourage him');
    expect(trio.lyrics).toContain('A: I am');
    expect(trio.lyrics).not.toMatch(/goes back to JJ|Sand J|A: lam/);
    expect(trio.about).toContain('no music was written');
    const walk = text('take-me-for-a-walk');
    expect(walk.lyrics).not.toMatch(/Cancel lunch|Nothing too athletic|INTERLUDE/);
    expect(walk.sections[4].label).toBe('Interlude');
    expect(walk.sections.at(-1)?.content.at(-1)).toBe('Day.');
    const polaroid = text('polaroid-photography-song');
    expect(polaroid.lyrics).not.toContain('infra-red');
    expect(polaroid.sections.at(-1)?.label).toBe('Final chorus');
    expect(polaroid.lyrics).toContain('[Getting faster and faster:]');
    expect(polaroid.about).toContain('September 1980');
    expect(text('ice-cream-tango').lyrics).not.toMatch(/Possible scene|Good Humor Man|Bell rings/);
    expect(text('post-thanksgiving-hymn').lyrics).toContain('We concentrate on fressing,');
    expect(text('post-thanksgiving-hymn').lyrics).not.toMatch(/\b(?:tressing|acquiescing)\b/);
    expect(text('the-love-song-of-the-physical-anthropologist').lyrics).toContain('Of her pentadactyl hand,');
    expect(text('without-an-s').lyrics).not.toContain('()');
    expect(text('theres-a-delta-for-every-epsilon').lyrics).toContain('To lie to the left of the "uragin."');
  });

  it('retains dual authorship, original-work evidence and writer search for adaptations', () => {
    const originals = {
      'i-cant-think-why': 'W. S. Gilbert',
      'the-night-i-appeared-as-macbeth': 'William Hargreaves',
      trees: 'Joyce Kilmer',
      'tango-de-la-menegilda': 'Felipe Pérez y González',
    };
    for (const [slug, writer] of Object.entries(originals)) {
      const song = book.tracks.find((song) => song.id === 'tl-text-' + slug)!;
      expect(song.writers).toEqual([writer, 'Tom Lehrer']);
      expect(song.source?.underlyingWork?.writers).toEqual([writer]);
      expect(song.source?.underlyingWork?.evidenceUrls.length).toBeGreaterThan(0);
      expect(song.source?.underlyingWork?.rightsNote.length).toBeGreaterThan(40);
      expect(song.source?.rightsNote).not.toContain('uses only his words');
      expect(song.copyright).toContain('adaptation by Tom Lehrer');
      expect(searchCatalog(writer, 'songs').songs).toContain(song);
    }
    expect(book.tracks.find((song) => song.id === 'tl-text-trees')?.lyrics).not.toContain('I think that I shall never see');
    expect(book.tracks.find((song) => song.id === 'tl-text-tango-de-la-menegilda')?.lyrics).not.toContain('Pobre chica');
  });

  it('keeps parallel voices, source languages and corrected math symbols intact', () => {
    const text = (slug: string) => book.tracks.find((song) => song.id === 'tl-text-' + slug)!;
    const duet = text('te-amo');
    expect(duet.sections.map((section) => section.language)).toEqual(['es', 'en', 'es', 'en', 'es', 'en', 'es', 'en']);
    expect(duet.source?.edition).toContain('Spanish and English');
    expect(duet.sections[0].content).toEqual(['Te amo, vida de mi vida,', 'Te amo con todo mi corazón.', 'Por tí yo muero, mi querida,', 'Déjame decirte mi pasión.']);
    expect(duet.sections[2].content.at(-1)).toBe('Un besito de contestación.');
    expect(duet.sections[3].content[0]).toBe('I think he said "amor."');
    expect(duet.sections[6].content.at(-1)).toBe('Ella dice "Si, Si"!');
    expect(duet.sections[7].content.at(-1)).toBe('So we shall see, Si, Si!');
    expect(duet.lyrics).not.toMatch(/Alt\.:|coraz6n|pasi6n|almo~t/);
    const physics = text('s-equals-one-half-g-t-squared');
    expect(physics.sections[0].content.at(-1)).toBe('And T is 2 π times the square root of L over g.');
    expect(physics.sections[2].content.at(-1)).toBe('of the linear momentum.');
    expect(physics.sections[3].content[0]).toBe('I think he said the force,');
    expect(physics.sections.at(-1)?.content).toEqual(['a C', 'a C', "If I don't get a C."]);
    expect(text('the-professors-song').lyrics).toContain("It's kx³ --- or kx² --- no, just kx, I'll bet");
    expect(text('the-professors-song').lyrics).not.toContain('secant');
  });

  it('preserves scripted replies and complete repeats without merging unused versions', () => {
    const text = (slug: string) => book.tracks.find((song) => song.id === 'tl-text-' + slug)!;
    const algebra = text('were-talkin-algebra');
    for (const index of [3, 5, 7]) expect(algebra.sections[index].content).toEqual(algebra.sections[1].content);
    const fight = text('why-not-fight');
    expect(fight.lyrics).toContain('Singers: Fight?\nCheering: Give a cheer, give a yell,');
    expect(fight.sections.at(-1)?.content).toEqual(['Fight!']);
    expect(fight.lyrics).not.toMatch(/quarterback|\(\*\)/);
    expect(text('sociology').sections[3].label).toBe('Verse 4 · Extra verse');
    expect(text('unsong').lyrics).toContain('B: I unbutton your shirt [it falls off]');
    expect(text('unsong').lyrics).not.toMatch(/ot1|angzy|helpfu\[/);
    expect(text('speeds-song').lyrics).not.toContain('Valentine:');
    expect(text('the-subway-song').lyrics).not.toContain('Historical note');
    expect(text('the-sac-song').lyrics).not.toContain('Inspector Generals');
  });

  it('accounts for every collected lyric PDF as approved or explicitly held', () => {
    const accounted = ['poisoning-pigeons-in-the-park', ...reviewed.map((review) => review.sourceSlug), ...holds.map((hold) => hold.sourceSlug)];
    expect(new Set(accounted).size).toBe(accounted.length);
    expect(accounted.sort()).toEqual(sources.songs.map((source) => source.slug).sort());
  });

  it('keeps held underlying works out of full lyrics while retaining an explicit source record', () => {
    expect(holds.map((hold) => hold.sourceSlug).sort()).toEqual(['all-is-well', 'hey-joe', 'juca', 'shakespeare-lied', 'sunshine', 'the-bourgeoisie']);
    for (const hold of holds) {
      expect(sources.songs.find((source) => source.slug === hold.sourceSlug)?.sourceUrl).toBe(hold.sourceUrl);
      expect(hold.reason.length).toBeGreaterThan(40);
      expect(reviewed.some((review) => review.sourceSlug === hold.sourceSlug)).toBe(false);
      expect(FULL_LYRIC_WORKS.some((song) => song.source?.url === hold.sourceUrl)).toBe(false);
    }
  });
});

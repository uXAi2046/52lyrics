# Wikisource browser collection — 2026-09-07

This batch adds eight complete historical texts (231 source lines), eight writers, and eight editorial songbooks to 52lyrics. The existing 171 songs are preserved. The resulting catalog has 179 songs and 18 complete lyrics. It is a small historical selection, mainly hymns and seasonal texts, not a modern popular-music corpus.

## Acquisition

The browser-skill CLI was available but no extension was connected. Collection therefore used the Codex in-app browser: navigate to Wikisource, inspect the visible page, follow version/disambiguation links, and read the rendered DOM body plus its permanent revision URL. No account, paid service, audio, photo, or recording was used. The source tab was closed after collection.

The stored JSON contains the extracted lyric stanzas, not the surrounding website navigation or editorial introductions. FNV fingerprints were calculated from those stanza arrays in the browser session before transferring them to the repository. The import validator compares local text against those fingerprints. `pnpm catalog:import --check` additionally prints SHA-256 hashes for audit/comparison. Fingerprints detect accidental text changes; they do not establish copyright permission.

## Included sources

| Text | Credited writer | Edition / text | Fixed revision |
| --- | --- | --- | --- |
| Amazing Grace | John Newton | Olney Hymns, 1840, Book 1, Hymn 41; six stanzas | [15417564](https://en.wikisource.org/w/index.php?title=Olney_Hymns_(1840)/Book_1/Hymn_41&oldid=15417564) |
| In the Bleak Midwinter | Christina Rossetti | Wikisource text citing the 1904 collected edition; five stanzas | [4279369](https://en.wikisource.org/w/index.php?title=In_the_Bleak_Midwinter&oldid=4279369) |
| Softly and Tenderly | Will L. Thompson | 1880 lyric; source credits Timeless Truths for the transcription | [15761336](https://en.wikisource.org/w/index.php?title=Softly_and_Tenderly&oldid=15761336) |
| We Three Kings of Orient Are | John Henry Hopkins Jr. | 1857 lyric; five verses and refrain | [15738447](https://en.wikisource.org/w/index.php?title=We_Three_Kings_of_Orient_Are&oldid=15738447) |
| What Child Is This? | William Chatterton Dix | Historical lyric; three stanzas | [2809319](https://en.wikisource.org/w/index.php?title=What_Child_Is_This%3F&oldid=2809319) |
| Good King Wenceslas | John Mason Neale | Carols for Christmas-tide, 1853; five stanzas | [13810799](https://en.wikisource.org/w/index.php?title=Carols_for_Christmas-tide/Good_King_Wenceslas&oldid=13810799) |
| Christmas Bells | Henry Wadsworth Longfellow | Flower-de-Luce, 1867; all seven stanzas of the poem behind I Heard the Bells on Christmas Day | [7725728](https://en.wikisource.org/w/index.php?title=Flower-de-Luce_(Collection)/Christmas_Bells&oldid=7725728) |
| Home, Sweet Home | John Howard Payne | Poems That Every Child Should Know, 1904; four stanzas | [14861458](https://en.wikisource.org/w/index.php?title=Poems_That_Every_Child_Should_Know/Home,_Sweet_Home&oldid=14861458) |

These are the specified historical texts, not authoritative transcriptions of every later recording. Some Wikisource entries are direct transcriptions rather than scan-validated pages; the edition notes preserve that distinction.

## Rights and attribution

The source pages, parent volumes, or credited author's page identify public-domain status. The historical works were published before 1931 and their credited writers died more than 100 years before collection. Each site's lyric page links to the supporting evidence. For subpages without their own notice:

- Amazing Grace: [Olney Hymns (1840)](https://en.wikisource.org/wiki/Olney_Hymns_(1840)).
- Good King Wenceslas: [version directory copyright notice](https://en.wikisource.org/w/index.php?title=Good_King_Wenceslas&oldid=15139680).
- Christmas Bells: [Flower-de-Luce copyright notice](https://en.wikisource.org/w/index.php?title=Flower-de-Luce_(Collection)&oldid=9512903).
- Home, Sweet Home: [Payne's author page](https://en.wikisource.org/w/index.php?title=Author:John_Howard_Payne&oldid=14666790), alongside the 1904 edition's US public-domain statement. Only the attributed poem is reproduced, not the anthology's introduction.

Wikisource's contributed text is offered under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), subject to underlying-work notices. Credit to the writer, Wikisource revision, and transcription terms is retained in the UI and copied lyrics. Any protectable transcription contributions and adaptations are available under those terms; this does not relicense unrelated site code or assets. Modern arrangements, translations, recordings, and portraits are outside this batch.

## Normalization

Removed navigation, page numbers, verse numerals, zero-width characters and indentation. Kept spelling, punctuation, case and source wording. Rejoined the ornamental initial `I` in Christmas Bells with `HEARD`. Source-defined stanza lengths were verified before import: 24, 40, 20, 24, 24, 40, 35 and 24 lines respectively.

The printed `Refrain` directives in We Three Kings are expanded for reading. Softly and Tenderly retains the refrain once, as printed on the source page. Other stanzas are displayed in their source sequence. No additional verse was generated, and no later verse was added to Amazing Grace. Editorial descriptions were written for 52lyrics, separately from the extracted text.

Artwork is the existing project-generated abstract SVG/initials design, generated locally from each writer's name; no source images were copied. Songbooks are labeled as editorial reading selections. Recording duration and producer lists remain empty, and structured data uses MusicComposition/Person/CreativeWorkSeries instead of inventing recordings or albums.

## Candidates excluded

- Jingle Bells: the inspected page explicitly warned that its source document was unknown.
- It Came Upon a Midnight Clear (Army and Navy Hymnal): the rendered text contained score syllabification and an apparent transcription error; left out pending comparison to scans.
- Early One Morning: the inspected anonymous text carried only a US public-domain notice; not included in this initial selection.
- Beautiful Dreamer: rendered material mixed score markup and publisher advertising; no complete clean lyric extraction was approved.
- Version and disambiguation pages were navigation only, never treated as lyric texts.

## Repeating or extending the import

1. Open the fixed source revision in a browser and inspect the actual lyric text, edition and copyright evidence. Follow version links where necessary.
2. Extract the displayed lyric range and stanza boundaries into `{ slug, revisionUrl, stanzas: string[][] }`, within the batch `{ schemaVersion: 1, retrievedAt: 'YYYY-MM-DD', method: 'browser-dom', records: [...] }`.
3. Review any new edition before adding it to `PUBLIC_DOMAIN_EDITIONS` and `REVIEWED_SNAPSHOTS`. Capture line counts and a fingerprint from the browser output. Do not update fingerprints merely to suppress a mismatch.
4. Run `pnpm catalog:import /absolute/path/to/staged.json`. The whole candidate validates before atomic replacement; bad or partial input leaves the previous file untouched.
5. Run `pnpm check`, `pnpm lint`, `pnpm test`, the public-domain E2E journeys, and `pnpm build`. Review the resulting source box and reading layout on desktop and mobile.

The importer reads local captured JSON; it does not run a browser or fetch remote data. Runtime browsing is unnecessary: pages, search and saved references work entirely from the bundled catalog. There is no recurring scrape or production deployment in this change.

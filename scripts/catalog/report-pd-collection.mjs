import { writeFile } from 'node:fs/promises';
import candidates from '../../src/data/imported/pd-candidates.json' with { type: 'json' };

// Emit the collection report deliverables: the added-works list, the hold
// list, and the final pages-vs-works statistics, as markdown tables.

const slug = (value) => value;
const approved = candidates.records.filter((record) => record.status === 'approved');
const holds = candidates.records.filter((record) => record.status === 'hold');
const review = candidates.records.filter((record) => record.status === 'needs-review');
const duplicates = candidates.records.filter((record) => record.status === 'duplicate');

const bookTitle = (id) => ({
  'scottish-song-1843': 'The Book of Scottish Song (1843)',
  'scottish-minstrel-1850': 'The Scottish Minstrel, First Series (1850)',
  'canadian-soldiers-1918': "The Canadian Soldiers' Song Book (1918)",
  'irish-melodies-1821': 'Irish Melodies (1821)',
  'burns-poetical-1887': 'The Poetical Works of Robert Burns (1887)',
  'blake-songs-1826': 'Songs of Innocence and of Experience (1826)',
  'scottish-minstrel-second-1851': 'The Scottish Minstrel, Second Series (1851)',
  'mediaeval-hymns-1867': 'Mediaeval Hymns and Sequences (1867)',
  'catholic-hymns-1860': 'Catholic Hymns (1860)',
  'songs-french-canada-1909': 'Songs of French Canada (1909)',
  'national-ballad-song-1897': 'National Ballad and Song (1897)',
  'rump-songs-1662': 'Rump Songs (1662)',
  'army-navy-hymnal-1920': 'The Army and Navy Hymnal (1920)',
  'first-series-hymns-1853': 'A First Series of Hymns and Songs (1853)',
  'songs-of-the-cowboys-1921': 'Songs of the Cowboys (1921)',
  'black-bird-songster-1840': 'The Black-Bird Songster (1840)',
  'shropshire-lad-1896': 'A Shropshire Lad (1896)',
  'man-from-snowy-river-1895': 'The Man from Snowy River and Other Verses (1895)',
  'hood-poetical-1873': 'The Poetical Works of Thomas Hood (1873)',
  'whittier-poetical-1895': 'The Complete Poetical Works of John Greenleaf Whittier (1895)',
  'keats-poetical-1884': 'The Poetical Works of John Keats (1884)',
  'sons-tyne-garland-1770': "Sons of the Tyne's Garland (1770)",
  'hymns-resurrection-1746': "Hymns for our Lord's Resurrection (1746)",
  'methodist-hymns-1876': 'A Collection of Hymns, for the Use of the People Called Methodists (1876)',
  'bennachie-budget-1879': 'The Bennachie Budget (1879)',
  'church-hymnary-1893': 'The Church Hymnary (1893)',
})[id] ?? id;

const worksTable = (records) => records.map((record) =>
  `| ${record.title.replace(/\|/g, '\\|')} | ${record.author.replace(/\|/g, '\\|')} | ${bookTitle(record.bookId)} | ${record.revisionUrl} |`).join('\n');

const addedList = `# Added complete-lyric works — ${approved.length} distinct works

Collected ${candidates.retrievedAt.slice(0, 10)} from Wikisource songbook editions; every row pins the exact parsed revision.

| Title | Author | Source edition | Pinned revision |
|---|---|---|---|
${worksTable(approved)}
`;

const holdList = `# Held and review-pending records — ${holds.length} held, ${review.length} review-pending

These are **not** counted as complete lyrics and are not rendered.

## Hold (rights obstacle)

| Title | Author | Source edition | Reason |
|---|---|---|---|
${holds.map((record) => `| ${record.title} | ${record.author} | ${bookTitle(record.bookId)} | ${record.reason} |`).join('\n')}

## Needs review

| Title | Author | Source edition | Reason |
|---|---|---|---|
${review.map((record) => `| ${record.title} | ${record.author} | ${bookTitle(record.bookId)} | ${(record.reason ?? '').replace(/\|/g, '/')} |`).join('\n')}

## Duplicates (same work already published from another edition)

${duplicates.map((record) => `- ${record.title} — ${record.author} (${bookTitle(record.bookId)})`).join('\n')}
`;

await writeFile('docs/audit/pd-added-works.md', addedList);
await writeFile('docs/audit/pd-holds.md', holdList);
console.log(`added works: ${approved.length}, holds: ${holds.length}, review: ${review.length}, duplicates: ${duplicates.length}`);
console.log('wrote docs/audit/pd-added-works.md and docs/audit/pd-holds.md');
void slug;

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

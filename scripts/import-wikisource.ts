import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { validateWikisourceBatch } from '../src/data/publicDomain';

const destination = resolve('src/data/imported/wikisource.json');
const args = process.argv.slice(2);
if (args.length > 1 || (args[0]?.startsWith('--') && args[0] !== '--check')) {
  throw new Error('Usage: pnpm catalog:import [--check | path/to/reviewed-browser-batch.json]');
}
const source = !args[0] || args[0] === '--check' ? destination : resolve(args[0]);
const candidate: unknown = JSON.parse(await readFile(source, 'utf8'));
// No write occurs until every item has passed shape, completeness, revision,
// and extraction-fingerprint validation against the reviewed edition manifest.
validateWikisourceBatch(candidate);
const report = candidate.records.map((record) => ({
  slug: record.slug,
  lines: record.stanzas.flat().length,
  sha256: createHash('sha256').update(JSON.stringify(record.stanzas)).digest('hex'),
  source: record.revisionUrl,
}));
if (source !== destination) {
  const temporary = `${destination}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(candidate, null, 2) + '\n', { flag: 'wx' });
  await rename(temporary, destination);
}
console.log(JSON.stringify({ status: source === destination ? 'verified' : 'imported', records: report.length, report }, null, 2));

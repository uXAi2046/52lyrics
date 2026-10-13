import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { join } from 'node:path';

// Idempotent, resumable companion to scripts/generate-static.ts: point every
// modulepreload link at an inert module so hydration does not double-fetch on
// constrained mobile links. Files already rewritten are skipped, so the script
// can be re-run after an interruption.

const root = resolve('build/client');
let rewritten = 0;
let skipped = 0;
let clean = 0;

const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { await walk(path); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const html = await readFile(path, 'utf8');
    if (html.includes('data-href="data:text/javascript,"')) { skipped += 1; continue; }
    if (!html.includes('rel="modulepreload"')) { clean += 1; continue; }
    const next = html.replace(/<link rel="modulepreload" href="([^"]+)"/g, '<link rel="modulepreload" href="data:text/javascript," data-href="$1"');
    if (next === html) { clean += 1; continue; }
    await writeFile(path, next);
    rewritten += 1;
    if (rewritten % 1000 === 0) console.log(`rewritten ${rewritten}...`);
  }
};

await walk(root);
console.log(`done: ${rewritten} rewritten, ${skipped} already done, ${clean} without modulepreload`);

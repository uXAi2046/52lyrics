import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Submit site URLs to IndexNow (Bing, Yandex, Seznam, Naver) for faster
// discovery of new pages. The key file must be live at
// https://www.52lyrics.com/<key>.txt before submitting; the key lives in
// scripts/promote/indexnow-key.txt. This is a promotion tool, not part of
// the catalog pipeline: it performs no caching and verifies nothing about
// catalog data, so it deliberately uses plain fetch instead of http.mjs.

const args = process.argv.slice(2);
if (args.includes('--help') || args.length > 2 || (args[0] && !/^\d+$/.test(args[0].replace('--limit=', '')))) {
  console.log('Usage: node scripts/promote/indexnow-submit.mjs [--limit=N]');
  console.log('  Submits sitemap URLs to api.indexnow.org in batches of 100.');
  console.log('  --limit=N submits only the first N URLs (default: all).');
  process.exit(args.includes('--help') ? 0 : 1);
}
const limitArg = args.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

const key = (await readFile(resolve('scripts/promote/indexnow-key.txt'), 'utf8')).trim();
const keyFile = `${key}.txt`;
const sitemap = await readFile('build/client/sitemap.xml', 'utf8');
const siteUrl = 'https://www.52lyrics.com';
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]).slice(0, limit);
if (!urls.length) throw new Error('No URLs found in build/client/sitemap.xml');
if (!urls.every((url) => url.startsWith(`${siteUrl}/`))) throw new Error('Sitemap contains foreign URLs');

const batchSize = 100;
const batchDelayMs = Number(process.env.INDEXNOW_BATCH_DELAY_MS ?? 5000);
// api.indexnow.org routes to all engines but rejects a key until Bing itself has
// re-validated the key file; yandex.com accepts the same key independently.
const endpoint = process.env.INDEXNOW_ENDPOINT ?? 'https://api.indexnow.org/indexnow';
let submitted = 0;
const failures = [];
for (let offset = 0; offset < urls.length; offset += batchSize) {
  const batch = urls.slice(offset, offset + batchSize);
  let response;
  // The endpoint or the local proxy occasionally drops long-running submit
  // sessions; batches are idempotent, so retry each one before giving up.
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: 'www.52lyrics.com', key, keyLocation: `${siteUrl}/${keyFile}`, urlList: batch }),
      });
      break;
    } catch (error) {
      if (attempt === 3) failures.push({ offset, status: `network: ${error.cause?.code ?? error.message}` , body: '' });
      else await new Promise((done) => setTimeout(done, attempt * 3000));
    }
  }
  // 200/202 accepted; 400-422 key or URL problems; 403/429 throttled.
  if (response && (response.status === 200 || response.status === 202)) {
    submitted += batch.length;
    console.log(`batch ${offset / batchSize + 1}: accepted (${submitted}/${urls.length})`);
  } else if (response) {
    failures.push({ offset, status: response.status, body: (await response.text()).slice(0, 200) });
    console.error(`batch ${offset / batchSize + 1}: HTTP ${response.status}`);
  } else {
    console.error(`batch ${offset / batchSize + 1}: network failure after 3 attempts`);
  }
  // IndexNow throttles bursts per key with HTTP 403/429; a slow fixed pace is expected.
  await new Promise((done) => setTimeout(done, batchDelayMs));
}
console.log(JSON.stringify({ submitted, failedBatches: failures.length, keyFile, endpoint, total: urls.length }));
if (failures.length) process.exit(1);

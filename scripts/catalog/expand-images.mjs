import assert from 'node:assert/strict';
import { mkdir, open, readFile, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { atomicJson, cacheDir, download, sha256, sourceJson } from './http.mjs';
import { imageDimensions } from './image-dimensions.mjs';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const output = resolve(cacheDir, 'images-expansion.json');
const lockPath = resolve(cacheDir, 'images-expansion.lock');
const lock = await open(lockPath, 'wx');
await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
const window = new JSDOM('').window;
const stripHtml = (value) => new window.DOMParser().parseFromString(value || '', 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
const approvedLicense = /^(CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC BY-SA 2\.0 fr|CC0|Public domain)$/;
let stopping = false;
process.on('SIGINT', () => { stopping = true; });
process.on('SIGTERM', () => { stopping = true; });
const follow = process.argv.includes('--follow');

try {
  let state;
  try { state = await json(output); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  state ||= { ...await json('src/data/imported/commons.json'), attempted: [], status: 'running', fallbacks: [] };
  if (process.argv.includes('--retry-fallbacks')) {
    const retry = new Set(state.fallbacks.map((item) => item.wikidataId));
    state.attempted = state.attempted.filter((id) => !retry.has(id));
    state.previousFallbacks = [...(state.previousFallbacks || []), ...state.fallbacks];
    state.fallbacks = [];
  }
  state.status = 'running';
  const seen = new Set(state.records.map((record) => record.wikidataId));
  const attempted = new Set(state.attempted);
  await mkdir(resolve('public/artwork/imported'), { recursive: true });
  while (!stopping) {
    const metadata = await json(resolve(cacheDir, 'musicbrainz/expansion.json'));
    for (const artist of metadata.artists) {
      if (stopping) break;
      if (seen.has(artist.wikidataId) || attempted.has(artist.wikidataId)) continue;
      try {
        let pageTitle = artist.wikipedia;
        const filenames = [];
        // Prefer the identity-linked Commons image; Wikipedia leads can be non-free or unreachable.
        const entity = await sourceJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${artist.wikidataId}&props=claims&format=json`);
        assert.equal(entity.entities[artist.wikidataId]?.id, artist.wikidataId, 'Wikidata image identity mismatch');
        for (const claim of entity.entities[artist.wikidataId]?.claims.P18 || []) {
          const filename = claim.mainsnak.datavalue?.value;
          if (claim.rank !== 'deprecated' && filename && !filenames.includes(filename)) filenames.push(filename);
        }
        if (!filenames.length) {
          const result = await sourceJson(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', titles: artist.wikipedia, prop: 'pageprops|pageimages', piprop: 'name', redirects: '1', format: 'json' })}`);
          const page = Object.values(result.query.pages)[0];
          assert.equal(page.pageprops?.wikibase_item, artist.wikidataId, 'Wikipedia photo page belongs to a different identity');
          pageTitle = page.title;
          if (page.pageimage) filenames.push(page.pageimage);
        }
        assert(filenames.length, 'No source image; use the local typographic avatar');
        let record;
        const reasons = [];
        for (const filename of filenames.slice(0, 3)) {
          try {
            const response = await sourceJson(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ action: 'query', titles: `File:${filename}`, prop: 'imageinfo', iiprop: 'url|extmetadata|mime|size|sha1', iiurlwidth: '640', format: 'json' })}`);
            const info = Object.values(response.query.pages)[0].imageinfo?.[0];
            assert(info, 'Not a Commons-hosted image');
            const fields = info.extmetadata;
            const license = stripHtml(fields.LicenseShortName?.value);
            assert(approvedLicense.test(license), `Unsupported license: ${license || 'missing'}`);
            assert(!/noncommercial|no derivatives/i.test(stripHtml(fields.Restrictions?.value)), 'Image restrictions');
            const author = stripHtml(fields.Artist?.value);
            assert(author, 'Missing author credit');
            const licenseUrl = new URL(fields.LicenseUrl?.value?.replace(/^\/\//, 'https://') || 'https://commons.wikimedia.org/wiki/Help:Public_domain');
            assert(['creativecommons.org', 'commons.wikimedia.org'].includes(licenseUrl.hostname) && ['http:', 'https:'].includes(licenseUrl.protocol), 'Unsupported license URL');
            licenseUrl.protocol = 'https:';
            assert(info.descriptionurl.startsWith('https://commons.wikimedia.org/wiki/File:'), 'Invalid source description URL');
            const downloadUrl = info.thumburl || info.url;
            const bytes = await download(downloadUrl, imageDimensions);
            const dimensions = imageDimensions(bytes);
            const extension = bytes[0] === 0xff && bytes[1] === 0xd8 ? 'jpg' : 'png';
            const localPath = `/artwork/imported/${sha256(filename).slice(0, 20)}.${extension}`;
            await writeFile(resolve('public', `.${localPath}`), bytes);
            record = {
              name: artist.name, mbid: artist.mbid, wikipediaTitle: pageTitle, wikidataId: artist.wikidataId,
              filename, localPath, sourceUrl: info.descriptionurl, downloadUrl, originalUrl: info.url,
              author, credit: stripHtml(fields.Credit?.value), license, licenseUrl: licenseUrl.href,
              attribution: stripHtml(fields.Attribution?.value), description: stripHtml(fields.ImageDescription?.value),
              ...dimensions, reportedDimensions: { width: info.thumbwidth || info.width, height: info.thumbheight || info.height },
              sha256: sha256(bytes), originalSha1: info.sha1, retrievedAt: new Date().toISOString(),
            };
            break;
          } catch (error) { reasons.push(`${filename}: ${error.message.split('\n')[0]}`); }
        }
        assert(record, reasons.join('; '));
        state.records.push(record); seen.add(artist.wikidataId);
        console.log(`Photo ${state.records.length}: ${artist.name} — ${record.license}`);
      } catch (error) {
        state.fallbacks.push({ name: artist.name, mbid: artist.mbid, wikidataId: artist.wikidataId, reason: error.message, at: new Date().toISOString(), fallback: 'local-typographic-avatar' });
        console.log(`Local avatar retained: ${artist.name}: ${error.message.split('\n')[0]}`);
      }
      state.attempted.push(artist.wikidataId); attempted.add(artist.wikidataId);
      state.retrievedAt = new Date().toISOString();
      await atomicJson(output, state);
    }
    if (!follow || metadata.status !== 'running') break;
    // Only follow a verified live collector; a stale checkpoint must not keep this process alive forever.
    try {
      const producer = await json(resolve(cacheDir, 'musicbrainz/expansion.lock'));
      process.kill(producer.pid, 0);
    } catch (error) {
      // The producer may have completed after this iteration's snapshot. Read its final batch next.
      const latest = await json(resolve(cacheDir, 'musicbrainz/expansion.json'));
      if (latest.status !== 'running') continue;
      throw error;
    }
    await new Promise((done) => setTimeout(done, 15000));
  }
  state.status = stopping ? 'interrupted' : 'complete';
  await atomicJson(output, state);
  console.log(JSON.stringify({ status: state.status, photos: state.records.length, fallbacks: state.fallbacks.length }));
} finally {
  window.close();
  await lock.close();
  await unlink(lockPath);
}

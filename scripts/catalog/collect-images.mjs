import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { atomicJson, cacheDir, download, sha256, sourceJson } from './http.mjs';

const seeds = JSON.parse(await readFile(resolve(cacheDir, 'musicbrainz/seeds.json'), 'utf8'));
const stripHtml = (value) => new JSDOM(value || '').window.document.body.textContent.replace(/\s+/g, ' ').trim();
const records = [];
const skipped = [];
await mkdir(resolve('public/artwork/imported'), { recursive: true });
for (const seed of seeds) {
  try {
    const result = await sourceJson(`https://en.wikipedia.org/w/api.php?${new URLSearchParams({ action: 'query', titles: seed.wikipedia, prop: 'pageprops|pageimages', piprop: 'name', redirects: '1', format: 'json' })}`);
    const page = Object.values(result.query.pages)[0];
    if (!page.pageimage) throw new Error('No lead image.');
    const source = await sourceJson(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams({ action: 'query', titles: `File:${page.pageimage}`, prop: 'imageinfo', iiprop: 'url|extmetadata|mime|size|sha1', iiurlwidth: '640', format: 'json' })}`);
    const file = Object.values(source.query.pages)[0];
    const info = file.imageinfo?.[0];
    if (!info) throw new Error('Image is not hosted on Commons.');
    const fields = info.extmetadata;
    const license = stripHtml(fields.LicenseShortName?.value);
    if (!/^(CC BY(?:-SA)? (?:2\.0|2\.5|3\.0|4\.0)|CC BY-SA 2\.0 fr|CC0|Public domain)$/i.test(license)) throw new Error(`License not approved: ${license || 'missing'}`);
    if (fields.Restrictions?.value && /noncommercial|no derivatives/i.test(stripHtml(fields.Restrictions.value))) throw new Error('Restricted image.');
    const author = stripHtml(fields.Artist?.value);
    if (!author) throw new Error('Missing author credit.');
    const downloadUrl = info.thumburl || info.url;
    const data = await download(downloadUrl);
    let extension;
    if (data[0] === 0xff && data[1] === 0xd8) extension = 'jpg';
    else if (data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) extension = 'png';
    else throw new Error('Unsupported or invalid image bytes.');
    const localPath = `/artwork/imported/${sha256(page.pageimage).slice(0, 20)}.${extension}`;
    await writeFile(resolve('public', `.${localPath}`), data);
    records.push({ name: seed.name, wikipediaTitle: page.title, wikidataId: page.pageprops.wikibase_item, filename: page.pageimage, localPath, sourceUrl: info.descriptionurl, downloadUrl, originalUrl: info.url, author, credit: stripHtml(fields.Credit?.value), license, licenseUrl: fields.LicenseUrl?.value?.replace(/^\/\//, 'https://') || 'https://commons.wikimedia.org/wiki/Help:Public_domain', attribution: stripHtml(fields.Attribution?.value), description: stripHtml(fields.ImageDescription?.value), width: info.thumbwidth || info.width, height: info.thumbheight || info.height, sha256: sha256(data), originalSha1: info.sha1, retrievedAt: new Date().toISOString() });
    console.log(`Image ${records.length}: ${seed.name} — ${license}`);
  } catch (error) {
    skipped.push({ name: seed.name, reason: error.message });
    console.error(`Image skipped: ${seed.name}: ${error.message}`);
  }
  await atomicJson(resolve(cacheDir, 'images.json'), { schemaVersion: 1, records, skipped });
}
console.log(JSON.stringify({ imported: records.length, skipped }));

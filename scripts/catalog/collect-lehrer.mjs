import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { atomicJson, cacheDir, download, sha256, sourceJson } from './http.mjs';

const root = 'https://tomlehrersongs.com/';
const htmlDocument = (html) => new JSDOM(html, { url: root }).window.document;
const text = (html) => htmlDocument(html).body.textContent.trim();
await mkdir(resolve(cacheDir, 'lehrer'), { recursive: true });
const statement = (await download(root)).toString('utf8');
if (!text(statement).includes('permanently and irrevocably relinquished')) throw new Error('Author permission statement is missing.');
const songs = [];
const excluded = [];
for (let page = 1; page <= 3; page++) {
  const posts = await sourceJson(`${root}wp-json/wp/v2/posts?per_page=100&page=${page}`);
  for (const post of posts) {
    const document = htmlDocument(post.content.rendered);
    const links = [...document.querySelectorAll('a[href]')];
    const isLyricLink = (link) => {
      const range = document.createRange();
      range.selectNodeContents(link.parentElement);
      range.setEndBefore(link);
      const label = range.toString().toLowerCase();
      return label.lastIndexOf('lyrics') > label.lastIndexOf('sheet music');
    };
    const lyricLinks = links.filter((link) => /\.pdf$/i.test(link.href) && !/-music[.\-]/i.test(link.href) && isLyricLink(link));
    const docxLinks = links.filter((link) => /\.docx$/i.test(link.href) && isLyricLink(link));
    // A score is a source to review, never an automatically approved lyric body.
    const pdfLinks = lyricLinks.length ? lyricLinks : links.filter((link) => /\.pdf$/i.test(link.href));
    if (!post.class_list.includes('category-songs')) continue;
    if (!pdfLinks.length && !docxLinks.length) {
      excluded.push({ slug: post.slug, title: text(post.title.rendered), sourceUrl: post.link, reason: 'No downloadable lyric document or score found.' });
      continue;
    }
    const pdfs = [];
    for (const link of pdfLinks) {
      const url = link.href;
      const data = await download(url);
      if (!data.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error(`Not a PDF: ${url}`);
      const kind = lyricLinks.length ? 'lyric-sheet' : 'score';
      const filename = kind === 'score' ? `${post.slug}-score.pdf` : `${post.slug}-${pdfs.length + 1}.pdf`;
      await writeFile(resolve(cacheDir, 'lehrer', filename), data);
      pdfs.push({ url, filename, sha256: sha256(data), kind });
    }
    const documents = [];
    for (const link of docxLinks) {
      const data = await download(link.href);
      if (!data.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]))) throw new Error(`Not a DOCX archive: ${link.href}`);
      const filename = `${post.slug}-lyrics${documents.length ? `-${documents.length + 1}` : ''}.docx`;
      await writeFile(resolve(cacheDir, 'lehrer', filename), data);
      documents.push({ url: link.href, filename, sha256: sha256(data), format: 'docx', kind: 'lyric-sheet' });
    }
    songs.push({ slug: post.slug, title: text(post.title.rendered), sourceUrl: post.link, sourceModified: post.modified_gmt, categories: post.class_list.filter((value) => value.startsWith('category-')), pageText: document.body.textContent.trim(), pdfs, documents });
    console.log(`Lyrics source ${songs.length}: ${text(post.title.rendered)} (${pdfs.length} PDF)`);
  }
  if (posts.length < 100) break;
}
const albums = [];
const index = htmlDocument((await download(`${root}albums/`)).toString('utf8'));
const albumUrls = [...new Set([...index.querySelectorAll('a[href]')].map((link) => link.href).filter((href) => /\/albums\/.+/.test(href) && !/\.rar/.test(href)))];
for (const url of albumUrls) {
  const html = (await download(url)).toString('utf8');
  const document = htmlDocument(html);
  const playlists = [...document.querySelectorAll('script.wp-playlist-script, script.cue-playlist-data')].map((script) => JSON.parse(script.textContent));
  albums.push({ url, title: document.querySelector('h1')?.textContent.trim(), playlists });
}
await atomicJson(resolve(cacheDir, 'lehrer/inventory.json'), { schemaVersion: 1, retrievedAt: new Date().toISOString(), evidenceUrl: root, evidenceSha256: sha256(statement), songs, albums, excluded });
await atomicJson(resolve('src/data/imported/lehrer-sources.json'), {
  schemaVersion: 1, status: 'source-material-awaiting-transcription-review', retrievedAt: new Date().toISOString(),
  evidenceUrl: root, evidenceSha256: sha256(statement),
  songs: songs.map(({ slug, title, sourceUrl, sourceModified, pdfs, documents }) => ({ slug, title, sourceUrl, sourceModified, pdfs, documents })),
  albums: albums.map((album) => ({ title: album.title, sourceUrl: album.url, tracks: album.playlists.flatMap((playlist) => playlist.tracks).map(({ title, length, artist }) => ({ title, length, artist })) })), excluded,
});
console.log(JSON.stringify({ songs: songs.length, albums: albums.map((album) => ({ title: album.title, tracks: album.playlists.flatMap((list) => list.tracks).length })) }));

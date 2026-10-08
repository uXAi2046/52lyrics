import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { ARTISTS, ALBUMS, SONGS, artistPath, albumPath, songPath } from '../../src/data/catalog.ts';
import photos from '../../src/data/imported/commons.json' with { type: 'json' };
import { sha256 } from './http.mjs';

const sitemap = await readFile('build/client/sitemap.xml', 'utf8');
const entries = [
  ...ARTISTS.map((item) => ({ item, path: artistPath(item), title: item.name })),
  ...ALBUMS.map((item) => ({ item, path: albumPath(item), title: item.title })),
  ...SONGS.map((item) => ({ item, path: songPath(item), title: item.title })),
];
for (const { item, path, title } of entries) {
  const html = await readFile(`build/client${path}/index.html`, 'utf8');
  const dom = new JSDOM(html);
  const document = dom.window.document;
  assert(document.title.includes(title), `Missing page-specific title: ${path}`);
  assert.equal(document.querySelector('h1')?.textContent, title, `Wrong rendered heading: ${path}`);
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  assert(canonical?.endsWith(path), `Wrong canonical: ${path}`);
  assert(sitemap.includes(canonical), `Not in sitemap: ${path}`);
  const structuredData = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent));
  if ('biography' in item) {
    assert.equal(document.querySelector('.artist-hero__bio')?.textContent, item.biography, `Wrong artist biography: ${path}`);
    assert.deepEqual([...document.querySelectorAll('.tag-list > span')].map((tag) => tag.textContent), item.genres, `Wrong artist genre labels: ${path}`);
    if (item.profileSource) assert([...document.querySelectorAll('a')].some((anchor) => anchor.href === item.profileSource.url), `Missing profile source: ${path}`);
  }
  if ('tracks' in item) {
    const schema = structuredData.find((data) => data.name === item.title);
    assert.equal(schema?.['@type'], item.type === 'Songbook' ? 'CreativeWorkSeries' : 'MusicAlbum', `Wrong release semantics: ${path}`);
    if (item.type === 'Songbook') assert(!('datePublished' in schema), `Invented songbook release date: ${path}`);
    const rows = [...document.querySelectorAll('.track-list ol li')];
    assert.equal(rows.length, item.tracks.length, `Wrong track count: ${path}`);
    rows.forEach((row, index) => {
      const track = item.tracks[index];
      assert.equal(row.querySelector('a')?.getAttribute('href'), songPath(track), `Wrong track order: ${path}`);
      if (item.tracks.some((song) => (song.discNumber || 1) > 1)) {
        assert.equal(row.querySelector('span')?.getAttribute('aria-label'), `Disc ${track.discNumber}, track ${track.discTrackNumber}`, `Lost disc position: ${path}`);
      }
    });
  }
  if ('lyricsAvailability' in item) {
    if (item.releaseYear === null) {
      assert(document.querySelector('.lyric-facts')?.textContent.includes('Undated text'), `Missing undated-text label: ${path}`);
      const schema = structuredData.find((data) => data.name === item.title);
      assert(schema && !('datePublished' in schema), `Invented text release date: ${path}`);
    }
    assert.equal(document.querySelectorAll('.lyrics-copy > section').length, item.sections.length, `Wrong lyric sections: ${path}`);
    [...document.querySelectorAll('.lyrics-copy > section')].forEach((section, index) => {
      assert.deepEqual([...section.querySelectorAll('p')].map((line) => line.textContent), item.sections[index].content, `Wrong lyric lines or order: ${path}, section ${index + 1}`);
      if (item.sections[index].label) assert.equal(section.querySelector('span')?.textContent, item.sections[index].label, `Lost source section heading: ${path}`);
      if (item.sections[index].language) assert([...section.querySelectorAll('p')].every((line) => line.lang === item.sections[index].language), `Lost source language: ${path}`);
    });
    if (item.lyricsAvailability === 'metadata-only') assert(document.body.textContent.includes('Lyrics unavailable in this catalog.'), `Missing availability notice: ${path}`);
    if (item.source) assert([...document.querySelectorAll('a')].some((anchor) => anchor.href === item.source.revisionUrl), `Missing text source: ${path}`);
    if (item.source?.documentType === 'score-pdf') assert([...document.querySelectorAll('a')].some((anchor) => anchor.href === item.source.revisionUrl && anchor.textContent === 'Read the author’s score (PDF)'), `Score mislabeled as a lyric sheet: ${path}`);
    if (item.source?.underlyingWork) {
      assert(document.querySelector('.lyrics-copy > footer')?.textContent.includes('Written by ' + item.writers.join(', ')), `Lost shared authorship: ${path}`);
      assert(document.querySelector('.underlying-work')?.textContent.includes(item.source.underlyingWork.rightsNote), `Missing original-work context: ${path}`);
      for (const url of item.source.underlyingWork.evidenceUrls) assert([...document.querySelectorAll('.underlying-work a')].some((anchor) => anchor.href === url), `Missing original-work evidence: ${path}`);
      const schema = structuredData.find((data) => data.name === item.title);
      assert.deepEqual(schema.lyricist.map((writer) => writer.name), item.writers, `Wrong structured authorship: ${path}`);
    }
  }
  if (item.metadataSource) assert([...document.querySelectorAll('a')].some((anchor) => anchor.href === item.metadataSource.url), `Missing metadata source: ${path}`);
  if (item.imageCredit) {
    assert.equal(document.querySelector('.artist-hero__image img')?.getAttribute('src'), item.imageUrl, `Wrong portrait: ${path}`);
    assert([...document.querySelectorAll('a')].some((anchor) => anchor.href === item.imageCredit.sourceUrl), `Missing photo attribution: ${path}`);
  }
  dom.window.close();
}
for (const photo of photos.records) {
  assert.equal(sha256(await readFile(`build/client${photo.localPath}`)), photo.sha256, `Photo not bundled: ${photo.name}`);
}
console.log(`Verified ${entries.length} detail pages: titles, headings, canonical URLs, sitemap, lyric states, source links; ${photos.records.length} bundled photo checksums.`);

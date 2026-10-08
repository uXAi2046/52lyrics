import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cacheDir, sha256 } from './http.mjs';

/** Verify facts against the exact cached query, not merely a matching source URL. */
export async function verifyArtistProfiles(batch, artists) {
  assert.equal(batch.schemaVersion, 1);
  assert.equal(batch.provider, 'Wikidata');
  assert.equal(batch.license, 'CC0-1.0');
  const seen = new Set();
  const responses = new Map();
  for (const record of batch.records) {
    const artist = artists.find((item) => item.wikidataId === record.wikidataId && item.mbid === record.mbid);
    assert(artist && artist.name === record.name, `Profile identity mismatch: ${record.name}`);
    assert(!seen.has(record.wikidataId), 'Duplicate profile identity');
    seen.add(record.wikidataId);
    assert.equal(record.sourceUrl, `https://www.wikidata.org/wiki/${record.wikidataId}`);
    assert(record.queryUrl.startsWith('https://query.wikidata.org/sparql?'), 'Invalid profile query origin');
    if (!responses.has(record.queryUrl)) {
      const bytes = await readFile(resolve(cacheDir, sha256(record.queryUrl)));
      const receipt = JSON.parse(await readFile(resolve(cacheDir, `${sha256(record.queryUrl)}.json`), 'utf8'));
      assert.equal(receipt.url, record.queryUrl);
      assert.equal(receipt.sha256, sha256(bytes));
      responses.set(record.queryUrl, { response: JSON.parse(bytes.toString('utf8')), receipt });
    }
    const { response, receipt } = responses.get(record.queryUrl);
    assert.equal(receipt.sha256, record.sourceSha256);
    assert.equal(receipt.retrievedAt, record.retrievedAt);
    const rows = response.results.bindings.filter((row) => row.artist.value.split('/').at(-1) === record.wikidataId);
    assert(rows.length, `Missing source profile: ${record.name}`);
    const descriptions = [...new Set(rows.map((row) => row.description?.value).filter(Boolean))];
    assert(descriptions.length <= 1, `Ambiguous description: ${record.name}`);
    assert.equal(record.description, descriptions[0] || null, `Description differs from source: ${record.name}`);
    const genres = new Map();
    for (const row of rows) {
      const id = row.genre?.value.split('/').at(-1);
      const name = row.genreLabel?.value;
      if (id && /^Q\d+$/.test(id) && name && !/^Q\d+$/.test(name)) genres.set(id, { id, name });
    }
    assert.deepEqual(record.genres, [...genres.values()].sort((a, b) => a.name.localeCompare(b.name, 'en')), `Genres differ from source: ${record.name}`);
  }
  return { profiles: seen.size, descriptions: batch.records.filter((record) => record.description).length, withGenres: batch.records.filter((record) => record.genres.length).length, pending: artists.filter((artist) => !seen.has(artist.wikidataId)).length };
}

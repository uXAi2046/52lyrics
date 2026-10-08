import assert from 'node:assert/strict';
import { open, readFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { atomicJson, cacheDir, sha256, sourceJson } from './http.mjs';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const output = resolve(cacheDir, 'artist-profiles-expansion.json');
const lockPath = resolve(cacheDir, 'artist-profiles-expansion.lock');
const lock = await open(lockPath, 'wx');
await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
let stopping = false;
process.on('SIGINT', () => { stopping = true; });
process.on('SIGTERM', () => { stopping = true; });
const follow = process.argv.includes('--follow');

try {
  let state;
  try { state = await json(output); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  state ||= { schemaVersion: 1, provider: 'Wikidata', license: 'CC0-1.0', records: [], queries: [] };
  state.status = 'running';
  const seen = new Set(state.records.map((record) => record.wikidataId));
  while (!stopping) {
    const metadata = await json(resolve(cacheDir, 'musicbrainz/expansion.json'));
    const pending = metadata.artists.filter((artist) => !seen.has(artist.wikidataId));
    for (let offset = 0; offset < pending.length && !stopping; offset += 25) {
      const group = pending.slice(offset, offset + 25);
      // Wait for a full batch while the producer runs; the final batch includes every remaining artist.
      if (follow && metadata.status === 'running' && group.length < 25) break;
      assert(group.every((artist) => /^Q\d+$/.test(artist.wikidataId)), 'Invalid artist entity');
      const query = `SELECT ?artist ?description ?genre ?genreLabel WHERE {
        VALUES ?artist { ${group.map((artist) => `wd:${artist.wikidataId}`).join(' ')} }
        OPTIONAL { ?artist schema:description ?description. FILTER(LANG(?description) = "en") }
        OPTIONAL { ?artist wdt:P136 ?genre. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
      } ORDER BY ?artist ?genre`;
      const url = 'https://query.wikidata.org/sparql?' + new URLSearchParams({ query, format: 'json' });
      const response = await sourceJson(url);
      assert(Array.isArray(response.results?.bindings), 'Invalid profile source response');
      const receipt = await json(resolve(cacheDir, `${sha256(url)}.json`));
      const records = group.map((artist) => {
        const rows = response.results.bindings.filter((row) => row.artist?.value.split('/').at(-1) === artist.wikidataId);
        assert(rows.length, `Profile source omitted artist: ${artist.name}`);
        const descriptions = [...new Set(rows.map((row) => row.description?.value).filter(Boolean))];
        assert(descriptions.length <= 1, `Ambiguous English description: ${artist.name}`);
        const genres = new Map();
        for (const row of rows) {
          const id = row.genre?.value.split('/').at(-1);
          const name = row.genreLabel?.value;
          if (id && /^Q\d+$/.test(id) && name && !/^Q\d+$/.test(name)) genres.set(id, { id, name });
        }
        return {
          wikidataId: artist.wikidataId, mbid: artist.mbid, name: artist.name,
          description: descriptions[0] || null, genres: [...genres.values()].sort((a, b) => a.name.localeCompare(b.name, 'en')),
          sourceUrl: `https://www.wikidata.org/wiki/${artist.wikidataId}`,
          queryUrl: url, sourceSha256: receipt.sha256, retrievedAt: receipt.retrievedAt,
        };
      });
      state.records.push(...records);
      for (const record of records) seen.add(record.wikidataId);
      state.queries.push({ url, sha256: receipt.sha256, wikidataIds: group.map((artist) => artist.wikidataId), retrievedAt: receipt.retrievedAt });
      state.retrievedAt = new Date().toISOString();
      await atomicJson(output, state);
      console.log(`Profiles: ${state.records.length} identities; ${records.filter((record) => record.description).length}/${records.length} with English descriptions in this batch.`);
    }
    if (!follow || metadata.status !== 'running') break;
    try {
      const producer = await json(resolve(cacheDir, 'musicbrainz/expansion.lock'));
      process.kill(producer.pid, 0);
    } catch (error) {
      const latest = await json(resolve(cacheDir, 'musicbrainz/expansion.json'));
      if (latest.status !== 'running') continue;
      throw error;
    }
    await new Promise((done) => setTimeout(done, 15000));
  }
  state.status = stopping ? 'interrupted' : 'complete';
  await atomicJson(output, state);
  console.log(JSON.stringify({ status: state.status, records: state.records.length, descriptions: state.records.filter((record) => record.description).length, withGenres: state.records.filter((record) => record.genres.length).length }));
} finally {
  await lock.close();
  await unlink(lockPath);
}

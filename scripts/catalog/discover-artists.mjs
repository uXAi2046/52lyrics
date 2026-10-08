import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { atomicJson, sourceJson, sha256 } from './http.mjs';

// Selection scope is English-speaking recording markets, not a popularity claim.
const countries = ['Q30', 'Q145', 'Q16', 'Q408', 'Q664', 'Q27'];
const kinds = {
  singers: 'VALUES ?occupation { wd:Q177220 wd:Q488205 wd:Q2252262 } ?artist wdt:P106 ?occupation; wdt:P27 ?country.',
  groups: '?artist wdt:P31/wdt:P279* wd:Q215380; wdt:P495 ?country.',
};
const records = new Map();
const identities = new Map();
let previousBatch;
try { previousBatch = JSON.parse(await readFile('scripts/catalog/artist-expansion-seeds.json', 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const queries = [...(previousBatch?.queries || [])];
// Keep earlier names and their exact source queries: discovery sources are mutable.
for (const previous of previousBatch?.artists || []) {
  const record = { ...previous, mbids: [...new Set(previous.mbids || [previous.mbid])] };
  records.set(record.mbid, record); identities.set(record.wikidataId, record);
}
for (const [kind, constraint] of Object.entries(kinds)) {
 for (const country of countries) {
  const query = `SELECT ?artist ?artistLabel ?mbid ?article ?sitelinks WHERE {
    { SELECT DISTINCT ?artist ?mbid ?article ?sitelinks WHERE {
      VALUES ?country { wd:${country} }
      ${constraint}
      ?artist wdt:P434 ?mbid; wikibase:sitelinks ?sitelinks.
      ?article schema:about ?artist; schema:isPartOf <https://en.wikipedia.org/>.
    } ORDER BY DESC(?sitelinks) ?artist LIMIT 180 }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en,mul". }
  } ORDER BY DESC(?sitelinks) ?artist`;
  const url = 'https://query.wikidata.org/sparql?' + new URLSearchParams({ query, format: 'json' });
  const response = await sourceJson(url);
  assert(Array.isArray(response.results?.bindings), 'Invalid Wikidata discovery response');
  if (!queries.some((item) => item.url === url)) queries.push({ kind, country, url, querySha256: sha256(query), count: response.results.bindings.length });
  for (const row of response.results.bindings) {
    const wikidataId = row.artist.value.split('/').at(-1);
    const mbid = row.mbid.value;
    if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(mbid) || !/^Q\d+$/.test(wikidataId)) continue;
    const article = new URL(row.article.value);
    assert.equal(article.hostname, 'en.wikipedia.org');
    assert(article.pathname.startsWith('/wiki/'));
    if (/^Q\d+$/.test(row.artistLabel.value)) continue;
    const previous = identities.get(wikidataId);
    if (previous) {
      if (!previous.mbids.includes(mbid)) previous.mbids.push(mbid);
      continue;
    }
    if (records.has(mbid)) continue;
    const record = {
      name: row.artistLabel.value, wikipedia: decodeURIComponent(article.pathname.slice('/wiki/'.length)).replaceAll('_', ' '),
      wikidataId, mbid, mbids: [mbid], selectionKind: kind, sourceUrl: row.artist.value.replace('http:', 'https:'),
      sitelinks: Number(row.sitelinks.value), genres: [], existingId: null, existingAlbums: [],
    };
    records.set(mbid, record);
    identities.set(wikidataId, record);
  }
  console.log(`${kind}/${country}: ${response.results.bindings.length} source rows; ${records.size} unique MusicBrainz identities`);
 }
}
const artists = [...records.values()].sort((a, b) => b.sitelinks - a.sitelinks || a.mbid.localeCompare(b.mbid));
assert(artists.length >= 500, 'Not enough verified discovery candidates for a 500-artist collection');
await atomicJson('scripts/catalog/artist-expansion-seeds.json', {
  schemaVersion: 1, retrievedAt: new Date().toISOString(), provider: 'Wikidata', license: 'CC0-1.0',
  selection: 'Singers, singer-songwriters, rappers and musical groups associated with the US, UK, Canada, Australia, New Zealand or Ireland; English Wikipedia article and MusicBrainz ID required. Sitelinks order source discovery only, not a public chart.',
  queries, artists,
});
console.log(`Saved ${artists.length} distinct source-linked artist candidates.`);

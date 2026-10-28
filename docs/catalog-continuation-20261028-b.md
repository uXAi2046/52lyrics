# Catalog continuation — 28 October 2026, sixth round

## Result

The published catalog grew to **1,270 recording artists with imported releases** (1,357
editions, 16,228 tracks, 1,167 photographs) and **2,254 distinct approved full-lyric
works**. This round added 30 artists and 48 lyrics.

## Lyrics and metadata

- **Wessex Poems and Other Verses (1899, Thomas Hardy)** added; 48 approved works
  (author-death mode; Hardy d. 1928). The 1899 edition is PD-US and Hardy's works are
  public domain in life-plus-70 jurisdictions since 1999.
- Metadata checkpoint extended to target 1270; 1,167 photographs and 1,271 Wikidata
  profiles (all with English descriptions) collected; increment published through the
  full gate.

## Checks and deployment

All gates passed (check/lint/73 tests/verify-sources/canonical build with sitemap
5,730 URLs/verify-build with 21,960 detail pages and 1,167 photo checksums). Commit
`316ce630` deployed via the server candidate workflow; live homepage SHA-256
`5cb32b0e…` matches the local build byte for byte. IndexNow: 5,730 URLs accepted
by Yandex.

## Resume point

- Metadata checkpoint at 1,270; raise with `--target=1300`.
- Lyrics: no further per-song Wikisource songbook inventory remains from the probes
  run this session; future lyric growth needs a new source class.

# Catalog continuation — 27 October 2026, third round

## Result

The published catalog grew to **1,180 recording artists with imported releases** (1,267
editions, 15,180 tracks, 1,099 photographs) and **2,023 distinct approved full-lyric
works** — this session's three rounds together added **90 artists and 624 complete
lyrics** (on top of the 607-work round of 25 October). Sitemap: 5,313 URLs.

## Lyrics: two new poet collections

| Book | Year | Rights mode | Pages | Approved |
| --- | --- | --- | ---: | ---: |
| The Complete Poetical Works of John Greenleaf Whittier | 1895 | unconditional (d. 1892) | 314 | 270 |
| The Poetical Works of John Keats | 1884 | unconditional (d. 1821) | 71 | 67 |

## Metadata: target 1150 → 1180

Thirty more artists verified with complete studio editions; new Commons photographs
(1,099 total) and 1,181 Wikidata profiles collected; increment published through the
full gate.

## Checks and deployment

- `pnpm check`, `pnpm lint`, 73 tests, `catalog:verify-sources` (1,181 artists, 1,267
  releases, 15,180 tracks, 1,099 photographs), canonical build (sitemap 5,313 URLs),
  `catalog:verify-build` (20,495 detail pages, 1,099 photo checksums) — all passed.
- Commit `9505a24a` deployed through the server candidate workflow; live homepage
  SHA-256 `6299e281…` matches the local build byte for byte; Whittier and Keats pages
  return 200 and render in the browser.
- IndexNow: 5,313 URLs accepted by Yandex. The Bing-side aggregate remains pending
  its re-validation of the key file; re-run `node scripts/promote/indexnow-submit.mjs`.

## Session totals (2026-10-25 → 10-27)

Published catalog went from 1,030 artists / 779 lyric works to **1,180 artists /
2,023 lyric works** (+150 artists, +1,244 complete lyrics), every record source-pinned
and license-verified, deployed in eight verified production releases.

## Resume point

- Metadata checkpoint at 1,180; raise with `--target=1210`.
- Lyrics: Wikisource per-song inventory now thoroughly exhausted (probe log in this
  session's rounds). Future growth needs a new source class within the pipeline's
  allowlist policy or a deliberate policy extension.

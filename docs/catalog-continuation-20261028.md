# Catalog continuation — 28 October 2026, fifth round

## Result

The published catalog grew to **1,240 recording artists with imported releases** (1,327
editions, 15,887 tracks, 1,145 photographs) and **2,206 distinct approved full-lyric
works**. This round added 30 artists and 150 lyrics. Since 25 October the catalog has
grown by **210 artists and 1,427 complete lyrics** across eight verified deployments.

## Lyrics: two new collections

| Book | Year | Rights mode | Pages | Approved |
| --- | --- | --- | ---: | ---: |
| The Complete Poems of Paul Laurence Dunbar | 1913 | unconditional (d. 1906; life+70 expired 1976) | 418 | 142 |
| Poems on Slavery (Henry Wadsworth Longfellow) | 1842 | unconditional (d. 1882) | 9 | 8 |

Dunbar's pages mostly lack scan-transclusion quality markers (pageQuality null), which
the pipeline accepts; 257 pages were held for review for other validation reasons
(short fragments, editorial front matter).

## Metadata: target 1210 → 1240

Thirty more artists verified with complete studio editions; 26 new Commons photographs
(1,145 total) and 1,241 Wikidata profiles collected; increment published through the
full gate.

## Checks and deployment

- `pnpm check`, `pnpm lint`, 73 tests, `catalog:verify-sources` (1,241 artists, 1,327
  releases, 15,887 tracks, 1,145 photographs), canonical build (sitemap 5,620 URLs),
  `catalog:verify-build` (21,509 detail pages, 1,145 photo checksums) — all passed.
- Commit `6f3a7a39` deployed through the server candidate workflow; live homepage
  SHA-256 `7f2be71a…` matches the local build byte for byte; new pages 200 and render
  in the browser.
- IndexNow: 5,620 URLs accepted by Yandex. Bing-side aggregate still pending its key
  re-validation; re-run `node scripts/promote/indexnow-submit.mjs` without
  INDEXNOW_ENDPOINT later.

## Server maintenance

Removed all historical candidate build worktrees (kept only the one matching the live
release) and the three oldest release directories with their stopped rollback
containers; disk usage fell from 83% to 75%. Rollback points: the previous release
`git-6f6f987d2036` and `20261001-1000artists`.

## Resume point

- Metadata checkpoint at 1,240; raise with `--target=1270`.
- Lyrics: Wikisource per-song inventory fully exhausted; future lyric growth requires
  a new source class within the pipeline's host allowlist or a policy extension.

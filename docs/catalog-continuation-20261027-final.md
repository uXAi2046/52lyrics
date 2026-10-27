# Catalog continuation — 27 October 2026, rounds two to four

## Result

Three further rounds ran on 27 October, taking the published catalog from 1,090
artists / 1,467 lyric works to **1,210 recording artists with imported releases**
(1,297 editions, 15,540 tracks, 1,119 photographs) and **2,056 distinct approved
full-lyric works**. Sitemap: 5,408 URLs.

| Round | Metadata | Lyrics added | Sources | Deployed commit |
| --- | --- | ---: | --- | --- |
| 2 | 1,120 → 1,150 | +91 | A Shropshire Lad (1896, 62), The Man from Snowy River (1895, 15), Thomas Hood (1873, 13) | `7e158d3a` |
| 3 | 1,150 → 1,180 | +337 | Whittier Complete Poetical Works (1895, 270), John Keats (1884, 67) | `9505a24a` |
| 4 | 1,180 → 1,210 | +33 | Sons of the Tyne's Garland (1770), Hymns for our Lord's Resurrection (1746, Charles Wesley), Methodist Hymns (1876), The Bennachie Budget (1879), The Church Hymnary (1893) | `6f6f987d` |

## Checks and deployment

Every round ran the full pipeline without skips: metadata publish gate, images and
profiles, `pnpm check`/`lint`/73 tests, `catalog:verify-sources`, canonical build,
`catalog:verify-build`, server candidate build, publish with rollback container,
homepage SHA-256 byte-for-byte comparison, new-page spot checks (all 200), and
browser rendering verification. IndexNow resubmitted after each deploy; the final
run (with a new per-batch network-retry added to
`scripts/promote/indexnow-submit.mjs` after connection drops) accepted all **5,408
URLs** via Yandex. The Bing-side aggregate remains pending its key re-validation.

## Resume point

- Metadata checkpoint at 1,210; raise with `--target=1240`.
- Lyrics: the per-song Wikisource songbook inventory is exhausted (both the large
  anthologies and the small songster/chapbook tail). Continued lyric growth requires
  a new source class inside the pipeline's allowlist (for example more poet-songwriter
  collected editions) or a deliberate policy change to add hosts.

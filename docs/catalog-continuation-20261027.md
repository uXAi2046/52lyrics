# Catalog continuation — 27 October 2026

## Result

The published catalog grew to **1,120 recording artists with imported releases** (1,207
editions, 14,433 tracks, 1,053 photographs) and **1,595 distinct approved full-lyric
works**. This round added 30 artists and 128 new complete lyrics. Both rounds of today
(2026-10-26/27) together added 90 artists and 274 lyrics.

## Metadata: target 1090 → 1120

Thirty more artists verified with complete studio editions; 24 new Commons photographs
and 1,121 Wikidata profiles collected; increment published through the full gate.

## Lyrics: three new anthologies

| Book | Year | Rights mode | Pages | Approved |
| --- | --- | --- | ---: | ---: |
| A First Series of Hymns and Songs (Henry Formby) | 1853 | unconditional (d. 1884) | 140 | 96 |
| Songs of the Cowboys (N. Howard Thorp) | 1921 | author-death | 26 | 21 |
| The Black-Bird Songster | 1840 | unconditional | 15 | 11 |

All three use the collector's `titlePath: "last"` and, for the cowboy book,
`excludeTitles` for front matter.

## Checks and deployment

- `pnpm check`, `pnpm lint`, 73 tests, `catalog:verify-sources` (1,121 artists, 1,207
  releases, 14,433 tracks, 1,053 photographs), canonical build (sitemap 4,757 URLs) and
  `catalog:verify-build` (19,192 detail pages, 1,053 photo checksums) all passed.
- Commit `5e8a05ae` deployed through the server candidate workflow; live homepage
  SHA-256 `ca1e8c46…` matches the local build byte for byte; new pages
  (`thomas-aquinas-feast-of-corpus-christi`, `n-howard-thorp-a-border-affair`) return
  200 with correct titles and render in the browser.
- IndexNow: updated sitemap resubmitted to Yandex; Bing-side aggregate still pending
  its key re-validation (re-run `node scripts/promote/indexnow-submit.mjs` later).

## Resume point

- Metadata checkpoint complete at 1,120; raise with `--target=1150`.
- Lyrics: the remaining per-song Wikisource songbook inventory is essentially
  exhausted (handful of 3–15 page songsters). Next lyric growth needs new source
  classes: more poet-composer collections, hymnals with per-hymn pages, or a source
  policy extension beyond en.wikisource.

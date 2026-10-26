# Catalog continuation — 26/27 October 2026

## Result

The published catalog grew to **1,090 recording artists with imported releases** (1,177
editions, 14,051 tracks, 1,029 photographs) and **1,467 distinct approved full-lyric
works** (1,357 public-domain candidates). This round added 30 artists and, after a
correction, 146 new complete lyrics.

## Metadata: target 1060 → 1090

Thirty more artists verified with complete studio editions; 28 new Commons photographs
and 1,091 Wikidata profiles (all with English descriptions) collected; increment
published through the full gate.

## Lyrics: two new anthologies and a collector fix

- **Rump Songs (1662)** — Alexander Brome's "Exact Collection of the Choycest Poems and
  Songs Relating to the Late Times"; unconditional public domain. **79 approved works.**
- **The Army and Navy Hymnal (1920)** — author-death rights mode; only proofread-quality
  pages (scan quality ≥ 3) are admitted, the rest are held for review. **67 approved works.**

### Collector corrections

The first pass of these two folder-structured books produced titles like
`Part 1/A Committee` / `Hymns/Abide with Me…`, and a hymnal first-lines index page
was admitted as a 56-line bogus work. The collector now supports `titlePath: "last"`
(last path segment becomes the work title) and `excludeTitles` for navigation pages;
both books were re-collected from scratch (their interim records were dropped before
re-collection). Clean slugs such as `alexander-brome-a-committee` replaced the 201
interim records with 146 surviving approved works.

Sources probed and rejected this round: The Golden Treasury (multi-poem book parts),
One Hundred English Folksongs and Cavalier Songs (multi-song pages), remaining
17th-century songsters (a few pages each).

## Checks and deployment

- `pnpm check`, `pnpm lint`, 73 tests, `catalog:verify-sources` (1,091 artists, 1,177
  releases, 14,051 tracks, 1,029 photographs) all passed.
- Canonical build: sitemap 4,489 URLs; `catalog:verify-build` verified 18,542 detail
  pages and 1,029 photo checksums.
- Deployed commits `bd11b896` (content) then `5759aa66` (title fix) through the
  server candidate workflow; live homepage SHA-256 matches local builds byte for byte.
- IndexNow: 4,505 URLs accepted by Yandex; the aggregate endpoint (Bing) still
  answers 403 pending its re-validation of the key file — re-run
  `node scripts/promote/indexnow-submit.mjs` later.

## Resume point

- Metadata checkpoint complete at 1,090; raise with `--target=1120`.
- Wikisource songbook inventory is thinning; next lyric round needs new source ideas
  (per-song poetry of songwriter poets, additional hymnals, or non-Wikisource
  public-domain hosts within the pipeline's source policy).

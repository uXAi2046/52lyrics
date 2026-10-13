# Full-lyric catalog conversion — execution record (2026-10-12)

## Result

The catalog now publishes **754 distinct complete-lyric works** across **853
full-lyric pages**, up from 108 works / 207 pages. Song pages total 13,965
(13,112 remain metadata-only). Every full text pins a source revision,
edition, retrieval date and rights note.

## Baseline audit (scripts/catalog/audit-full-lyrics.mjs)

- Baseline re-verified: 13,319 song pages / 207 full-lyric pages / 108 distinct
  works / 13,112 metadata-only. Report: `docs/audit/full-lyrics-2026-10-12.json`.
- 0 text problems, 0 provenance problems, 98/98 source URLs reachable
  (`--network`), no commercial licenses, pages-per-work ratio 1.92
  (Lehrer works repeat across five album editions — reported separately,
  never as extra works).

## Collection (scripts/catalog/collect-public-domain.mjs)

Sources (scripts/catalog/pd-books.json), all Wikisource, pinned `oldid` per
record, proofread scans only (quality ≥ 3), stanza-by-stanza validation:

| Book | Collected | Approved | Review | Hold | Duplicate |
|---|---:|---:|---:|---:|---:|
| The Book of Scottish Song (1843) | 560 | 547 | 4 | 0 | 9 |
| The Scottish Minstrel, First Series (1850) | 42 | 32 | 0 | 0 | 10 |
| The Canadian Soldiers' Song Book (1918) | 163 | 67 | 77 | 14 | 5 |
| **Total** | **765** | **646** | **81** | **14** | **24** |

- Rights rules: pre-1900 anthologies are unconditional (any contributor died
  130+ years ago); the 1918 book requires traditional authorship or death
  year ≤ 1956 (life+70 expired), resolved from the author page or Wikidata
  P570 (cached in scripts/catalog/pd-author-years.json).
- 1918-book records with unresolved author dates are needs-review and are
  **not** rendered or counted.
- Added-works list: `docs/audit/pd-added-works.md` (646 rows, each with its
  pinned revision URL). Hold list: `docs/audit/pd-holds.md`.

## Pipeline and statistics

- `pnpm catalog:stats` now reports: song pages, unique pairs, full-lyric
  pages, metadata-only pages, distinct works, per-source/per-rights
  breakdowns and the candidate pipeline statuses.
- `pnpm catalog:audit` (new) audits text completeness, provenance fields and
  duplicate works; `--network` also re-checks every source URL.
- Metadata collection and lyric collection are fully separate; metadata counts
  are never reported as lyric progress.

## Site

- New route `/lyrics` (`src/pages/CompleteLyrics.tsx`): paginated index of
  every distinct full-lyric work with public-domain/original filters. Linked
  from the header ("Lyrics"), homepage reading section and Discover.
- `metadata-only` lyric pages: `noindex` robots meta and excluded from
  `sitemap.xml` (13,112 URLs excluded; sitemap has 3,370 URLs).
- `scripts/catalog/verify-build.mjs` enforces both directions: metadata-only
  pages must be noindex and absent from the sitemap; indexable pages must be
  present.
- Prerender completed for all 16,588 routes; spot-checked pages render full
  text, source links and rights notes.

## Verification status

- `pnpm test`: 73/73 passing (includes new `publicDomainBatch.test.ts`).
- `pnpm check` (typegen + tsc): clean. `pnpm lint`: clean.
- `pnpm build`: prerender finished (16,485 HTML pages + assets); the
  `modulepreload`-inerting pass completed via the resumable
  `scripts/catalog/finish-static-rewrite.mjs` (16,485/16,485 rewritten).
- `verify-build`: **16,468 detail pages verified** — titles, headings,
  canonical URLs, noindex/sitemap semantics, lyric lines, source links and
  958 photo checksums. One data fix came out of it: apostrophes in
  Wikisource titles are now percent-encoded (`%27`) in `revisionUrl` so the
  rendered link matches URL normalization (334 records corrected).
- `pnpm catalog:audit --network`: 754 works consistent, 0 text problems,
  0 provenance problems, 101 source URLs reachable. Report:
  `docs/audit/full-lyrics-2026-10-13.json`.
- E2E: 118 tests passing (Playwright, both projects). Two stale assertions
  were updated (Discover History+full filter now returns the page limit of 24
  cards because the anthology batch shares the theme) and visual snapshots
  were regenerated after the header gained the Lyrics item. The lyric visual
  helper now waits for the scroll-spy's active section, removing a
  transition-timing flake. One mobile Saved-library flake re-verified green
  serially.

## Deliberately not collected

Modern commercial lyric sites (unlicensed), OCR without proofreading,
translations with unresolved underlying rights, and any record whose rights
evidence is incomplete — these live in the hold/review lists, not the catalog.

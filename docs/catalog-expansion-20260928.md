# 100 additional artists — 28 September 2026

## Scope and status

Collection and local publication completed. The existing **500 real artists with sourced release content increased to 600**, preserving all previously published artist/release/track records, their order, source profiles and photographs. The baseline application had 510 artists/writers, 621 albums/songbooks and 7,156 track entries.

| Measure | Added | Current site total |
| --- | ---: | ---: |
| Artists / writers | 100 | 610 |
| Albums / editorial songbooks | 100 | 721 |
| Song pages | 1,236 | 8,392 |
| Source-linked artist profiles | 100 | 601 |
| Licensed / public-domain photographs | 94 | 585 |
| Distinct reviewed full-lyric works | 0 | 108 |

Each new artist has one sourced release edition; this batch is not a complete discography import. Six new portraits use the existing local typographic fallback (unsupported license variants or missing attribution), not an unlicensed substitute. The full [100-artist inventory](catalog-expansion-20260928.json) lists local artist paths, album titles, track counts and source-edition URLs. The batch starts with LMFAO and ends with Róisín Murphy; it includes Gotye, Alessia Cara, Journey, OutKast, The Black Keys, The Verve, TLC, MGMT and many others.

Each new artist needs at least one complete official release edition. Every track gets an existing `/lyrics/...` song-detail page, search indexing, artist/album navigation and local saving. This is not a promise of complete discographies or licensed modern lyric transcriptions. New MusicBrainz tracks are metadata-only; the 108 distinct approved full-lyric works remain separate from track counts.

## Safe continuation

The existing source-linked candidate pool is reused. Canonical MusicBrainz IDs and Wikidata IDs prevent duplicate identities. Incomplete editions and identity mismatches remain in the rejection ledger; they do not count toward the target. Photo licensing is reviewed separately, with a local typographic avatar for unsupported/missing licenses.

The collector now accepts an explicit monotonic target without resetting successful responses or attempted candidates:

```bash
node scripts/catalog/expand-musicbrainz.mjs --target=600
node scripts/catalog/expand-images.mjs --follow
node scripts/catalog/collect-artist-profiles.mjs --follow
```

Run only one MusicBrainz collector at a time; the other commands follow its checkpoint. Requests retain identifying User-Agent, cache receipts, rate limits and exclusive process locks. A subsequent ordinary resume keeps the raised target. Invalid or lower targets are rejected before changing the checkpoint.

The exact three published JSON inputs were backed up to `.cache/catalog/review-backups/expansion-600-20260928/` before collection. Publication still requires complete checkpoints, valid source receipts and exact preservation of existing published records. The publisher also preserves the original baseline retrieval date on repeated expansion; it must not replace that date with a later batch timestamp.

```bash
node scripts/catalog/publish-expansion.mjs --verify-progress
node scripts/catalog/publish-expansion.mjs
pnpm catalog:stats
node --import tsx scripts/catalog/verify-increment.mjs .cache/catalog/review-backups/expansion-600-20260928 100
pnpm check
pnpm lint
pnpm test
pnpm test:e2e
SITE_URL=https://www.52lyrics.com pnpm build
pnpm catalog:verify-sources
pnpm catalog:verify-build
```

Do not publish a partial checkpoint. This batch changes local content only; Tencent production deployment is a separate action.

## Verification

- Initial checks before promotion: TypeScript, Lint and 61 unit tests passed.
- Added coverage for target increases, resume behavior and invalid/decreasing targets.
- Expanded desktop/mobile journeys require the 600-artist target and exercise LMFAO plus the last admitted artist, as well as the preserved Lady Gaga record.
- All three collection checkpoints completed, with no pending artist profiles or image-review decisions. Unsupported images have explicit fallback decisions.
- Publication verified cached discovery/identity/release evidence and exact old-record preservation before changing the application snapshots.
- The independent increment audit confirmed exactly 100 new identities, 100 albums and 1,236 connected metadata-only song pages, preserving all 501 earlier imported artists and their source profiles/photos.
- Post-publication TypeScript, Lint and 61 unit tests passed. Source verification passed for 601 identities, 687 imported editions, 8,169 imported tracks, 585 photographs, 601 profile receipts and the unchanged 101 lyric-source documents.
- Production build passed with `SITE_URL=https://www.52lyrics.com`. The build audit verified all 9,723 detail pages (titles, headings, canonical URLs, sitemap, lyric states and source links), plus 585 bundled photograph checksums.
- The final independent browser run passed **106/106 tests**, including desktop/mobile artist → album → song journeys, search, refresh, saved-item persistence, accessibility and strict visual comparisons. LMFAO is resolved by name independently of the last admitted artist, Róisín Murphy.
- The initial full browser run passed 96 tests and failed 10 screenshot comparisons. Home counts changed as intended (510 → 610); unchanged lyric pages had only 8–29 differing pixels. A repeated mobile metadata test produced identical actual captures, and the preserved pre-expansion build rendered pixel-identically to the new build in the current browser. All five font files were byte-identical. This establishes pre-existing baseline drift for that page, not a data-induced layout change. Reviewed baselines were refreshed without relaxing screenshot tolerances, followed by the clean 106-test run.
- A first browser-test startup collided with concurrent React Router type generation. Build/type generation and browser startup were subsequently sequenced; no application workaround was needed.
- Desktop and mobile LMFAO captures were also inspected directly. No production deployment was performed. The existing large catalog-chunk build warning remains; this batch does not certify a fresh Lighthouse score.

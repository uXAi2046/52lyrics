# Catalog continuation — 25 October 2026

## Result

The published catalog grew to **1,060 recording artists with imported releases**, 1,147 imported editions (1,390 albums and songbooks), 13,692 verified tracks, 1,001 licensed photographs and **1,278 distinct approved full-lyric works** — **607 new complete lyrics** this round, exceeding the 500-work target. Sitemap grew to 4,168 URLs.

## Metadata: target 1030 → 1060

`expand-musicbrainz.mjs --target=1060` verified 30 additional artists, each with one complete official studio edition; images (28 Commons photographs, 2 documented typographic-avatar fallbacks) and Wikidata profiles (1,061 identities, all with English descriptions) were collected and the increment was published through the full publish gate.

## Lyrics: seven new public-domain anthologies

Added to `scripts/catalog/pd-books.json` after probing Wikisource for per-song collections with proofread scans:

| Book | Year | Rights mode | Pages | Approved |
| --- | --- | --- | ---: | ---: |
| The Poetical Works of Robert Burns | 1887 | unconditional (Burns 1759–1796) | 515 | 437 |
| Catholic Hymns | 1860 | author-death | 59 | 50 |
| Mediaeval Hymns and Sequences | 1867 | author-death | 57 | 47 |
| Songs of Innocence and of Experience (Blake) | 1826 | unconditional (Blake 1757–1827) | 47 | 21 |
| Songs of French Canada | 1909 | author-death | 33 | 30 |
| The Scottish Minstrel, Second Series | 1851 | unconditional | 23 | 18 |
| National Ballad and Song | 1897 | author-death | 15 | 4 |

**607 new approved works.** Sources examined and rejected with reasons: The Army and Navy Hymnal (408 pages, scan quality mostly 2, below the proofread threshold), The English and Scottish Popular Ballads (500 pages, quality 1–2 pages interleaved with editorial commentary), The Riverside Song Book (132 pages, quality 2), The Lover's Songster (undated edition). Collection and rights notes follow `docs/pd-collection.md`; every record pins its parsed revision.

## Checks

- `pnpm check`, `pnpm lint` passed; `pnpm test` passed (73 tests, 16 files) including the public-domain batch validators over all 1,278 approved records.
- `pnpm catalog:stats`: 1,060 artists with releases, 1,061 identities/profiles, 1,390 albums and songbooks, 1,475 public-domain pages, 1,278 approved works, 1,001 photographs.
- `pnpm catalog:verify-sources` passed for 1,061 artists, 1,147 releases, 13,692 tracks, 1,001 photographs and all profile receipts.
- Canonical production build passed; sitemap 4,168 URLs (13,708 metadata-only pages excluded).
- `pnpm catalog:verify-build` passed for 17,862 detail pages and 1,001 photo checksums.

## Deployment

Commit pushed to `main`; server candidate build and publish follow `docs/tencent-deployment.md`.

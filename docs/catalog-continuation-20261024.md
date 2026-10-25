# Catalog continuation — 24 October 2026

## Result

The published catalog grew from 1,010 to **1,030 recording artists with imported releases**, 1,117 imported release editions (1,327 albums and songbooks), 13,332 verified tracks, 973 licensed photographs and **779 distinct approved full-lyric works** (878 full-lyric pages). Two staged increments were promoted and one new public-domain anthology was added.

The blockers that stalled the 14 and 21 October passes were environmental: this machine reaches MusicBrainz and `www.wikidata.org` directly, but the remaining Wikimedia endpoints (Wikipedia, Commons, `query.wikidata.org`) were IP-blocked and DNS-polluted. All pipeline requests run through `curl`, so exporting `https_proxy=http://127.0.0.1:7897` (the local system proxy) unblocked every collector without any code change. Collection used `52lyricsCatalog/1.0` identification with the default 1,200 ms per-host interval.

## Increment 1 — promoted the stalled target-1020 checkpoint

The ten artists staged on 14 October (Powderfinger, Hedley, The Clancy Brothers, Masked Wolf, Hilltop Hoods, Japandroids, Tokyo Police Club, Una Healy, Abandon All Ships, Daniel Merriweather) completed their pending decisions:

- Images: the five artists still open (Japandroids, Tokyo Police Club, Una Heley, Abandon All Ships, Daniel Merriweather) received Commons-hosted photographs under approved CC licenses; Hilltop Hoods retains its local typographic-avatar fallback. Checkpoint closed at 963 photographs, 58 fallbacks, 0 pending.
- Profiles: one Wikidata SPARQL batch added all ten identities; 1,021 profiles, all with English descriptions.
- `publish-expansion.mjs --verify-progress` reported 0 pending images and 0 pending profiles, then the increment was published.

## Increment 2 — metadata extended to target 1030

`expand-musicbrainz.mjs --target=1030` verified ten additional artists, each with one complete official studio edition, then images and profiles were collected (all ten received Commons photographs, all ten received profiles):

| Artist | Release | Tracks | Photo license |
| --- | --- | ---: | --- |
| Stars | Nightsongs | 16 | CC BY-SA 4.0 |
| Xavier Rudd | To Let | 13 | CC BY 2.0 |
| Horde | Hellig Usvart | 12 | CC BY-SA 4.0 |
| Comeback Kid | Turn It Around | 13 | CC BY-SA 3.0 |
| NERVO | Collateral | 15 | CC BY-SA 3.0 |
| April Wine | April Wine | 8 | CC BY-SA 3.0 |
| Woods of Ypres | Pursuit of the Sun & Allure of the Earth | 10 | CC BY 3.0 |
| Sam Kim | Sun and Moon | 8 | CC BY-SA 4.0 |
| Karnivool | Themata | 12 | CC BY 2.0 |
| Pnau | Sambanova | 12 | CC BY 2.0 |

Both increments passed the full publish gate: staged-vs-published equality assertions, discovery-source re-verification, release re-reads, photo checksums and profile receipt verification, before any published file changed.

## Lyrics — new public-domain anthology: Irish Melodies (1821)

Added **Irish Melodies** to `scripts/catalog/pd-books.json` (`irish-melodies-1821`): the Wikisource collection of Thomas Moore's first eight melody volumes (1808–1821, music arranged by John Stevenson), with proofread scans. Rights are unconditional: every lyric is by Thomas Moore (1779–1852) and both contributors died more than 170 years ago, so the texts are public domain worldwide; the edition also carries a pre-1931 US public-domain tag.

The run collected 28 subpages: **25 approved complete works** (now live as catalog lyric pages), 2 needs-review (extraction found no stanza text on those two pages), 1 duplicate. Total approved works rose from 646 to 671; catalog full-lyric works rose from 754 to 779.

## Collector bug fixed: terminal records were demoted on re-runs

The first run of `collect-public-domain.mjs` with the new book overwrote `src/data/imported/pd-candidates.json` with fresh re-collection, and the catalog-title dedup demoted all 646 previously approved works to `duplicate` (any re-run would have silently removed every published lyric page). The file was restored from git and the 28 Irish records merged. `collect-public-domain.mjs` now carries terminal decisions (approved/hold/duplicate) forward verbatim, keyed by source page, and only re-collects pages whose earlier records are all `needs-review`; the per-book summaries count carried-over records, and the totals line no longer reports the wrong status buckets. Verified idempotent: a re-run preserves all 793 records byte-stable in status, loses none, and double-counts no page (checked against the git HEAD snapshot: 0 lost approved, 0 lost review, 0 lost hold/duplicate records).

## Checks

- `pnpm check`, `pnpm lint` passed.
- `pnpm test` passed: 73 tests across 16 files.
- `pnpm catalog:stats`: 1,030 artists with imported releases, 1,031 sourced artist identities/profiles, 1,327 albums and songbooks, 868 public-domain pages, 779 approved works (671 public-domain + 90 reviewed author works + 10 originals + 8 earlier reviewed Wikisource editions), 973 photographs.
- `pnpm catalog:verify-sources` passed for 1,031 artists, 1,117 releases, 13,332 tracks, 973 photographs, 101 author documents and all 1,031 profile receipts.
- Production build with the canonical configuration (`SITE_URL=https://www.52lyrics.com BAIDU_TONGJI_ID=7ba35cf48a0603715bafc08f9b760f86 pnpm build`) passed; sitemap contains 3,435 URLs and omits 13,348 metadata-only lyric pages.
- `pnpm catalog:verify-build` passed for 16,769 detail pages and 973 bundled photo checksums.

## Resume point

- Metadata checkpoint is complete at target 1030; raise with `--target=1060` for the next round (the discovery pool had 1,990 candidates; 228 candidates are held, mostly without complete eligible studio editions).
- Image and profile checkpoints are closed with nothing pending.
- The two Irish Melodies needs-review pages (`The Harp That Once Through Tara's Halls`, `When he who adores thee, had left but the name`) yield no stanza text from the current scan transclusion; they stay unpublished until their source pages are fixed or the parser learns their layout.
- Data changes (`src/data/imported/*`, new `public/artwork/imported/*`, `scripts/catalog/*`, this doc) are uncommitted on branch `codex/server-build-deploy`; commit and deploy through the candidate-build workflow when ready.

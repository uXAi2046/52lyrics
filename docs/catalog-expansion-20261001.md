# Recording-artist expansion to 1,000 — 1 October 2026

The catalog now contains **1,000 recording artists with verified release content**. This is the count of recording artists with imported releases, separate from the site's 1,010 artist and historical-writer pages. The existing catalog was preserved in full before this increment.

| Measure | Before | Added | After |
| --- | ---: | ---: | ---: |
| Recording artists with releases | 610 | 390 | 1,000 |
| Artist and writer pages | 620 | 390 | 1,010 |
| Albums and editorial songbooks | 731 | 390 | 1,121 |
| Song detail pages | 8,509 | 4,708 | 13,217 |
| Downloaded approved photographs | 595 | 358 | 953 |
| Distinct approved full-lyric works | 108 | 0 | 108 |

Each new artist has a MusicBrainz identity linked through the source discovery record, one complete official studio release edition, source-linked track IDs and disc order, and a Wikidata-derived profile. Wikimedia Commons portraits were included only where the file license and attribution passed review; the other artist pages use the site's typographic avatar. New song pages contain metadata and an explicit unavailable-lyrics state. They do not reproduce commercial lyrics.

The three previously published JSON snapshots were backed up under `.cache/catalog/review-backups/to-1000-20261001/` before collection. The MusicBrainz, image, and profile collectors used resumable staging and completed with no pending profile or image decisions. The publisher compared the staged identities, releases, profiles and image files against their cached source receipts before atomically promoting them. The independent increment audit confirmed that all 611 earlier imported artist records, earlier portraits, profiles, and the 108 approved full-lyric works stayed intact.

## Verification

- Source audit: 1,001 configured MusicBrainz identities, 1,087 release editions, 12,994 imported tracks, 953 approved photographs, and 1,001 Wikidata profile receipts verified. The 101 collected author documents remain accounted for as 90 approved works and six rights holds.
- Increment audit: 390 new recording artists, 390 new albums, and 4,708 metadata-only song pages; earlier records and ordering preserved.
- Type checking, ESLint and all 69 unit tests passed.
- Production build and independent build audit passed for 15,348 detail pages and all 953 bundled photograph checksums.
- 32 targeted desktop/mobile browser tests passed after refreshing two tablet homepage screenshots for the new catalog count. They cover the last admitted artist, search and pagination, deep-link refresh, saved items, and the homepage's regional/layout behavior.

The published snapshots are in `src/data/imported/`. The source caches, review backup and held candidates remain local under `.cache/catalog/`. Use `pnpm catalog:stats` for authoritative current counts.

## Deployment

The release is live at `https://www.52lyrics.com` from `/srv/52lyrics/releases/20261001-1000artists/` on Tencent Cloud. The 231,799,502-byte upload archive had SHA-256 `89f817902b26e3bf48eae4133d0fcc733650e269c8e3485350b5b9e222b8c7a9`; the server verified it before extraction. A candidate container passed homepage and new-artist checks before switching. The previous release remains as a stopped rollback container.

Public HTTPS checks matched the local build hashes for the homepage, sitemap, Josef Salvat's artist page and metadata-only song page, and the existing City Lights full-lyric page. Josef Salvat's new licensed portrait matched its source manifest checksum. A browser journey confirmed the live 1,010-page artist/writer index count, the homepage layout control, Josef Salvat → Night Swim → song notes, and the unavailable-lyrics notice; the existing City Lights full lyrics also remained readable. The temporary upload key revoked itself after archive verification and could no longer authenticate. See [the deployment record](tencent-deployment.md).

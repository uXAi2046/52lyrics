# Catalog continuation — 8 October 2026

This weekly increment adds ten source-linked recording artists and ten complete official release editions. The previous 1,001 imported artist identities, 1,087 releases, 12,994 imported tracks, 953 licensed photographs, artist profiles and all 108 distinct approved full-lyric works were preserved.

| Measure | Added | Current total |
| --- | ---: | ---: |
| Recording artists with imported releases | 10 | 1,010 |
| Albums | 10 | 1,131 albums and songbooks |
| Song detail pages | 102 | 13,319 |
| Licensed photographs | 5 | 958 |
| Typographic avatar fallbacks | 5 | 53 |
| Approved full-lyric works | 0 | 108 |

## New records

| Artist | Sourced release | Tracks |
| --- | --- | ---: |
| The Naked and Famous | Passive Me, Aggressive You | 13 |
| Hiatus Kaiyote | Tawk Tomahawk | 10 |
| Tonight Alive | What Are You So Scared Of? | 14 |
| Alvvays | Alvvays | 9 |
| Gorguts | Considered Dead | 10 |
| Courtney Act | Kaleidoscope | 6 |
| Saga | Saga | 8 |
| Klaatu | 3:47 EST | 8 |
| Amy Shark | Love Monster | 14 |
| Rose Tattoo | Rose Tattoo | 10 |

MusicBrainz supplies the primary-artist identity, official edition, release source and complete track sequence. Wikidata query receipts provide an English description for all ten new artist records. Wikimedia Commons supplied five portraits: The Naked and Famous (CC BY-SA 4.0), Alvvays and Gorguts (CC BY 2.0), Courtney Act and Saga (CC BY-SA 3.0). The other five retain the site's local typographic avatar. Each image's attribution, source URL, license URL and checksum are recorded in the Commons manifest.

All 102 new song pages are metadata-only. No complete lyrics were added because no new text had explicit display authorization or a verified applicable public-domain basis.

## Verification

- The incremental audit confirmed exactly ten artists and albums and 102 new song pages; all prior catalog records and all 108 full-lyric works are unchanged.
- MusicBrainz/Wikidata/Commons source audit passed for 1,011 artist identities, 1,097 releases, 13,096 tracks, 958 photographs and all 1,011 artist-profile query receipts. The author document ledger remains at 90 approved works and six explicit holds, with no pending sources.
- TypeScript checks, ESLint and all 69 unit tests passed.
- Production build completed with the site's canonical URL and analytics configuration.
- Build audit passed for 15,470 detail pages and 958 bundled photo checksums.

Several MusicBrainz, Wikidata and Commons requests timed out during this run. Those candidates and image lookups stayed in the retry/typographic-avatar paths; none were admitted without source verification. The collector continued through the existing discovery pool and reached the requested target with zero pending image or profile decisions.

The content snapshot is ready for deployment. See `docs/tencent-deployment.md` for the active release directory and rollback record.

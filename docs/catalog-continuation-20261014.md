# Catalog continuation — 14 October 2026

## This week's staging attempt

The published baseline was preserved. Before collection it contained 1,010 recording artists with imported releases, 1,307 albums and songbooks, 13,965 song pages, 958 licensed photographs and 754 distinct approved full-lyric works.

The MusicBrainz collector verified ten additional artists, ten official release editions and 117 tracks:

| Artist | Release | Tracks |
| --- | --- | ---: |
| Powderfinger | Parables for Wooden Ears | 13 |
| Hedley | Hedley | 11 |
| The Clancy Brothers | Christmas | 11 |
| Masked Wolf | The Devil Wears Prada but God Wears Gucci | 13 |
| Hilltop Hoods | A Matter of Time | 14 |
| Japandroids | Post-Nothing | 8 |
| Tokyo Police Club | Elephant Shell | 11 |
| Una Healy | The Waiting Game | 12 |
| Abandon All Ships | Geeving | 10 |
| Daniel Merriweather | Love & War | 14 |

These records remain in the local expansion checkpoint; they were **not promoted**. The photo collector completed decisions for four artists, retaining a local typographic avatar after Wikidata timeouts. Six artists still have pending image decisions. The Wikidata SPARQL profile query for all ten new artists timed out after four 45-second attempts, leaving all ten profiles pending. The public catalog therefore remains at its previous 1,010 recording artists and 13,965 song pages.

No complete lyrics were added. There was no newly reviewed text with explicit display authorization or a verified applicable public-domain basis in this increment.

## Checks

- `pnpm check` passed.
- `pnpm lint` passed.
- `pnpm test` passed: 73 tests across 16 files.
- `pnpm catalog:verify-sources` passed for the published baseline: 1,011 artist identities, 1,097 releases, 13,096 tracks, 958 photographs, 90 approved author works and six explicit rights holds; all 1,011 existing profile receipts verified.
- The production build passed for the existing published catalog and canonical site configuration.
- `pnpm catalog:verify-build` passed for 16,468 detail pages and 958 bundled photograph checksums.
- Public homepage and sitemap returned HTTP 200.
- `pnpm catalog:stats` reports 754 distinct full-lyric works, including 646 approved public-domain candidates; these were already in the baseline and were preserved.

## Resume point and blocker

The metadata checkpoint is complete at target 1,020. Image and profile checkpoints are resumable under `.cache/catalog/`; six image decisions and ten profile records remain pending. Promotion correctly refuses the increment until all those decisions are complete. Wikidata timed out during image and profile lookups; no unverified Wikimedia image was downloaded or published. Retry from the existing checkpoint when Wikidata responds.

# Continuing catalog collection — 30 September 2026

This local batch adds ten source-linked recording artists and their complete selected release editions. All 601 previously imported artist records, 687 releases, 8,169 imported tracks, artist profiles and photographs were preserved. No existing lyric text or reading link changed.

| Measure | Added | Current site total |
| --- | ---: | ---: |
| Artists and writers | 10 | 620 |
| Albums and editorial songbooks | 10 | 731 |
| Song detail pages | 117 | 8,509 |
| Licensed or public-domain photographs | 10 | 595 |
| Distinct approved full-lyric works | 0 | 108 |

The ten artists are Rise Against, Alter Bridge, Nicky Byrne, Chris Hadfield, Nazareth, Stone Temple Pilots, Lhasa de Sela, Neutral Milk Hotel, Cody Simpson and Pendulum. Each has one complete official MusicBrainz edition with a source-linked track sequence. The new tracks show source metadata and an unavailable-lyrics notice; they do not reproduce commercial lyrics. Portrait licenses and credits were checked individually. Source-linked Wikidata descriptions and genres were collected for all ten artists.

## Repeat safely

Before each increment, read `pnpm catalog:stats` and check for active collector locks. Copy the three published files in `src/data/imported/` into a new directory under `.cache/catalog/review-backups/`. Raise the target above the current number of artists with imported releases, in small batches; never lower or reset the checkpoint. Use the existing source-linked candidate pool until it is exhausted, then review new discovery sources. Run one MusicBrainz collector at a time:

```bash
node scripts/catalog/expand-musicbrainz.mjs --target=NEXT_TARGET
node scripts/catalog/expand-images.mjs --follow
node scripts/catalog/collect-artist-profiles.mjs --follow
```

The image and profile collectors can follow the metadata collector in separate terminals. Inspect held identities and image fallbacks. Publish only a complete checkpoint with zero pending image/profile decisions:

```bash
node scripts/catalog/publish-expansion.mjs --verify-progress
node scripts/catalog/publish-expansion.mjs
node --import tsx scripts/catalog/verify-increment.mjs BACKUP_DIRECTORY ADDED_ARTISTS
pnpm check
pnpm lint
pnpm test
SITE_URL=https://www.52lyrics.com pnpm build
pnpm catalog:verify-sources
pnpm catalog:verify-build
```

The September 30 baseline backup is `.cache/catalog/review-backups/continuous-20260930/`. It is local and ignored by Git. The publication script checks cached source receipts and exact preservation of previous records before replacing the application snapshots. The increment audit checks that all new tracks are metadata-only and the 108 approved lyric works remain intact.

For future lyric additions, collect a fixed revision or author-released document, verify its edition, credits and permission to display the complete text, and review stanza/line order against the source before promotion. A downloaded lyric page or a MusicBrainz track listing alone does not establish lyric rights. Keep unresolved texts in staging rather than the full-lyric catalog.

This batch updates local site content. Production deployment follows the site's separate release workflow.

## Verification record

- Source-cache audit passed for 611 imported artist identities, 697 release editions, 8,286 imported tracks, 595 photographs and all 611 artist-profile query receipts. The 101 collected author documents, 90 approved works and six explicit rights holds were unchanged.
- The independent increment audit found exactly ten new artists, ten new editions and 117 metadata-only song pages. It checked previous record order and content, old profile/photo records and the unchanged 108 distinct full-lyric works.
- Type checking, ESLint and all 66 unit tests passed. The production build and its audit passed for 9,860 detail pages and 595 bundled image checksums.
- Eight desktop/mobile browser journeys passed, including the newly last-admitted Pendulum record, artist search, complete release track order, lyric-unavailable state, deep-link refresh and saved artist persistence.

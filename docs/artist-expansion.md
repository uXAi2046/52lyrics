# Expanding to 500 recording artists

The reviewed batch was **promoted into the application on 9 September 2026 (Asia/Shanghai)**. There are now **500 distinct real recording people/groups with sourced release content**: 310 people and 190 groups. This is separate from the earlier completed author-lyric import; discovery candidates and rejected attempts are not counted as site content.

## Published result

| Measure | Verified count |
|---|---:|
| New recording artists admitted in this expansion | 453 |
| New complete release editions / track entries | 453 / 5,244 |
| All imported recording identities | 501 |
| Imported identities with release content, counted toward the target | 500 |
| All imported release editions / track entries | 587 / 6,933 |
| Entire site: artists and writers / albums and songbooks / track entries | 510 / 621 / 7,156 |
| Source-linked short artist descriptions | 501 |
| Profiles with source genre labels | 476 |
| Local licensed photographs / explicit typographic-avatar fallbacks | 491 / 10 |
| Full-lyric entries / distinct full-lyric works, unchanged | 207 / 108 |

The 501st imported identity is the preserved Adam Levine record without an imported album. The site total also includes the fictional original band and eight historical writer files; none inflates the 500-real-artists-with-releases result. Track entries describe an actual edition, including bonus/hidden tracks and repeated works across releases; they are not a count of complete lyrics or distinct compositions. The last newly admitted group was Sugababes.

Open `/artists`, search for a name such as Lady Gaga or Sugababes, and follow artist → album → track. New tracks display song information and an explicit unavailable-lyrics state. Run `pnpm catalog:stats` for authoritative counts after any later import.

## Admission and preservation

- Discovery uses Wikidata CC0 identities linked to English Wikipedia and MusicBrainz. The initial pool covers people/groups associated with the US, UK, Canada, Australia, New Zealand and Ireland. Sitelink counts order discovery; they are not a public popularity chart, nor proof that an artist records only in English.
- Both Wikidata IDs and canonical MusicBrainz IDs must be unique. A source name or documented alias must match. Ambiguous identities are held, never merged by a similar name.
- Retain all MusicBrainz identities listed for a single Wikidata entity: a legal-name/writer identity can match the name but have no artist releases. Try the other explicitly source-linked recording identities before holding the candidate. Already cataloged collaboration groups are skipped in favor of another eligible release, not counted twice. Source recording names remain searchable alongside the directory name.
- Each newly admitted artist has at least one official album edition with its complete source disc/track sequence. This is a breadth-first archive, not a complete discography. Missing track references or a different primary release artist reject the edition.
- Discovery selects source release groups classified as `Album` without secondary-type flags. Upstream classifications can be incomplete: this is not a guarantee of studio-only discographies, nor a claim that the selected release is an artist's debut studio album. Source-specific review exclusions override these flags.
- Preserve every published artist and curated release. The original Adam Levine record has no imported release; it remains available but does not count toward the 500-with-releases target.
- New tracks are metadata-only. No commercial lyric text, invented songwriter credits or unreviewed source documents enter the lyric reader.
- Commons photographs require a supported file-specific license, author, source URL, actual encoded dimensions and checksum. An unavailable/unapproved image uses the existing local typographic avatar. Failed photo attempts remain recorded separately.
- Wikidata English short descriptions and source-supplied genre labels are collected separately as CC0 profile data. Existing editorial biographies/genres remain unchanged. An absent source description or genre list stays absent; a generated factual release-introduction is not presented as a sourced biography.

## Collect and resume

Run commands from the repository root. Network collectors need access to their public source hosts.

```bash
# Generate the source-linked candidate pool; reuse it on subsequent resumes.
node scripts/catalog/discover-artists.mjs

# Run one metadata collector only. Progress is checkpointed after each candidate.
node scripts/catalog/expand-musicbrainz.mjs

# In a separate terminal, follow admitted artists for image review.
node scripts/catalog/expand-images.mjs --follow

# In another terminal, collect short English profiles in batches of 25.
node scripts/catalog/collect-artist-profiles.mjs --follow
```

The metadata collector sends requests sequentially, with at least three seconds between new MusicBrainz request starts. Do not run the older MusicBrainz collectors alongside it. API access terms are separate from CC0 data reuse; commercial API access requires the appropriate agreement. The public website itself does not query these services.

All three processes use exclusive PID lock files and support graceful SIGINT/SIGTERM. Confirm the exact process is terminal before removing a stale lock or restarting. A quiet console or an old checkpoint timestamp is not proof that the process stopped: a source request may be retrying. Resume with the same commands; do not regenerate the published catalog or delete the source cache to resume. `--retry-fallbacks` on the image collector retries recorded photo omissions and retains their previous evidence. The profile collector waits for groups of 25 while metadata is still running, then collects the last smaller group when it finishes.

After correcting an identity-matching or cross-artist release-duplication problem, `node scripts/catalog/expand-musicbrainz.mjs --retry-held-identities` retries the relevant held candidates using cached source evidence. Recovered attempts are marked with their resolved identity rather than erased. This flag is not needed on every ordinary resume.

Downloaded source bytes and their URL/date/SHA-256 receipts are retained in `.cache/catalog/`. Downloads use a regular temporary output file so retry output cannot concatenate partial response bodies. JSON is validated before caching; invalid cached JSON is quarantined rather than reused.

## Storage and verification

| File | Role |
|---|---|
| `scripts/catalog/artist-expansion-seeds.json` | Deduplicated candidate identities and exact discovery-query provenance |
| `.cache/catalog/musicbrainz/expansion.json` | Resumable metadata staging, admitted artists, rejected candidates and target progress |
| `.cache/catalog/images-expansion.json` | Resumable reviewed photographs and explicit local-avatar fallbacks |
| `.cache/catalog/artist-profiles-expansion.json` | English descriptions, genre entities, exact source-query receipts and per-artist coverage |
| `public/artwork/imported/` | Local photograph assets; retained quarantine assets may be present but are not referenced by the published catalog |
| `src/data/imported/musicbrainz.json`, `commons.json` and `artist-profiles.json` | Reviewed snapshots used by the application, search and pre-rendered pages |

```bash
# Read-only: compare the completed portion of staging to downloaded source originals.
node scripts/catalog/publish-expansion.mjs --verify-progress

# Published application counts only (never substituted with staging numbers).
pnpm catalog:stats
```

Progress verification is deliberately not publication approval. A successful partial check does not mean the target was met, remaining candidates were processed, all images were reviewed, or the new batch was rendered in a production build.

## Promote only after collection finishes

```bash
node scripts/catalog/publish-expansion.mjs
pnpm check
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm catalog:verify-sources
pnpm catalog:verify-build
```

Promotion requires a complete metadata checkpoint with at least 500 distinct artists with releases, complete image/profile-review checkpoints, unchanged prior published records, and exact source/receipt verification. Every admitted identity must have a checked profile record, even if the source supplies no description or genres. Photographs without a reviewed license never block on an invented substitute: the explicit local avatar is the fallback. Operational errors and local paths remain in staging rather than public photo metadata.

After promotion, verify new artist → album → track pages, metadata-only lyric states, canonical deep-link refresh, search and saving. The directory, search results and large discovery collections are paginated at 24 entries. Page positions and directory/search filters are reflected in their links; Discover's theme/mood controls remain local UI state. All catalog records remain searchable even when only one page is rendered. IDs/slugs use lookup maps and immutable search labels are normalized once to limit repeated work as the archive grows.

Keyword search still scans normalized in-memory labels; pagination does not make JSON downloads incremental. Match relevance remains exact → prefix → substring. At equal relevance, readable lyric entries precede metadata-only entries, so a newly imported recording with the same title does not displace an existing reading edition. Search does not index complete lyric bodies.

## Review exclusions and recovery

Bob Hope's `The Quick and the Dead - Volume 1: The Atom Bomb` and Lucille Ball's `Laughs, Luck ... and Lucy` were reviewed as non-music documentary/comedy material despite incomplete upstream album flags. Both are excluded from the published batch and the 500 target. Their original source bytes, local assets and staged records remain recoverable; no earlier published artist was removed. The final snapshot includes the reviewed release exclusions, and both promotion and published-source verification reject them.

`scripts/catalog/quarantine-excluded.mjs` is an offline migration for these explicit exclusions. It refuses to run while any collector lock exists, refuses baseline-artist changes or mixed eligible/excluded albums, and backs up all three checkpoints before changing staging. The review backup is `.cache/catalog/review-backups/excluded-2026-09-08T14-41-53.776Z-81203/` (`0.json`: metadata, `1.json`: images, `2.json`: profiles). It is not needed for an ordinary resume. Held network attempts and unsupported photo licenses stay documented in staging; they are not counted as successful imports.

## Verification record

- The promotion compared each preserved artist, release, photo and profile against the previous published snapshot before writing. New identities and release sequences were checked against cached discovery, identity, discography and official-edition source receipts.
- `pnpm check`, `pnpm lint` and all 55 unit tests passed after promotion. Checks include catalog references, local image bytes, every imported artist/release/track connection, profile identities, preservation of editorial biographies, source dates and same-title search ordering.
- `pnpm catalog:verify-sources` passed for 501 identities, 587 releases, 6,933 tracks, 491 photographs and 501 original profile-query receipts. The prior lyric corpus also passed: 101 author documents, 90 approved works and six explicit holds.
- `pnpm build` and `pnpm catalog:verify-build` passed for all 8,287 detail pages and 491 bundled photographs. The HTML audit checks per-page titles, headings, canonical URLs, sitemap inclusion, actual lyric sections or metadata-only notices, source links, portrait attribution, profile text and release track ordering.
- The six expansion-specific Playwright cases ran on desktop and mobile without skips: Lady Gaga, the final admitted group Sugababes, final-page directory navigation, source-name aliases, source credits, complete release sequences, deep-link refresh and saved-artist persistence. These cases also check serious/critical axe violations and horizontal overflow on the inspected artist pages.
- The final complete Playwright run passed **92/92 cases, without skips or retries**, with failure traces configured under `tmp/playwright-500-final`. The two homepage screenshot baselines were updated only after reviewing changes to the catalog counters, index heading and newest-release cards; other visual baselines and tolerances were unchanged. Separate 1440×900 and 390×844 first-viewport captures for Lady Gaga and Sugababes are in `test-results/artist-top-*.png`.

Expansion exposed two compatibility assumptions: a conditional over an inferred JSON type made the old timestamp branch `never`, and duplicate exact titles left the reading edition behind the earlier-loaded recording entry. The adapter now uses an explicit optional baseline-date shape, date assertions cover every imported artist/album/track, and a same-title regression covers readable-first tie ordering. The browser tests also wait for the song URL and heading before refreshing, and select the historical reading by its visible writer/availability instead of assuming a title is unique. These changes preserve actual catalog contents and do not mask failures with longer timeouts or looser assertions.

The expanded external-catalog chunk is about 3.50 MB minified / 845 kB gzip in this build. Vite's large-chunk warning remains; this work does not certify mobile performance targets or fix the cost of loading the entire catalog into browser memory. Browserslist age and React Router future-flag notices are also non-blocking build warnings.

This workflow does not deploy to production. A complete local collection is not a Vercel Preview or Lighthouse release certificate.

External labels are escaped at both HTML boundaries: generated SVG initials encode XML metacharacters, and JSON-LD serialization escapes literal `<` before embedding. These protections preserve the original parsed text while preventing source titles from terminating a script or breaking an artwork document.

Sources: [Wikidata query service](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service), [MusicBrainz API](https://musicbrainz.org/doc/MusicBrainz_API), [MusicBrainz rate limits](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting), [MusicBrainz data license](https://musicbrainz.org/doc/About/Data_License).

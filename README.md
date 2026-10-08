# 52lyrics

52lyrics is a rights-aware song discovery and lyric-reading experience. Search the catalog, read complete original and public-domain lyrics, follow connections between songs, writers, artists, and albums, and save items locally without creating an account.

## Quick start

Requirements: Node.js 22+ and pnpm 10+.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

## Release commands

```bash
pnpm check
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm preview
```

The production build is written to `build/client`. It contains pre-rendered HTML for every catalog route, a SPA fallback, `404.html`, `sitemap.xml`, and `robots.txt`.

## Product model

- **Search and discovery:** songs, artists, albums, themes, and moods share one ranked search index.
- **Homepage editions:** three responsive hero layouts rotate by local daypart and browser language region, with a visitor-controlled layout switch. Seasonal and fixed-date festive palettes change homepage accents; regional artist routes point to existing sourced catalog records. No location permission or IP lookup is used.
- **Lyrics availability:** `full` is allowed only when rights are `original`, `licensed`, or verified `public-domain`; `metadata-only` pages never render placeholder lyrics.
- **Original catalog:** The Midnight Echo has two releases and ten complete original songs.
- **Historical catalog:** eight public-domain texts collected from Wikisource, with eight writer files and eight explicitly editorial songbooks.
- **Online collection:** sourced MusicBrainz release editions, local Commons artist photographs, and visually reviewed author-released lyrics. Run `pnpm catalog:stats` for current counts (including distinct works versus release-track entries). Downloaded lyric documents and scores awaiting review are not counted as complete lyrics.
- **Author songbook:** approved texts without a verified recording edition have an explicitly editorial reading selection. Unknown dates remain unknown; translations with unresolved underlying rights remain outside the full-lyric catalog.
- **Local library:** saved items, recent views, and recent searches use the versioned `52lyrics:library:v1` localStorage key.
- **No playback or accounts:** the release contains no misleading audio controls and no server-side user data.

## Architecture

The application uses React 18, React Router 7 Framework Mode, TypeScript, Vite, and Zustand.

- `src/data/` owns typed catalog records, editorial collections, integrity validation, and search.
- `src/store/library.ts` owns the persisted local library.
- `src/pages/` contains route modules and page metadata.
- `src/components/` contains navigation, search, catalog cards, actions, feedback, and policy layouts.
- `react-router.config.ts` enumerates all static paths for pre-rendering.
- `scripts/generate-static.ts` creates crawler and fallback artifacts after the build.

## Configuration

| Variable | Required | Purpose |
|---|---:|---|
| `SITE_URL` | Production | Canonical URL and sitemap origin. |
| `VERCEL_PROJECT_PRODUCTION_URL` | Automatic on Vercel | Fallback production origin when `SITE_URL` is not set. |
| `VERCEL_URL` | Automatic on Vercel previews | Preview origin fallback. |
| `GA_MEASUREMENT_ID` | Optional | Google Analytics 4 measurement ID (e.g. `G-XXXXXXXXXX`). Enables GA4 scripts when set. |
| `BAIDU_TONGJI_ID` | Optional | Baidu Tongji (百度统计) site ID. Enables Baidu tracking when set. |

Local builds default to `http://localhost:5173`.

## Content and privacy

Full lyrics are displayed for original, licensed, or verified public-domain entries. Modern real-artist entries provide metadata and original editorial notes without reproducing lyrics. Historical texts include a fixed Wikisource revision, edition, retrieval date, and copyright evidence. Songbooks represent reading selections, not audio releases.

## Imported lyrics

The browser-collected batch is in `src/data/imported/wikisource.json`. Its editorial manifest and validator live in `src/data/publicDomain.ts`; the shared catalog connects it to every page, search, sitemap, and pre-rendered route.

```bash
pnpm catalog:import --check
# Import a staged, reviewed browser extraction (validates the entire batch first):
pnpm catalog:import /absolute/path/to/reviewed-browser-batch.json
```

The import command operates on local captures; it does not initiate browsing. New songs or source revisions require updating the reviewed edition manifest and extraction fingerprints. See [the collection record](docs/wikisource-import.md) for sources, normalization, excluded candidates, and the collection workflow.

For ongoing network collection, source policies, promotion commands, and the author-document review queue, see [the online collection guide](docs/catalog-collection.md). Score transcriptions require an explicit page-by-page reading order; unresolved shared authorship remains on a separate hold list. `pnpm catalog:verify-build` checks every catalog detail page in a completed production build against the current data and verifies bundled photograph hashes.

The [artist expansion](docs/artist-expansion.md), [subsequent increments](docs/catalog-continuation-20260930.md), and [1,000-artist release](docs/catalog-expansion-20261001.md) have grown the site to 1,000 imported recording artists with release content, 1,010 total artist/writer pages, 1,121 albums/songbooks and 13,217 song entries. Complete lyrics remain 108 distinct reviewed/original works; new commercial tracks are metadata-only. The guides record source provenance, exclusions, resumable staging, verification commands and browser-loading limitations. Candidate and staging counts are not substituted for published catalog counts.

The app stores the local library in the browser. Vercel deployments include anonymous, cookie-free Web Analytics and do not add advertising or marketing tracking.

## Testing

Vitest validates catalog integrity, search behavior, and the local library. Playwright covers desktop and mobile search, canonical redirects, rights-aware song states, persisted saves, accessibility checks, and visual regression snapshots.

Before promoting a Vercel Preview, verify:

1. Search for `City Lights` and open the lyric in two actions.
2. Save it, reload, and confirm it appears on `/saved`.
3. Open `/lyrics/miley-cyrus-flowers` and confirm only song notes appear.
4. Confirm `pnpm check && pnpm lint && pnpm test && pnpm test:e2e && pnpm build` succeeds.

## License

See [LICENSE](./LICENSE). Catalog metadata is provided for demonstration and discovery; original lyrics and custom visual assets remain subject to their stated copyright.

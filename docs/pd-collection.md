# Public-domain lyric collection (Wikisource anthologies)

This pipeline is separate from metadata collection. A record only becomes a
catalog lyric page after it passes every stage below, and `pnpm catalog:stats`
reports the two flows independently.

## Pipeline states

Each record in `src/data/imported/pd-candidates.json` carries one status:

| Status | Meaning | Counted as complete lyrics? |
|---|---|---|
| `approved` | Text validated stanza by stanza, revision pinned, rights resolved | Yes |
| `needs-review` | Validation or rights question that a human must settle | No |
| `hold` | Known rights obstacle (for example, an author whose life+70 term has not expired) | No |
| `duplicate` | Same work (author + normalized title) already in the catalog or earlier in the run | No |
| `failed` | Source page missing or request failed; retried on the next run | No |

The run is resumable: every HTTP response is cached by URL under
`.cache/catalog`, so re-running the collector skips work already downloaded.

## Sources

Configured in `scripts/catalog/pd-books.json`:

1. **The Book of Scottish Song (1843, ed. Alexander Whitelaw)** — 560
   subpages collected. Because every contribution predates 1843, any
   contributor died at least 130 years ago, so the texts are public domain
   worldwide; no per-author lookup is required.
2. **The Scottish Minstrel (First Series) (1850)** — same unconditional rule.
3. **The Canadian Soldiers' Song Book (1918)** — the edition is public domain
   in the United States (pre-1931 publication). A record is approved only when
   its credited author is traditional/anonymous or died in 1956 or earlier
   (life+70 expired as of 2026); otherwise it is held or flagged for review.

Author death years come first from the Wikisource author link (for example
`Author:Robert_Burns_(1759-1796)`), then from Wikidata (`P570`), cached in
`scripts/catalog/pd-author-years.json` for review.

## Per-record guarantees

- **Pinned revision**: text is parsed from `action=parse&oldid=<revid>`, and
  the record stores the exact `revisionUrl`.
- **Proofread scans only**: pages whose scan quality is below 3
  (Wikisource proofread levels) are flagged `needs-review`.
- **Stanza validation**: at least 8 lines; junk patterns (wiki markup,
  navigation text, TemplateStyles) and overlong lines reject the record;
  verse groups split on blank lines in the source block. A source that
  prints the song as a single unbroken block is accepted with a
  `single-stanza source text` note rather than invented verse breaks.
- **Noise removal**: song numbers, "Words by / Key-note" preludes, page
  numbers and typography spans are stripped; `Chorus`/`Refrain` marker lines
  become the label of the following stanza instead of a fake lyric line.
- **Deduplication**: within the run by normalized author + title, and against
  every catalog title, so an anthology cannot double-count a work already
  published (for example the eight reviewed Wikisource editions).

## Commands

```bash
node --import tsx scripts/catalog/collect-public-domain.mjs   # resumable collection
pnpm catalog:stats                                            # pages vs works, statuses
pnpm catalog:audit                                            # full-lyric corpus audit
```

Set `CATALOG_REQUEST_INTERVAL_MS` to tune the per-host request interval
(default 1200 ms). `PD_LIMIT` caps pages per book for a partial run.

## What is deliberately not collected

- Modern commercial lyric sites (unlicensed reproductions).
- OCR text layers without visual proofreading (quality < 3).
- Works whose only evidence is "it looks old" without a dated edition.
- Translations whose underlying original is still in copyright.

Held records stay in `pd-candidates.json` with a reason, so a future rights
change (for example an author's term expiring) can be re-evaluated without
recollection.

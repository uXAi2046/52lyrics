# Promotion round — 26 October 2026

## Goal

Increase discoverability of the expanded catalog (1,386 full-lyric works, 1,060 sourced
recording artists) without paid channels or accounts.

## What was done

1. **IndexNow instant-discovery submission** (`scripts/promote/indexnow-submit.mjs`).
   A generated key (`scripts/promote/indexnow-key.txt`) is hosted at
   `https://www.52lyrics.com/<key>.txt` from `public/`. After deployment the script
   submits every sitemap URL in 100-URL batches.
   **Result (2026-10-27):** all **4,168 URLs submitted and accepted by Yandex**
   (`INDEXNOW_ENDPOINT=https://yandex.com/indexnow`, 42/42 batches HTTP 202).
   The aggregate endpoint `api.indexnow.org` (routes to Bing) answers HTTP 403
   `UserForbiddedToAccessSite` until Bing re-validates the live key file; the
   first 100-URL batch submitted before the throttling was accepted (HTTP 200).
   `api.bing.com` itself returned a service-outage page during this window, so
   this is a Bing-side delay, not a key problem — Yandex accepting the same key
   proves the key file is reachable and correct. Re-run without INDEXNOW_ENDPOINT
   after a few days: `INDEXNOW_BATCH_DELAY_MS=6000 node scripts/promote/indexnow-submit.mjs`.
2. **Share-card and structured-data audit.** All prerendered pages already carry
   canonical URLs, `og:`/`twitter:` cards with the 1200×630 social card, and JSON-LD
   structured data on home/artist/album/lyrics pages. No changes required.
3. **Announcement copy pack** (below), written from the deployed catalog numbers.

## Announcement copy (EN)

> 52lyrics now publishes **1,386 complete lyric works you can actually read** — every
> one with its printed source edition, retrieval date and rights evidence, no
> guesswork. This week's additions: **437 Robert Burns works** from the 1887 Poetical
> Works, William Blake's *Songs of Innocence and of Experience* (1826), medieval
> hymns, French-Canadian folk songs and more. Recording side: **1,060 artists** with
> sourced track-level discographies (MusicBrainz) and Commons-licensed photos.
> Browse everything at https://www.52lyrics.com/lyrics

## Announcement copy (ZH)

> 52lyrics 现在收录 **1,386 部可直接阅读的完整歌词**，每一篇都标明出处版本、
> 获取日期与权利依据。本周新增：**Robert Burns 1887 版诗全集 437 首**、Blake
> 《Songs of Innocence and of Experience》(1826)、中世纪圣诗、法裔加拿大民歌等。
> 录音资料侧已达 **1,060 位艺人**，曲目级发行数据来自 MusicBrainz，图片均带
> Commons 授权署名。入口：https://www.52lyrics.com/lyrics

## Suggested channels

- Bluesky / Mastodon / X posts using the EN copy (link card renders automatically).
- Reddit r/ballads, r/folk, r/RobertBurns — reply-style sharing of a specific new
  text page rather than the homepage.
- Hacker News "Show HN" angle: rights-aware lyrics site with pinned-source text
  pages and full source verification.
- Zhihu/豆瓣 answer-style posts using the ZH copy.

## Follow-up

Re-run `node scripts/promote/indexnow-submit.mjs` after future catalog rounds; it
resubmits the full sitemap and the receiving engines deduplicate already-known URLs.

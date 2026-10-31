# Monetization roadmap — 52lyrics

Ultimate goal: turn organic search traffic into revenue. Constraint carried from the
promotion goal: everything that can run without human account intervention is
automated; the steps that require an account holder are marked explicitly and are not
automatable under any circumstances (payment identity, tax information, network
approvals).

## Phase 0 — measurement (done, automated)

- Baidu Tongji (`hm.baidu.com/hm.js?7ba35cf4…`) is live on every pre-rendered page.
- GA4 slot exists in the build config (`GA_MEASUREMENT_ID`) and is currently empty —
  activation requires a Google Analytics property (account holder action).
- Traffic baseline: the domain entered search-engine processing on 2026-10-26
  (IndexNow submissions to Yandex and Seznam accepted in full; Bing pending its
  re-validation of the hosted key file).

## Phase 1 — traffic acquisition (automated, ongoing)

- Content scale: catalog rounds keep adding long-tail pages (artists, editions,
  complete lyrics). Sixteen thousand+ track pages, 2,254 complete-lyric works.
- Search coverage: Yandex + Seznam submissions accepted; Bing self-validates the key
  file (re-run `node scripts/promote/indexnow-submit.mjs` without INDEXNOW_ENDPOINT
  every few days); Baidu discovers via external links (the GitHub README now links
  the live site; more inbound links = faster Baidu discovery).
- Realistic timeline for meaningful organic traffic on a new domain: 4–12 weeks.

## Phase 2 — monetization rails (requires account holder; listed in activation order)

| Channel | Prerequisite | Automation boundary |
| --- | --- | --- |
| 百度联盟 (Baidu Union) | ICP 备案 for the domain + Baidu account | Site-side ad slots can be prebuilt; account/approval is human-only |
| Google AdSense | Google account + site approval | Same |
| Donation (爱发电 / ko-fi / GitHub Sponsors) | Personal payment identity | A `/support` page can be built the moment a link is provided |
| Affiliate (book/record links on songwriter pages) | Associate account | Outbound link component can be prebuilt |
| GitHub Sponsors on the public repo | GitHub account | Not automatable |

Note: the production server serves `www.52lyrics.com` from a mainland-China VM;
confirm ICP 备案 status before enabling mainland ad networks — serving an unlicensed
commercial domain from a mainland IP risks the whole deployment.

## Phase 3 — what the automated pipeline delivers while traffic grows

Every catalog round (30 artists + one lyric collection per ~40 minutes, fully
automated) expands the long-tail search surface. Each artist page ships with
canonical URL, OG/Twitter cards, and JSON-LD structured data.

## Immediate next actions (automated)

1. Catalog round 7 running: metadata target 1300.
2. Bing IndexNow retry every few days.
3. When the account holder is ready, the fastest activation path is: register the ad
   network, then hand me the ad-network slot ID — slot insertion, layout integration,
   and deployment are automated.

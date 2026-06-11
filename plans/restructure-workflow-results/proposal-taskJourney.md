# Proposed IA — Task/Journey-First Docs

Grounded in: `docs.json`, `doc_guidelines.md`, `sdk/feed.mdx`, `sdk/overlays.mdx`, `sdk/player-and-widget.mdx`.

## 1. Nav tree

### Tab: Docs

**Get started** *(get running)*
- `quickstart` — key → install → render a feed in 10 min; install snippets via shared `snippets/versions.mdx` (single edit per release)
- `sdk/installation` — full per-platform install + 12-item troubleshooting
- `platforms/web` — Web distribution model (CDN vs npm, `hls.js` peer dep), manager pattern, web-only callbacks (gap #7)

**Show content** *(display)*
- `display/feed` — embed the feed component per platform (embed patterns only)
- `display/feed-control` — programmatic feed control: scroll, refresh, `applyFilter`, lock, deep-link seeding, `activate`/`deactivate`, multi-surface lifecycle, preload/pull-to-refresh (gaps #4–6)
- `display/custom-feeds` — `FeedInput`, `setFeedItems`/`appendFeedItems`, `FeedSource.custom`, live `playbackId` seeding, cross-platform (gap #3)
- `display/player` — single embeddable player component (`PlayerConfig`, activate/deactivate)
- `display/widget` — carousel/grid widget, `WidgetInput`, playback modes, click actions

**Add content** *(server side, REST)*
- `content/uploading` — upload + import task flow; field tables removed, links to API ref
- `content/carousels` — create image/video carousels, image upload/reorder
- `content/metadata-and-captions` — PATCH merge semantics, captions, publication URLs
- `content/live-streams` — lifecycle, protocols, broadcast, clips (+Web viewing tab, token flow)
- `content/downloads` — watermarked download flow, SDK `downloadVideo` + delegate (gap, all surfaces)
- `content/localization` — `customMetadata.language`, BCP 47, canonical filter-by-language examples

**Customize the experience**
- `customize/overlays` — `VideoOverlayMode`, `FeedOverlay` protocol, registration, SwiftUI mode
- `customize/overlays-react-native` — RN's props-in/commands-out architecture (structurally different; own page per digest)
- `customize/item-overlays` — Carousel/VideoCarousel/Survey/Ad overlay protocols, `NativeAdContent`, Android ads types
- `customize/carousel-control` — video carousel runtime (`shortKit.carousel`, events, recipes); add Android/Flutter
- `customize/live-ios` — iOS live viewer surface (`LiveOverlay`, room expand/collapse, mask)
- `customize/recipes/scrubber`, `customize/recipes/captions` — the two ~400-line worked tutorials

**Users & analytics** *(operate)*
- `users/identity` — canonical `setUserId`/`clearUserId` + resolve mechanics
- `users/analytics` — auto-collected metrics, `customDimensions`, canonical `sendContentSignal`, pointers to metrics API

**SDK reference** *(extracted, canonical — guides link, never duplicate)*
- `reference/shortkit` — `ShortKit` initializer (corrected signatures, all platforms) + instance lifecycle
- `reference/feed-config` — `FeedConfig` + `FeedFilter` (corrected `Map<String,[String]>` OR semantics)
- `reference/player` — `ShortKitPlayer` publishers/commands/events with platform-availability column
- `reference/content-models` — `FeedItem`, `ContentItem`, captions, inputs, per-type data matrix, fallback URLs
- `reference/platform-support` — parity matrix replacing scattered "Coming soon"; tab-label + "since X"/"unreleased" conventions

### Tab: API Reference (kept; additions only)
- **Overview**: add `api/webhooks` — canonical callback events + retry semantics (replaces duplication in upload/import)
- **New group — Feed**: object + `GET /v1/feed`, `/feed/videos`, `/feed/filter`, `/feed/discovery` ×2
- **New group — SDK Runtime** (pk-key): `POST /v1/events`, `POST /v1/identity/resolve`, `GET /v1/captions`, live viewer/publisher tokens + start
- **Content**: add carousel create, images, image order, captions, publication URLs, finalize, create-shell, import-status, download-url/download
- **Analytics** → subgroups Metrics / Views / Events / Dimensions; add breakdown, heatmap, batch, views, exports, dimension-values, `filters[]`
- **Surveys**: add `PUT /v1/surveys/priorities`
- Fix `api/authentication.mdx` pk-table (phantom endpoints)

### Tab: Changelog (new)
- `changelog` — Mintlify `<Update>` entries tagged by area (sanctioned home; fixes PR #20)
- `changelog/migrations/*` — versioned migration guides (e.g. carousel playback IDs, FeedFilter semantics)

## 2. Old page → new location

| Old | Disposition |
|---|---|
| `quickstart` | Kept; install section slimmed to snippet includes |
| `sdk/installation` | Kept; versions via snippet |
| `guides/content-types` | **Split**: models → `reference/content-models`; custom-feed-input guide → `display/custom-feeds`; fallback behavior → `reference/content-models` |
| `guides/upload-pipeline` | **Split**: `content/uploading` + `content/carousels` + `content/metadata-and-captions`; field tables/callback events deleted → link API ref + `api/webhooks` |
| `guides/live-streams` | Moved → `content/live-streams` |
| `guides/language-detection` | Moved → `content/localization` (canonical; configuration's duplicate deleted) |
| `sdk/feed` | **Split**: embed → `display/feed`; control scraps grown → `display/feed-control` |
| `sdk/player-and-widget` | **Split**: `display/player` + `display/widget`; fabricated Kotlin tabs deleted |
| `sdk/configuration` | **Split** → `reference/shortkit` + `reference/feed-config`; language section deleted |
| `sdk/player` | Moved → `reference/player` (sole canonical copy) |
| `sdk/overlays` | **Split 5 ways**: `customize/overlays`, `customize/overlays-react-native`, `customize/item-overlays`, `customize/recipes/{scrubber,captions}`; embedded player/`ContentItem` tables deleted → links |
| `sdk/carousel` | Moved → `customize/carousel-control`; Android/Flutter parity added |
| `sdk/identity` | Moved → `users/identity` (canonical; analytics duplicate deleted) |
| `sdk/analytics` | Moved → `users/analytics` (canonical signals home; identity recap → link) |
| `coming-soon.mdx` | **Deleted** — superseded by Changelog tab |

All moves get `redirects` entries in `docs.json`; `doc_guidelines.md` nav section + edit-vs-create rules updated in lockstep.

## 3. Gap homes (digest §1–7)

- Feed/SDK-runtime/analytics/downloads/sub-resource endpoints → new API Reference groups above
- Broken init signatures + phantom APIs → fixed once in `reference/shortkit`/`reference/feed-config`/`reference/player` (single source kills re-divergence)
- Stale versions → `snippets/versions.mdx`
- Parity gaps + "coming soon" lies → `reference/platform-support` matrix + availability badges
- Homeless features: live viewer → `customize/live-ios`; downloads → `content/downloads`; custom feeds → `display/custom-feeds`; feed control/lifecycle/preload → `display/feed-control`; Web → `platforms/web`; RN overlays → `customize/overlays-react-native`; webhooks → `api/webhooks`; unreleased-marker convention → `reference/platform-support` + Changelog

## 4. Key tradeoffs

1. **URL churn vs determinism**: ~12 pages move/split, requiring redirects and a guidelines rewrite — one-time cost buying deterministic placement rules for the automated pipeline (each API surface has exactly one canonical page).
2. **Reference extraction adds click-throughs**: guides link to `reference/player` instead of inlining tables — slightly worse linear reading, but eliminates the 3× duplicated tables that already diverged.
3. **Mostly shared-tab pages with two platform-specific exceptions** (`overlays-react-native`, `platforms/web`): keeps page count O(features) not O(features×platforms), but introduces an asymmetry agents must learn — encoded as an explicit rule: split per-platform only when the architecture (not just syntax) differs.
# Proposed IA — scalability-first (4 tabs)

Grounded in: `docs.json`, `doc_guidelines.md`, `sdk/feed.mdx`, `sdk/overlays.mdx` tab-label audit (8 inconsistent labels: Swift/Kotlin/UIKit/SwiftUI/Expo/…), no `snippets/` dir exists today.

**Core move:** kill the N-platform `<Tabs>` matrix structurally. SDK material becomes **per-platform page trees with a fixed component taxonomy**; cross-platform material lives in tab-free concept/workflow pages. A feature that doesn't exist on platform P simply has no page — parity becomes structural, not "Coming soon" stubs.

## 1. Nav tree

**Tab: Docs** (platform-neutral; REST examples only — cURL/Python/Node)
- *Get started*: `index` (product overview + platform picker cards), `quickstart` (slim: get key → link to platform quickstart)
- *Concepts*: `concepts/content-model` (canonical type matrix, fallback behavior, customMetadata), `concepts/feeds` (feed mechanics, filtering semantics incl. OR-map `FeedFilter`), `concepts/playback` (PlayerState machine, loop/transition semantics — written once), `concepts/identity` (anon UUID, resolve mechanics, X-User-Id), `concepts/analytics` (auto-collected metric tables, customDimensions, signals model), `concepts/live-streams` (lifecycle, hls/webrtc, heartbeat), `concepts/monetization` (ad slots, ad config)
- *Workflows* (multi-step REST): `workflows/upload`, `workflows/import`, `workflows/carousels` (create/images/reorder), `workflows/captions`, `workflows/publication-urls`, `workflows/webhooks` (canonical callback events + retries), `workflows/downloads` (202 flow, watermarking), `workflows/language` (BCP 47, `und`), `workflows/broadcasting` (ffmpeg/OBS, clips)
- *Platforms*: `platforms/parity` (feature × platform availability matrix with "since X" badges)

**Tab: SDKs** (new; per-platform groups — zero `<Tabs>` inside)
Each platform group uses the **same closed slug taxonomy**: `installation`, `quickstart`, `configuration`, `feed` (embed + control: scroll/refresh/filter/lock/deep-link/lifecycle/multi-surface/preload), `player` (publishers/commands — per-platform units documented natively), `player-view` (single-player component), `widgets`, `overlays` (incl. carousel/survey/ad overlay protocols where shipped), `carousel`, `custom-feeds` (FeedInput/setFeedItems/appendItems), `analytics-and-identity` (setUserId, signals, customDimensions), `live`, `downloads`, `ads`, `debugging`.
- *iOS*: full taxonomy (incl. `live` — LiveOverlay/LiveRoomMask gap)
- *Android*: taxonomy minus `live`; gains `carousel` (gap), `ads` (gap); fabricated `player-view`/`widgets` content deleted until real
- *Flutter*: taxonomy incl. `custom-feeds`, `player`, `widgets` (shipped-but-"coming soon" lies fixed); unreleased 0.3.0 surface marked with `<Badge>Unreleased</Badge>` convention
- *React Native*: incl. `overlays` written for RN's props-in/commands-out architecture (fixes systematic misdocumentation), `carousel`, `downloads`
- *Web*: `installation` (CDN vs npm, hls.js peer dep), `platform-notes` (manager pattern — the one taxonomy extension), `live` (viewing), real `player-view`/`widgets` APIs
- New platforms (year 2): copy the taxonomy — no existing page grows.

**Tab: API Reference** (unchanged structure; additions only)
- New groups: **Feed** (`/feed`, `/feed/videos`, `/feed/filter`, `/feed/discovery` ×2 + feed-item object), **Client runtime** (`POST /v1/events`, `POST /v1/identity/resolve`, `GET /v1/captions`, live viewer/publisher tokens, `start`), **Webhooks** (event reference)
- Content group: + carousel create, images, image order, captions, publication-urls CRUD, download-url/download, finalize, import-status
- Analytics regrouped: Metrics (+breakdown, heatmap, batch) / Views (+exports) / Events / Dimensions; Surveys + `PUT /v1/surveys/priorities`
- `api/authentication.mdx` pk-table rewritten (phantom endpoints removed)

**Tab: Changelog**
- `changelog` (Mintlify `<Update>` per release, product-area + platform tags)
- *Migrations*: `migrations/v{version}-{slug}` (PR #20's invented pages land here, sanctioned)

**Infrastructure:** `snippets/versions.mdx` — single source for all SDK version strings (incl. independent web line); release scripts bump one file. `<Badge>` conventions: `Since 0.2.x` / `Unreleased`.

## 2. Old page → new location

| Old | Disposition |
|---|---|
| `sdk/installation` | Split → `sdks/{p}/installation` ×5; versions → snippet |
| `quickstart` | Split → slim `quickstart` hub + `sdks/{p}/quickstart` |
| `guides/content-types` | Split → `concepts/content-model` + `sdks/{p}/custom-feeds`; field tables consolidated into `api/content/object` (links only) |
| `guides/upload-pipeline` | Move → `workflows/upload` + `workflows/carousels` + `workflows/captions` + `workflows/publication-urls` + `workflows/webhooks`; field tables → API ref |
| `guides/live-streams` | Split → `concepts/live-streams` + `workflows/broadcasting` + `sdks/{ios,web}/live` |
| `guides/language-detection` | Move → `workflows/language`; filter snippets → link `sdks/{p}/configuration` |
| `sdk/feed` | Split → `sdks/{p}/feed` ×5 |
| `sdk/player-and-widget` | Split → `sdks/{p}/player-view` + `sdks/{p}/widgets` (shipped platforms only) |
| `sdk/configuration` | Split → `sdks/{p}/configuration` ×5 |
| `sdk/player` | Split → `sdks/{p}/player` + `concepts/playback` (state machine once) |
| `sdk/overlays` | Split → `sdks/{p}/overlays` ×5 (tutorials live per-platform); duplicated player tables deleted (link) |
| `sdk/carousel` | Split → `sdks/{ios,rn,android}/carousel` |
| `sdk/identity` | Merge → `concepts/identity` + `sdks/{p}/analytics-and-identity` |
| `sdk/analytics` | Merge → `concepts/analytics` + `sdks/{p}/analytics-and-identity` |
| `coming-soon` | Delete (orphan; roadmap signal moves to Changelog) |
| API Reference pages | All kept in place |

All moves get `redirects` entries in `docs.json`. `doc_guidelines.md` rewritten in lockstep.

## 3. Mechanical placement rules (for the PR→docs pipeline)

1. REST change → `api/{group}/{page}`; new resource → new group + object page.
2. SDK change on platform P, component C → `sdks/{p}/{c}` from the closed taxonomy. Component missing → create that slug. Feature absent on P → no page; update `platforms/parity`.
3. Cross-platform semantics → `concepts/`; multi-step REST procedure → `workflows/`.
4. Every release → `<Update>` in `changelog`; breaking → `migrations/v{x}-{slug}`; version strings → `snippets/versions.mdx` only.
5. Never add a platform `<Tab>` anywhere; concept/workflow pages are tab-free by rule.

## 4. Key tradeoffs

- **Page count ~13 → ~75.** Each page is small, single-platform, tab-free, with a deterministic address — better for automated PRs and parity honesty, but nav is deeper and total prose duplicated across similar platforms (iOS/Android often parallel). Accepted: real divergence (RN overlays, ms-vs-seconds) makes shared tabs actively wrong.
- **One-time migration cost is high** (every Docs-tab URL moves; redirects + guidelines rewrite + content audit). Traded against the recurring O(platforms × pages) tab-maintenance tax and the 21 existing stub tabs.
- **Side-by-side language comparison is lost.** Developers porting between platforms must navigate instead of flipping tabs; mitigated by identical taxonomy slugs (swap `/sdks/ios/` → `/sdks/android/`), concepts pages, and the parity matrix — but it's a genuine UX regression for cross-platform teams.
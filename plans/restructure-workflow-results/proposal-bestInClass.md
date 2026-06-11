# Proposed IA — Best-in-Class Comparables Lens

Grounded in: `docs.json`, `doc_guidelines.md`, and skims of `sdk/overlays.mdx`, `sdk/feed.mdx`, `guides/content-types.mdx` (all in `/Users/michaelseleman/orca/workspaces/shortkit-docs-repo/local-fable-docs`).

**Core move (Stream getstream.io):** replace the 5–7-way `<Tabs>` matrix with per-platform SDK sections. Stream ships the same product on the same 5 platforms and gives each its own parallel doc track — pages only exist where the feature exists, which kills both "Coming soon" stubs and the RN-overlays misdocumentation. Concepts stay shared (Mux guides/reference split) so they aren't written 5×.

## 1. Proposed nav tree (4 tabs)

### Tab: Docs *(concepts + server-side workflows; REST snippets only — Mux "Develop video" + Stripe concepts)*
- **Get started**
  - `index` — product overview + platform cards linking into SDK sections *(LiveKit home page)*
  - `quickstart` — API keys → first feed in <5 min; links to per-platform install, no duplicated install steps *(Stripe quickstart)*
- **Core concepts**
  - `concepts/content-model` — canonical `FeedItem`/`ContentItem`/carousel/survey/ad types + per-type availability matrix (single source of truth; ends the 3× `ContentItem` table)
  - `concepts/feeds` — ranked feed vs custom feeds, publish lifecycle, fallback URLs, deep-link seeding concept
  - `concepts/identity` — anonymous UUID, `setUserId`, `/v1/identity/resolve` mechanics (canonical; analytics links here)
- **Content** *(REST workflows; field tables link to API Reference, never duplicate — Mux)*
  - `content/upload-videos` — direct + client upload, polling, statuses
  - `content/carousels` — create, images, reorder
  - `content/captions` — upload + language tagging
  - `content/live-streams` — server lifecycle, protocols, broadcast, clips (corrects "cannot restart" claim)
  - `content/downloads` — download-url, watermarking, 202 flow **(new)**
  - `content/language-detection` — BCP 47 metadata + filtering (kept; configuration duplicate removed)
  - `content/webhooks` — callback events + retry semantics, shared across upload/import/clips **(new)**
- **Analytics**
  - `analytics/overview` — auto-collected metric tables, QoE, sessions
  - `analytics/custom-data` — `customDimensions` + `sendContentSignal` (canonical; 3 copies collapse here)
- **Monetization**
  - `monetization/ads` — ad config concepts, ad slots; links to per-platform ad overlays

### Tab: SDKs *(Stream-style per-platform groups: iOS / Android / Flutter / React Native / Web — parallel page skeleton, pages omitted where unsupported)*
Per platform:
- `sdks/{p}/install` — requirements, install, init (the one canonical, **correct** init signature), troubleshooting
- `sdks/{p}/feed` — embed + `FeedConfig`/`FeedFilter` + controlling the feed (scroll, refresh, filter, lock, lifecycle `activate`/`deactivate`)
- `sdks/{p}/playback` — `ShortKitPlayer` publishers/commands/state machine (renamed from "player" to break the player/Player collision)
- `sdks/{p}/widgets` — single player + widget + grid (renamed from "player-and-widget"; Android fabricated content deleted)
- `sdks/{p}/overlays` — that platform's real overlay model (RN gets its props-in/commands-out architecture documented honestly)
- `sdks/{p}/carousel` — iOS, Android **(new Kotlin content)**, RN only
- `sdks/{p}/live` — iOS (LiveOverlay, live room) + Web (viewing) only **(new)**
- `sdks/{p}/downloads` — iOS, RN only **(new)**
- `sdks/{p}/advanced` — multi-surface, preload/cold-start, debug/tracing **(new)**
- `sdks/web/install` additionally covers Web's distribution model (CDN vs npm, peer deps) — gap 7
- `sdks/{ios,android}/recipes` — scrubber + captions worked examples (extracted from overlays)

### Tab: API Reference *(kept as-is — per-endpoint pages scale; additions only)*
- Overview: add `api/webhooks` reference page; fix `authentication` pk/sk table
- **New group: Feed** — `GET /v1/feed`, `/feed/videos`, `/feed/filter`, `/feed/discovery`, `/feed/filter/discovery`
- **New group: Client runtime** — `POST /v1/events`, `POST /v1/identity/resolve`, `GET /v1/captions`, live `viewer-token`/`publisher-token`/`start`
- Content: add captions, images, image order, publication URLs, finalize, create-shell, import-status, download-url/download
- Analytics: restructure into nested **Metrics / Views / Events / Dimensions / Exports** subgroups; add breakdown, heatmap, batch, views, exports, dimension values, `filters[]`
- Surveys: add `PUT /v1/surveys/priorities`

### Tab: Changelog *(Stripe changelog + upgrade guides)*
- `changelog/index` — `<Update>` per release, product-area tags
- `changelog/migrations/{version}` — breaking-change guides (sanctioned home for PR-#20-style pages)
- Convention: `snippets/versions.mdx` holds all SDK version strings (one edit per release); "Since X" / "Unreleased" badge convention defined here

## 2. Old page → new location

| Old | Disposition |
|---|---|
| `sdk/installation` | **Split** → `sdks/{p}/install` ×5 |
| `quickstart` | **Kept/slimmed** → `quickstart` (install steps removed) |
| `guides/content-types` | **Split** → `concepts/content-model` + custom-feed-input into `sdks/{p}/feed` + fallback into `concepts/feeds` |
| `guides/upload-pipeline` | **Split** → `content/upload-videos`, `content/carousels`, `content/captions`, `content/webhooks` |
| `guides/live-streams` | **Split** → `content/live-streams` (server) + `sdks/{ios,web}/live` (client) |
| `guides/language-detection` | **Moved** → `content/language-detection` |
| `sdk/feed` + `sdk/configuration` | **Merged & split** → `sdks/{p}/feed` ×5 |
| `sdk/player` | **Split** → `sdks/{p}/playback` |
| `sdk/player-and-widget` | **Split** → `sdks/{p}/widgets` (fabricated Kotlin deleted) |
| `sdk/overlays` | **Split** → `sdks/{p}/overlays` + `sdks/{p}/recipes`; embedded player/ContentItem tables deleted (link to `playback`/`content-model`) |
| `sdk/carousel` | **Split** → `sdks/{ios,android,rn}/carousel` |
| `sdk/identity` | **Moved** → `concepts/identity` |
| `sdk/analytics` | **Split** → `analytics/overview` + `analytics/custom-data` (identity recap deleted) |
| `coming-soon` (orphan) | **Deleted** → Changelog tab |
| All `api/*` | **Kept** (additions per above) |

## 3. Gap homes (digest §)

§1 → new Feed + Client runtime groups, Analytics restructure, Content additions. §2 init fixes → `sdks/{p}/install` (one canonical place each). §3 phantom APIs → die naturally in the split (only real per-platform surface is rewritten). §4 versions → `snippets/versions.mdx`. §5 parity → per-platform pages exist only where shipped; Android live caveat on `sdks/android/feed`. §6 homeless features → `sdks/ios/live`, `*/downloads`, `concepts/feeds` + `sdks/{p}/feed` (custom feeds/control), `*/advanced`, `sdks/web/install`, `content/webhooks`. §7 conventions → defined in Changelog tab + snippets.

## 4. Key tradeoffs

1. **Page count explodes (~14 → ~55 Docs/SDK pages).** A cross-platform change now touches N pages, not N tabs on one page — but each edit is small, deterministic for the PR pipeline, and parity is honest. Stream pays this cost deliberately; it's the proven model for 5-platform SDKs.
2. **Near-total URL migration.** Requires a full `redirects` block in `docs.json` and a lockstep rewrite of `doc_guidelines.md`'s nav + edit-vs-create rules; one-time cost traded for permanent placement determinism.
3. **Concepts/SDK two-tab split** means a reader integrating overlays hops between `concepts/content-model` and `sdks/{p}/overlays`. Mux/Stripe accept this (guides link, never duplicate); mitigated by cross-links, but it loses today's one-page-has-everything reading flow.
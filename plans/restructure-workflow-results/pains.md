# Docs tab scaling diagnosis — local-fable-docs

## 1. Ranked scaling problems

### P1 — The 5–7 platform `<Tabs>` matrix multiplies every section
Every concept is written N times, once per platform, inline. Evidence:
- `sdk/overlays.mdx` (1307 lines): 11 `<Tabs>` blocks, up to 6 tabs each (Swift/Kotlin/Flutter/RN/Web), including two ~400-line worked examples (scrubber, captions) repeated per platform.
- `quickstart.mdx` has up to 8 tab variants (SwiftUI, UIKit, Kotlin, Flutter, RN, Expo, Web); `installation.mdx` adds Expo and Web(npm)/Web(CDN) splits.
- Platform parity is uneven: 21 "Coming soon" markers across `sdk/` + `guides/` (e.g. `player-and-widget.mdx` Android/RN tabs are stubs for WidgetInput, grid, playback modes). Adding a feature means touching O(platforms) tabs per page, or shipping hollow tabs.
- Tab labels are inconsistent page-to-page: "Swift" vs "iOS" vs "iOS (Swift)" vs "iOS (UIKit)"; "Kotlin" vs "Android". Per-platform divergences (RN's `overlay` vs `videoOverlay`, `surveyMode`, Android ms vs iOS seconds in `PlayerTime`) are patched with inline `<Note>`s instead of a parity strategy.

### P2 — API-reference material duplicated inside guides; no single source of truth
- The full `ShortKitPlayer` publisher/command/`ContentItem` tables appear **twice**: `sdk/overlays.mdx` lines 267–328 and `sdk/player.mdx` (entire page). They already diverge (overlays' table lacks `formatChange`, `prefetchedAheadCount`, `remainingContentCount`).
- `guides/content-types.mdx` (868 lines) is a type reference (struct dumps ×5 platforms + field tables), not a guide — and re-documents `ContentItem` a third time.
- `guides/upload-pipeline.mdx` re-documents request fields, callback events, and caption/carousel params that `api/content/upload.mdx` (380 lines) and `api/content/import.mdx` already own.
- `FeedConfig` appears in `configuration.mdx`, `feed.mdx`, `overlays.mdx`, and `player-and-widget.mdx`; engagement signals are documented in 3 places. Every behavior change fans out to 3–4 pages — this is exactly why the automated PR pipeline struggles.

### P3 — Unclear page boundaries and overloaded pages
- `sdk/player.mdx` ("Player" = the `ShortKitPlayer` API) vs `sdk/player-and-widget.mdx` (title: "Widgets & Entry Points" = `ShortKitPlayerViewController` + widget + grid). Two "player" pages, in different nav groups ("Build Your Experience" vs "Display"), with a filename that doesn't match its title.
- `overlays.mdx` holds 5 distinct protocols (FeedOverlay, CarouselOverlay, VideoCarouselOverlay, SurveyOverlay, AdOverlay) + SwiftUI mode + a player reference + 2 tutorials. `player-and-widget.mdx` holds 3 components (player, carousel widget, grid widget) + click actions. An agent deciding "edit vs create" has no deterministic answer.
- Nav groups split overlapping concerns: feed/widget config in "Display", the player API and overlays in "Build Your Experience", `carousel` referenced from `content-types` across groups.

### P4 — No changelog/migration/versioning home
- Open PR #20 had to **invent** `migration/v0.3.0-carousel-playback-ids.mdx`, `changelog.mdx`, *and* `guides/feed-customization.mdx` — none exist in `docs.json`, so all three would be orphaned pages. The pipeline has nowhere sanctioned to put release-coupled content.
- Hardcoded SDK versions (`0.2.22`, web `0.3.0`) appear in 12 spots across `quickstart.mdx`, `installation.mdx`, `configuration.mdx` — manual bumps every release (confirmed as a known gotcha in the monorepo CLAUDE.md). Web SDK is on a different version line than native, embedded in raw code samples.

### P5 — Quickstart/installation duplication and hygiene drift
- Quickstart step 1 fully re-documents installation per platform (already on `installation.mdx`).
- `feed.mdx` is missing required `description` frontmatter; `upload-pipeline.mdx` leaks an internal admission ("known API quirk we plan to reconcile") that borders on guideline violations. Large multi-platform pages are where review quality decays.

## 2. Hard constraints for any new IA

- **The automated PR pipeline is the primary author.** `doc_guidelines.md` encodes the current two-tab nav verbatim; any restructure must update it in lockstep and give agents deterministic placement rules (one canonical page per API surface; explicit edit-vs-create criteria).
- **One canonical reference location** for `ShortKitPlayer`, `FeedConfig`/`FeedFilter`, and content models — guides link, never duplicate.
- **A sanctioned changelog + migration home** in `docs.json`, so PRs like #20 stop inventing structure.
- **Per-platform divergence without full-matrix duplication**: standardized tab labels, a parity/"availability" convention replacing scattered "Coming soon" stubs, and a snippets mechanism for version numbers (single edit per release).
- **No vendor names / internal details** (existing rule, unchanged); public surface only — no Portal tab.
- **Don't disturb the API Reference tab** — per-endpoint pages scale fine; keep `api:` frontmatter conventions.
- **Stable URLs or redirects** in `docs.json` for any moved page (docs are live and cross-linked from PRs).

## 3. Verdict on the old plan (`OLD-2026-03-01-docs-restructure-design.md`)

**Still good, reuse:**
- **Changelog tab** with Mintlify `<Update>` + product-area tags — directly fixes P4; PR #20 proves demand.
- **Task-based guide grouping** (Upload / Display / Track Engagement / Monetize / Secure) — better boundaries than today's "Display" vs "Build Your Experience" overlap.
- **"Platforms & SDKs" section separating Installation/Configuration/SDK Reference from conceptual guides** — the `sdk/reference.mdx` idea is the right home for the duplicated player/config tables (P2), though it needs expansion into per-surface reference pages, not one stub.

**Drop or revise:**
- **Portal tab** — out of scope for public docs per current guidelines.
- **Mux-style consolidated single-page-per-resource API reference** — the current per-endpoint split already scales fine; consolidation would regress it.
- All file-move/delete lists — stale; they reference pages (`webhooks`, `ranking`, `experiments`, `export`, `sdk/ios.mdx`) that no longer exist. The plan predates the current two-tab IA.
- **Missing from the old plan entirely:** a `migration/` home (it only had changelog), a platform-parity convention, and a version-number snippet strategy — all must be added.
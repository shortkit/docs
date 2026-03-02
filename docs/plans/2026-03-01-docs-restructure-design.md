# Docs Restructure Design

Date: 2026-03-01

## Context

The current docs use 5 tabs (Overview, SDK, Guides, Portal, API) with guides organized by system component rather than developer task. After reviewing Mux, fal.ai, Resend, Dub, Cursor, Loops, and Cal.com, we're restructuring to a Mux-style flat sidebar with task-based organization.

## Top Navigation (4 tabs)

| Tab | Icon | Purpose |
|-----|------|---------|
| Docs | `book-open` | Main sidebar: overview, developer guides, SDK docs |
| API Reference | `square-terminal` | REST API endpoint reference |
| Portal | `gauge` | Dashboard/admin portal docs (unchanged) |
| Changelog | `clock-rotate-left` | Product updates, reverse-chron |

## Docs Sidebar

```
OVERVIEW
├── Quickstart
└── Core Concepts

DEVELOPER GUIDES
├── Upload Content
│   ├── Content Pipeline
│   ├── Transcoding
│   └── Bulk Operations
├── Display a Feed
│   ├── Feed Configuration
│   ├── Ranking & Personalization
│   ├── CDN Delivery
│   └── Deep Linking
├── Playback Features
│   ├── Captions
│   └── Scrubber & Storyboard Timelines
├── Track Engagement
│   ├── Engagement Signals
│   ├── Analytics & Metrics
│   └── Data Export
├── Monetize
│   ├── Ad Integration
│   ├── Ad Configuration
│   └── Experiments & A/B Testing
└── Secure & Integrate
    ├── Identity Management
    ├── Playback Security
    └── Authentication

PLATFORMS & SDKs
├── Installation
├── Configuration
└── SDK Reference
```

## API Reference Tab

Mux-style: each resource category is a single page with a summary table at the top and endpoints documented as sections within the page.

```
├── Overview           (base URL, versioning, rate limits, envelope format)
├── Authentication     (API keys, environments)
├── Errors             (error codes and handling)
├── Content            (uploads, content CRUD, bulk ops — as sections)
├── Feed               (feed retrieval, configuration — as sections)
├── Analytics          (events, analytics, export — as sections)
└── Configuration      (ranking, ad config, experiments — as sections)
```

## Portal Tab

Unchanged from current structure:

```
├── Overview
├── Content Management
├── Feed Configuration
├── A/B Testing
├── Analytics
├── Ad Management
└── Settings
```

## Changelog Tab

Single page. Reverse-chronological. Monthly groups. Product-area tags.

Tags: `SDK`, `API`, `Portal`, `Platform`

Uses Mintlify's `<Update>` component:

```mdx
<Update label="February 2026" tags={["SDK", "API"]}>
  ## Feature title
  **SDK** — Description...

  ## Another feature
  **API** — Description...
</Update>
```

Will include 3-4 plausible filler entries spanning Feb-March 2026 so the page isn't empty.

## Pages to Delete

- `index.mdx` (Introduction landing page — redundant)
- `architecture.mdx` (overlaps with Core Concepts)
- `api/webhooks.mdx` (no webhook support currently)
- `guides/integration/webhooks.mdx` (same)
- `sdk/overview.mdx` (redundant with Installation)
- `sdk/ios.mdx` (folded into Installation/Configuration with platform tabs)
- `sdk/android.mdx` (same)
- `sdk/react-native.mdx` (same)
- `sdk/theming.mdx` (removed)

## New Pages to Create (stubs)

- `changelog.mdx` — changelog with filler entries
- `guides/playback/captions.mdx` — captions guide
- `guides/playback/storyboard-timelines.mdx` — scrubber/storyboard timelines guide
- `sdk/reference.mdx` — SDK public API (commands, publishers)

## Pages to Consolidate

API endpoint pages that need to be merged into single resource pages:
- `api/uploads.mdx` + `api/content.mdx` + `api/bulk-operations.mdx` → `api/content.mdx`
- `api/feed.mdx` + `api/configuration.mdx` → `api/feed.mdx`
- `api/events.mdx` + `api/analytics.mdx` + `api/export.mdx` → `api/analytics.mdx`
- `api/ranking.mdx` + `api/ad-config.mdx` + `api/experiments.mdx` → `api/configuration.mdx`

## File Moves

- `sdk/deep-linking.mdx` → `guides/feed/deep-linking.mdx`
- `sdk/engagement-signals.mdx` → `guides/engagement/engagement-signals.mdx`
- `guides/platform/content-pipeline.mdx` → `guides/upload/content-pipeline.mdx`
- `guides/platform/transcoding.mdx` → `guides/upload/transcoding.mdx`
- `guides/platform/cdn-delivery.mdx` → `guides/feed/cdn-delivery.mdx`
- `guides/platform/feed-ranking.mdx` → `guides/feed/feed-configuration.mdx`
- `guides/integration/ad-integration.mdx` → `guides/monetize/ad-integration.mdx`
- `guides/integration/data-export.mdx` → `guides/engagement/data-export.mdx`
- `guides/integration/identity-management.mdx` → `guides/security/identity-management.mdx`
- `guides/integration/playback-security.mdx` → `guides/security/playback-security.mdx`
- `api/authentication.mdx` → stays but also linked from `guides/security/authentication.mdx`

## Implementation Order

1. Restructure `docs.json` to new 4-tab layout
2. Create new directory structure (`guides/upload/`, `guides/feed/`, etc.)
3. Move/rename files to match new paths
4. Create stub pages for new content
5. Consolidate API endpoint pages into single resource pages
6. Delete removed pages
7. Create changelog with filler entries
8. Verify all nav links resolve correctly
9. Content updates (separate pass)

# Docs Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure ShortKit docs from 5-tab layout to 4-tab Mux-style organization (Docs, API Reference, Portal, Changelog) with task-based developer guides.

**Architecture:** Flat sidebar with collapsible groups under the Docs tab. API Reference as a separate tab with consolidated resource pages (one page per resource category, endpoints as sections). Portal unchanged. New Changelog tab with `<Update>` components.

**Tech Stack:** Mintlify, MDX, docs.json

---

### Task 1: Create New Directory Structure

**Files:**
- Create directories: `guides/upload/`, `guides/feed/`, `guides/playback/`, `guides/engagement/`, `guides/monetize/`, `guides/security/`

**Step 1: Create all new directories**

```bash
cd /Users/michaelseleman/shortkit-docs-repo
mkdir -p guides/upload guides/feed guides/playback guides/engagement guides/monetize guides/security
```

**Step 2: Verify directories exist**

```bash
ls -d guides/*/
```

Expected: all 8 directories listed (upload, feed, playback, engagement, monetize, security, plus existing platform, integration)

**Step 3: Commit**

```bash
git add guides/
git commit -m "chore: create new guide directory structure for docs restructure"
```

---

### Task 2: Move Guide Files to New Locations

**Files:**
- Move: `guides/platform/content-pipeline.mdx` → `guides/upload/content-pipeline.mdx`
- Move: `guides/platform/transcoding.mdx` → `guides/upload/transcoding.mdx`
- Move: `guides/platform/cdn-delivery.mdx` → `guides/feed/cdn-delivery.mdx`
- Move: `guides/platform/feed-ranking.mdx` → `guides/feed/feed-configuration.mdx`
- Move: `guides/integration/ad-integration.mdx` → `guides/monetize/ad-integration.mdx`
- Move: `guides/integration/data-export.mdx` → `guides/engagement/data-export.mdx`
- Move: `guides/integration/identity-management.mdx` → `guides/security/identity-management.mdx`
- Move: `guides/integration/playback-security.mdx` → `guides/security/playback-security.mdx`
- Move: `sdk/deep-linking.mdx` → `guides/feed/deep-linking.mdx`
- Move: `sdk/engagement-signals.mdx` → `guides/engagement/engagement-signals.mdx`

**Step 1: Move platform guide files**

```bash
cd /Users/michaelseleman/shortkit-docs-repo
git mv guides/platform/content-pipeline.mdx guides/upload/content-pipeline.mdx
git mv guides/platform/transcoding.mdx guides/upload/transcoding.mdx
git mv guides/platform/cdn-delivery.mdx guides/feed/cdn-delivery.mdx
git mv guides/platform/feed-ranking.mdx guides/feed/feed-configuration.mdx
```

**Step 2: Move integration guide files**

```bash
git mv guides/integration/ad-integration.mdx guides/monetize/ad-integration.mdx
git mv guides/integration/data-export.mdx guides/engagement/data-export.mdx
git mv guides/integration/identity-management.mdx guides/security/identity-management.mdx
git mv guides/integration/playback-security.mdx guides/security/playback-security.mdx
```

**Step 3: Move SDK files that belong in guides**

```bash
git mv sdk/deep-linking.mdx guides/feed/deep-linking.mdx
git mv sdk/engagement-signals.mdx guides/engagement/engagement-signals.mdx
```

**Step 4: Verify all files moved**

```bash
ls guides/upload/ guides/feed/ guides/engagement/ guides/monetize/ guides/security/
```

Expected:
- `guides/upload/`: content-pipeline.mdx, transcoding.mdx
- `guides/feed/`: cdn-delivery.mdx, feed-configuration.mdx, deep-linking.mdx
- `guides/engagement/`: engagement-signals.mdx, data-export.mdx
- `guides/monetize/`: ad-integration.mdx
- `guides/security/`: identity-management.mdx, playback-security.mdx

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: move guide files to task-based directory structure"
```

---

### Task 3: Consolidate API Resource Pages

Each API resource category becomes a single page. Merge the existing separate endpoint pages into consolidated pages with a summary table at the top and endpoint sections below.

**Files:**
- Merge into: `api/content.mdx` (absorbs `api/uploads.mdx` + `api/bulk-operations.mdx`)
- Merge into: `api/feed.mdx` (absorbs `api/configuration.mdx`)
- Merge into: `api/analytics.mdx` (absorbs `api/events.mdx` + `api/export.mdx`)
- Merge into: `api/configuration.mdx` → rename to `api/settings.mdx` (absorbs `api/ranking.mdx` + `api/ad-config.mdx` + `api/experiments.mdx`)

**Note:** Since `api/configuration.mdx` currently exists as the feed config page and will conflict with the new "Configuration" resource page (ranking + ad-config + experiments), rename the new consolidated config page to `api/settings.mdx` to avoid collision. Alternatively, the feed configuration content can be merged into `api/feed.mdx` first, freeing up `api/configuration.mdx` for the settings consolidation.

**Step 1: Read all source files fully**

Read the complete contents of every API file that will be merged:
- `api/uploads.mdx`
- `api/content.mdx`
- `api/bulk-operations.mdx`
- `api/feed.mdx`
- `api/configuration.mdx`
- `api/events.mdx`
- `api/analytics.mdx`
- `api/export.mdx`
- `api/ranking.mdx`
- `api/ad-config.mdx`
- `api/experiments.mdx`

**Step 2: Create consolidated `api/content.mdx`**

New structure:
```mdx
---
title: "Content"
description: "Upload, manage, and bulk-operate on video content."
---

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/uploads` | Create upload session |
| `PUT` | `{uploadUrl}` | Upload file to signed URL |
| `GET` | `/v1/content` | List all content |
| `GET` | `/v1/content/{id}` | Get content by ID |
| `PATCH` | `/v1/content/{id}` | Update content |
| `DELETE` | `/v1/content/{id}` | Delete content |
| `POST` | `/v1/content/bulk/update` | Bulk update |
| `POST` | `/v1/content/bulk/archive` | Bulk archive |
| `POST` | `/v1/content/bulk/tag` | Bulk tag |

## Uploads
[content from api/uploads.mdx, minus frontmatter]

## Content Management
[content from api/content.mdx body, minus frontmatter]

## Bulk Operations
[content from api/bulk-operations.mdx, minus frontmatter]
```

**Step 3: Create consolidated `api/feed.mdx`**

Merge current `api/feed.mdx` + `api/configuration.mdx` into one page with summary table.

**Step 4: Create consolidated `api/analytics.mdx`**

Merge current `api/events.mdx` + `api/analytics.mdx` + `api/export.mdx` into one page with summary table.

**Step 5: Create consolidated `api/configuration.mdx`**

Merge current `api/ranking.mdx` + `api/ad-config.mdx` + `api/experiments.mdx` into one page with summary table. (The old `api/configuration.mdx` content is now in `api/feed.mdx`.)

**Step 6: Verify all consolidated files have correct frontmatter and structure**

Each file should have:
- Frontmatter with title, description, keywords
- Summary endpoint table immediately after frontmatter
- H2 sections for each sub-topic

**Step 7: Commit**

```bash
git add api/
git commit -m "refactor: consolidate API pages into single resource pages with summary tables"
```

---

### Task 4: Create Stub Pages for New Content

**Files:**
- Create: `guides/playback/captions.mdx`
- Create: `guides/playback/storyboard-timelines.mdx`
- Create: `sdk/reference.mdx`
- Create: `guides/monetize/ad-configuration.mdx`
- Create: `guides/monetize/experiments.mdx`
- Create: `guides/engagement/analytics.mdx`
- Create: `guides/security/authentication.mdx`

**Step 1: Create playback feature stubs**

`guides/playback/captions.mdx`:
```mdx
---
title: "Captions"
description: "Configure and manage captions for your video content."
keywords: ["captions", "subtitles", "accessibility"]
---

{/* TODO: Content to be written */}
```

`guides/playback/storyboard-timelines.mdx`:
```mdx
---
title: "Scrubber & Storyboard Timelines"
description: "Configure thumbnail storyboards for video scrubber timelines."
keywords: ["storyboard", "scrubber", "timeline", "thumbnails", "preview"]
---

{/* TODO: Content to be written */}
```

**Step 2: Create SDK reference stub**

`sdk/reference.mdx`:
```mdx
---
title: "SDK Reference"
description: "Complete reference for ShortKit SDK commands and publishers."
keywords: ["SDK", "API", "commands", "publishers", "reference"]
---

{/* TODO: Document SDK public API — commands and publishers */}
```

**Step 3: Create guide stubs for content that currently only exists as API reference**

These pages provide guide-level context for topics that currently only have API endpoint docs:

`guides/monetize/ad-configuration.mdx`:
```mdx
---
title: "Ad Configuration"
description: "Configure ad placements, frequency, and targeting for your video feeds."
keywords: ["ads", "monetization", "configuration"]
---

{/* TODO: Content to be written */}
```

`guides/monetize/experiments.mdx`:
```mdx
---
title: "Experiments & A/B Testing"
description: "Run experiments to optimize feed performance, ad placements, and user engagement."
keywords: ["experiments", "A/B testing", "optimization"]
---

{/* TODO: Content to be written */}
```

`guides/engagement/analytics.mdx`:
```mdx
---
title: "Analytics & Metrics"
description: "Understand engagement metrics, dashboards, and reporting."
keywords: ["analytics", "metrics", "engagement", "reporting"]
---

{/* TODO: Content to be written */}
```

`guides/security/authentication.mdx`:
```mdx
---
title: "Authentication"
description: "Authenticate API requests with publishable and secret keys."
keywords: ["authentication", "API keys", "security"]
---

{/* TODO: Content to be written */}
```

`guides/feed/ranking.mdx`:
```mdx
---
title: "Ranking & Personalization"
description: "Configure feed ranking algorithms and personalization strategies."
keywords: ["ranking", "personalization", "feed", "algorithm"]
---

{/* TODO: Content to be written */}
```

**Step 4: Verify all stubs exist**

```bash
find guides/ sdk/ -name "*.mdx" -newer guides/upload/content-pipeline.mdx
```

**Step 5: Commit**

```bash
git add guides/playback/ guides/monetize/ guides/engagement/ guides/security/ guides/feed/ranking.mdx sdk/reference.mdx
git commit -m "chore: create stub pages for new doc sections"
```

---

### Task 5: Create Changelog Page

**Files:**
- Create: `changelog.mdx`

**Step 1: Create changelog with plausible filler entries**

Create `changelog.mdx` with 3-4 entries spanning mid-Feb to early March 2026. Content should be plausible based on features documented in the existing docs (feed ranking, engagement signals, ad integration, SDK platforms, analytics, etc.).

```mdx
---
title: "Changelog"
description: "Product updates and improvements to the ShortKit platform."
keywords: ["changelog", "updates", "releases"]
---

<Update label="March 2026" tags={["Platform", "API"]}>
  ## Personalized feed ranking

  **Platform** — Feed ranking now supports per-user personalization based on engagement history. The ranking algorithm considers watch-through rate, replay signals, and content affinity scores to deliver more relevant feeds.

  See [Ranking & Personalization](/guides/feed/ranking) for configuration details.

  ## Content status webhooks deprecation

  **API** — Webhook endpoints have been removed from the API in favor of polling-based status checks. Use `GET /v1/content/{id}` to check processing status.
</Update>

<Update label="February 2026" tags={["SDK", "Portal", "API"]}>
  ## SDK 1.2.0 — Adaptive bitrate improvements

  **SDK** — Reduced video startup latency by 40% on cellular connections through improved adaptive bitrate selection. The SDK now starts playback at a lower quality and ramps up faster based on measured throughput.

  ## Ad integration support

  **API** — New ad configuration endpoints allow you to define ad placements, frequency caps, and targeting rules. Configure pre-roll, mid-roll, and post-roll ad slots per feed.

  See [Ad Configuration](/guides/monetize/ad-configuration) for setup details.

  ## Portal analytics dashboard

  **Portal** — The analytics dashboard now shows engagement metrics in real time, including watch-through rate, average view duration, and content completion rate. Filter by date range, content tags, and user segments.

  ## Bulk operations API

  **API** — New bulk endpoints for updating, archiving, and tagging multiple content items in a single request. Supports up to 100 items per batch.
</Update>
```

**Step 2: Verify the file renders valid MDX**

Check that all `<Update>` tags are properly closed and tags arrays are valid JSON.

**Step 3: Commit**

```bash
git add changelog.mdx
git commit -m "feat: add changelog page with initial entries"
```

---

### Task 6: Update docs.json to New 4-Tab Structure

**Files:**
- Modify: `docs.json`

**Step 1: Read the current docs.json**

Read `docs.json` in full to have the complete current structure.

**Step 2: Rewrite the navigation section**

Replace the entire `navigation` object in `docs.json` with the new 4-tab structure:

```json
{
  "navigation": {
    "tabs": [
      {
        "tab": "Docs",
        "icon": "book-open",
        "groups": [
          {
            "group": "Overview",
            "pages": [
              "quickstart",
              "core-concepts"
            ]
          },
          {
            "group": "Upload Content",
            "pages": [
              "guides/upload/content-pipeline",
              "guides/upload/transcoding",
              "api/bulk-operations"
            ]
          },
          {
            "group": "Display a Feed",
            "pages": [
              "guides/feed/feed-configuration",
              "guides/feed/ranking",
              "guides/feed/cdn-delivery",
              "guides/feed/deep-linking"
            ]
          },
          {
            "group": "Playback Features",
            "pages": [
              "guides/playback/captions",
              "guides/playback/storyboard-timelines"
            ]
          },
          {
            "group": "Track Engagement",
            "pages": [
              "guides/engagement/engagement-signals",
              "guides/engagement/analytics",
              "guides/engagement/data-export"
            ]
          },
          {
            "group": "Monetize",
            "pages": [
              "guides/monetize/ad-integration",
              "guides/monetize/ad-configuration",
              "guides/monetize/experiments"
            ]
          },
          {
            "group": "Secure & Integrate",
            "pages": [
              "guides/security/identity-management",
              "guides/security/playback-security",
              "guides/security/authentication"
            ]
          },
          {
            "group": "Platforms & SDKs",
            "pages": [
              "sdk/installation",
              "sdk/configuration",
              "sdk/reference"
            ]
          }
        ]
      },
      {
        "tab": "API Reference",
        "icon": "square-terminal",
        "groups": [
          {
            "group": "Overview",
            "pages": [
              "api/introduction",
              "api/authentication",
              "api/errors"
            ]
          },
          {
            "group": "Endpoints",
            "pages": [
              "api/content",
              "api/feed",
              "api/analytics",
              "api/configuration"
            ]
          }
        ]
      },
      {
        "tab": "Portal",
        "icon": "gauge",
        "groups": [
          {
            "group": "Getting Started",
            "pages": [
              "portal/overview"
            ]
          },
          {
            "group": "Content",
            "pages": [
              "portal/content-management"
            ]
          },
          {
            "group": "Feed",
            "pages": [
              "portal/feed-configuration",
              "portal/ab-testing"
            ]
          },
          {
            "group": "Analytics",
            "pages": [
              "portal/analytics"
            ]
          },
          {
            "group": "Monetization",
            "pages": [
              "portal/ad-management"
            ]
          },
          {
            "group": "Settings",
            "pages": [
              "portal/settings"
            ]
          }
        ]
      },
      {
        "tab": "Changelog",
        "icon": "clock-rotate-left",
        "groups": [
          {
            "group": "",
            "pages": [
              "changelog"
            ]
          }
        ]
      }
    ],
    "global": {
      "anchors": []
    }
  }
}
```

**Important:** Only replace the `navigation` key. Do not touch `theme`, `colors`, `fonts`, `logo`, `navbar`, `footer`, `styling`, or any other config.

**Step 3: Verify JSON is valid**

```bash
cd /Users/michaelseleman/shortkit-docs-repo
python3 -c "import json; json.load(open('docs.json')); print('Valid JSON')"
```

Expected: `Valid JSON`

**Step 4: Commit**

```bash
git add docs.json
git commit -m "refactor: restructure navigation to 4-tab Mux-style layout"
```

---

### Task 7: Delete Removed Files

**Files:**
- Delete: `index.mdx`
- Delete: `architecture.mdx`
- Delete: `api/webhooks.mdx`
- Delete: `guides/integration/webhooks.mdx`
- Delete: `sdk/overview.mdx`
- Delete: `sdk/ios.mdx`
- Delete: `sdk/android.mdx`
- Delete: `sdk/react-native.mdx`
- Delete: `sdk/theming.mdx`
- Delete: `sdk/web.mdx` (exists on disk but was never in navigation)
- Delete: `api/uploads.mdx` (merged into api/content.mdx)
- Delete: `api/bulk-operations.mdx` (merged into api/content.mdx)
- Delete: `api/events.mdx` (merged into api/analytics.mdx)
- Delete: `api/export.mdx` (merged into api/analytics.mdx)
- Delete: `api/ranking.mdx` (merged into api/configuration.mdx)
- Delete: `api/ad-config.mdx` (merged into api/configuration.mdx)
- Delete: `api/experiments.mdx` (merged into api/configuration.mdx)
- Delete empty directories: `guides/platform/`, `guides/integration/`

**Step 1: Delete removed page files**

```bash
cd /Users/michaelseleman/shortkit-docs-repo
git rm index.mdx architecture.mdx
git rm api/webhooks.mdx api/uploads.mdx api/bulk-operations.mdx api/events.mdx api/export.mdx api/ranking.mdx api/ad-config.mdx api/experiments.mdx
git rm guides/integration/webhooks.mdx
git rm sdk/overview.mdx sdk/ios.mdx sdk/android.mdx sdk/react-native.mdx sdk/theming.mdx sdk/web.mdx
```

**Step 2: Remove empty old directories**

```bash
rmdir guides/platform guides/integration 2>/dev/null || true
```

These should be empty after the moves in Task 2. If not empty, check what's left and investigate.

**Step 3: Verify no orphaned files**

```bash
find . -name "*.mdx" | sort
```

Cross-reference output against docs.json navigation — every .mdx file should be referenced.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete removed and merged pages, clean up old directories"
```

---

### Task 8: Verify Everything Renders

**Step 1: Check for broken internal links**

```bash
cd /Users/michaelseleman/shortkit-docs-repo
grep -r "href=\"/" --include="*.mdx" | grep -v node_modules
```

Review each internal link (`href="/api/uploads"`, `href="/sdk/ios"`, etc.) and update any that point to deleted or moved pages.

**Step 2: Update stale internal links in all files**

Common links that need updating (search and replace across all .mdx files):

| Old link | New link |
|----------|----------|
| `/api/uploads` | `/api/content#uploads` |
| `/api/bulk-operations` | `/api/content#bulk-operations` |
| `/api/events` | `/api/analytics#events` |
| `/api/export` | `/api/analytics#export` |
| `/api/ranking` | `/api/configuration#ranking` |
| `/api/ad-config` | `/api/configuration#ad-configuration` |
| `/api/experiments` | `/api/configuration#experiments` |
| `/api/webhooks` | remove link or replace with note |
| `/sdk/overview` | `/sdk/installation` |
| `/sdk/ios` | `/sdk/installation` |
| `/sdk/android` | `/sdk/installation` |
| `/sdk/react-native` | `/sdk/installation` |
| `/sdk/theming` | `/sdk/configuration` |
| `/sdk/deep-linking` | `/guides/feed/deep-linking` |
| `/sdk/engagement-signals` | `/guides/engagement/engagement-signals` |
| `/guides/platform/content-pipeline` | `/guides/upload/content-pipeline` |
| `/guides/platform/transcoding` | `/guides/upload/transcoding` |
| `/guides/platform/cdn-delivery` | `/guides/feed/cdn-delivery` |
| `/guides/platform/feed-ranking` | `/guides/feed/feed-configuration` |
| `/guides/integration/ad-integration` | `/guides/monetize/ad-integration` |
| `/guides/integration/data-export` | `/guides/engagement/data-export` |
| `/guides/integration/identity-management` | `/guides/security/identity-management` |
| `/guides/integration/playback-security` | `/guides/security/playback-security` |
| `/guides/integration/webhooks` | remove link or replace with note |

**Step 3: Commit link fixes**

```bash
git add -A
git commit -m "fix: update internal links to match new page locations"
```

**Step 4: Run Mintlify dev server and verify**

```bash
npx mintlify dev
```

Check:
- All 4 tabs render in top nav
- Docs sidebar shows correct groups and pages
- API Reference tab shows consolidated pages
- Portal tab unchanged
- Changelog tab shows entries with tags
- No 404s when clicking through navigation

**Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve remaining rendering issues from restructure"
```

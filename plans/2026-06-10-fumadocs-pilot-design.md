# Fumadocs Pilot — Design

Date: 2026-06-10
Status: Approved (user, in-session)
Context: Follows the approved v2 docs IA (`plans/restructure-workflow-results/finalIA-v2.json`, mocked in `plans/docs-restructure-mockup.html`). This pilot evaluates migrating the ShortKit developer docs from Mintlify to Fumadocs before committing the full restructure to either platform.

## Goal

A reviewable Fumadocs site implementing the v2 IA skeleton with a representative slice of real content, styled after https://docs.limrun.com/docs, preserving the two Mintlify features the user wants kept:

1. HTTP method badges on API endpoint items in the sidebar
2. Two-column API pages with request/response code panels (cURL/Python/Node)

Both are provided natively by `fumadocs-openapi` (confirmed: limrun uses it).

## Decisions (user-approved)

- **API reference is OpenAPI-generated**, not hand-authored. Source of truth: the FastAPI app's schema, filtered to public endpoints, scrubbed per `doc_guidelines.md` (no vendor names, no internal fields). Prose enrichment happens via an overlay in the docs repo, not in API source code.
- **Pilot scope first** — full nav skeleton + ~8 written pages; full content execution only after user approves the pilot.
- **Approach A**: stock `fumadocs-ui` scaffold + `fumadocs-openapi`, themed. No headless/custom UI build.

## Architecture

```
local-fable-docs/            (existing Mintlify repo, branch MSeleman/local-fable-docs)
└── fumadocs/                (new — self-contained Next.js app, deletable)
    ├── app/                 (App Router: docs layout, API ref layout, changelog)
    ├── content/
    │   ├── docs/            (v2 Docs tab pages; meta.json per group)
    │   ├── api/             (generated endpoint MDX + overview pages)
    │   └── changelog/
    ├── openapi/
    │   ├── openapi.public.json   (committed scrubbed snapshot)
    │   └── overlay.json          (docs-owned description enrichment)
    ├── scripts/
    │   └── build-openapi.mjs     (filter + scrub + overlay merge)
    ├── source.config.ts
    └── package.json
```

- **Nav**: three sidebar tabs — Docs, API Reference, Changelog — mirroring the v2 IA. Every v2 page exists; unwritten pages are one-line stubs marked *pilot stub*.
- **Styling**: Geist Sans/Mono, neutral monochrome chrome (limrun = mostly stock fd tokens), 280px sidebar, 768px content. One deviation: ShortKit `#FF6600` as primary accent. Light + dark.
- **Language tabs**: `<Tabs groupId="platform" persist>` with standardized labels (iOS / Android / Flutter / React Native / Web) — platform choice persists across pages. Empty-tab rule applies: a tab shows real shipped API or an explicit "Not yet supported" note.

## OpenAPI pipeline

1. Dump schema from the monorepo FastAPI app (`api/`, via `.venv`): `app.openapi()` → `openapi.full.json` (not committed).
2. `build-openapi.mjs` filters to public pk/sk endpoints (allowlist by route+auth), strips internal fields, scrubs vendor terminology, merges `overlay.json` descriptions → `openapi.public.json` (committed).
3. `fumadocs-openapi` generates MDX per endpoint at build time.

Pilot wires three endpoints: `POST /v1/content/upload`, `GET /v1/content/{id}`, `POST /v1/live-streams`.

## Fully-written pilot pages (8)

| Page | Exercises |
|---|---|
| `concepts/content-model` | platform-neutral canonical reference (new single source of truth) |
| `content/upload-videos` | REST task guide, links-not-duplicates pattern |
| `display/feed` | the language-tab model with persisted groupId |
| `reference/player` | canonical SDK reference, per-tab native units, phantom APIs removed |
| `setup/ios` | short per-SDK setup page |
| `changelog` | seeded with recent releases, `<Update>`-equivalent |
| 3 API endpoint pages | generated; badges + code panels |

Content is sourced from existing Mintlify pages corrected by the survey findings (`plans/restructure-workflow-results/`): no phantom APIs, current versions, guideline-compliant tone.

## Validation & decision gate

- `next build` passes; Fumadocs link validation clean; dev server reviewed by user.
- **Approve** → full v2 content execution on Fumadocs (separate plan).
- **Reject** → keep Mintlify; v2 restructure executes there. Pilot directory is deleted; only cost is the experiment.

## Error handling / risks

- FastAPI schema may have sparse/internal descriptions → overlay file owns public prose; scrub script fails closed (endpoint excluded unless allowlisted).
- `create-fumadocs-app` interactivity in CI/agent context → fall back to manual scaffold with pinned versions.
- Search: built-in Orama (no external service). AI-assistant features are out of pilot scope.

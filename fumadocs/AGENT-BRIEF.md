# ShortKit Fumadocs — page-author brief

You are writing ONE page of the ShortKit developer docs (Fumadocs/Next.js site at `fumadocs/` in this repo). Overwrite the existing stub file completely (remove the "Pilot stub" callout).

## Voice & content rules (from doc_guidelines.md — binding)

- Stripe-style: concise, direct, technical, no fluff. Second person, active voice, one idea per sentence. Sentence case headings.
- NEVER mention third-party vendor names: Mux, LiveKit, OCI, GCP, Google Cloud, Cloud Run, Pub/Sub, Alembic. Use ShortKit-proxied terms ("streaming URL", "media storage", "real-time infrastructure").
- No internal implementation details, staging URLs, queue names, or fields being phased out (`muxTrackId` → `trackId`).
- API keys in examples: `sk_live_your_secret_key` / `pk_live_your_publishable_key`. Realistic values, never foo/bar.
- Current SDK versions: iOS/Android/React Native **0.2.55**, Flutter (pub.dev) **0.2.22**, Web **0.5.0**. Never write 0.2.22 for iOS/Android/RN.

## Fumadocs MDX syntax (NOT Mintlify — their components don't exist here)

- Frontmatter: `title: "..."` and `description: "..."` (JSON-quoted strings).
- Callouts: `<Callout type="info" title="...">...</Callout>` — types: `info`, `warn`, `error`. There is NO `<Note>`, `<Warning>`, `<Tip>`, `<ParamField>`, `<ResponseField>`, `<AccordionGroup>`, `<RequestExample>`, `<CodeGroup>`.
- Use markdown tables for field/parameter references.
- Tabs: `<Tabs groupId="platform" persist items={['iOS','Android','Flutter','React Native','Web']}>` with `<Tab value="iOS">...</Tab>`. Platform labels EXACTLY: iOS, Android, Flutter, React Native, Web. For REST language tabs: `groupId="lang"` with items `['cURL','Python','Node.js']`.
- Accordions: `<Accordions type="single"><Accordion title="...">...</Accordion></Accordions>` (registered globally).
- Cards: `<Cards><Card title="..." href="..." description="..." /></Cards>`.
- Inline angle-bracket tokens in prose MUST be wrapped in backticks (`` `<ShortKitFeed>` ``, `` `AnyPublisher<PlayerTime, Never>` ``) or MDX parsing breaks.
- Code blocks: ` ```swift title="FeedScreen.swift" `.

## Multi-platform rules

- General prose between tab blocks is PLATFORM-AGNOSTIC. Platform-specific names/APIs/architecture live ONLY inside that platform's tab.
- EMPTY-TAB RULE: every platform tab contains either real shipped API or exactly: a one-line `Not yet supported on {platform}.` note (optionally with a link to /docs/guides/setup/platform-support). NEVER invent or analogize an API for a platform.
- Where genuinely platform-exclusive (e.g. live viewing = iOS + Web only), say so in a `<Callout>` once, then tab only the supported platforms.

## Link conventions

- Docs pages: `/docs/guides/<group>/<page>` (e.g. `/docs/guides/concepts/content-model`, `/docs/guides/display/feed`, `/docs/guides/reference/player`).
- API pages: `/docs/api/...` — overview pages: `/docs/api`, `/docs/api/authentication`, `/docs/api/errors`, `/docs/api/webhooks`. Endpoint pages: `/docs/api/content/upload-content`, `/docs/api/content/get-content`, `/docs/api/live-streams/create-live-stream` (more generated during this execution — link group folders if unsure: `/docs/api/content/<kebab-summary>`).
- Changelog: `/docs/changelog`, `/docs/changelog/migrations/v0-3-0-carousel-playback-ids`.
- LINK, DON'T DUPLICATE: canonical homes are concepts/content-model (types), reference/player (player API), reference/feed-config (FeedConfig/FeedFilter), concepts/identity (identity). If your page touches those topics, summarize in ≤2 sentences and link.

## Accuracy sources (corrections are MANDATORY)

- Survey gap reports: `plans/restructure-workflow-results/gaps-{api,ios,android,rn,flutter,web}.md` and `gapsDigest.md` (repo root = docs repo). Anything flagged PHANTOM must not appear; anything flagged missing/shipped should be included if it belongs on your page.
- SDK source of truth (monorepo): `/Users/michaelseleman/orca/workspaces/shortkit/fabledocs/{swift_sdk,android_sdk,react_native_sdk,flutter_sdk,web_sdk,api}`. When the old Mintlify page and the gap report disagree, verify against source.
- Old Mintlify pages (content source material): repo root `sdk/*.mdx`, `guides/*.mdx`, `api/**.mdx`.
- Known correct facts: Android package `com.shortkit.sdk`; Android times in milliseconds (iOS/RN/Web seconds); RN config goes on `<ShortKitFeed>` not the provider; RN overlay prop is `videoOverlay`; FeedFilter metadata is `Map<String, [String]>` with OR semantics within a key; live viewing ships on iOS + Web only; live broadcasting is server-side (RTMP) only.

## Output

Write the file, then return ONE line: the file path and line count. Your final message is consumed by an orchestration script.

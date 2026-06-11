# Documentation Gap Digest — Information Architecture Planning

## 1. Missing API endpoint groups (API Reference tab)

- **Feed (highest impact, zero pages):** `GET /v1/feed`, `/feed/videos`, `/feed/filter`, `/feed/discovery`, `/feed/filter/discovery`. The feed-item shape is only hinted at in notes on `api/content/object.mdx` and `api/ad-config/object.mdx`. **No "Feed" group exists in the nav — no natural home.**
- **Analytics ~80% missing:** only 6 of ~19 metrics documented; missing `GET /metrics/{metric}/breakdown`, `/heatmap`, `POST /metrics/batch`, `GET /v1/views`, `/views/{view_id}`, `/exports/views`, `/events/{types,views,sessions}`, `GET /v1/dimensions/{dimension}/values`, plus the `filters[]` param everywhere. Group needs restructuring into Metrics / Views / Events / Dimensions.
- **Downloads:** `GET /v1/content/{id}/download-url` and `/download` (watermarking, 202 "preparing" flow). Zero docs; lifecycle may warrant its own page.
- **pk "SDK runtime" endpoints scattered or absent:** `POST /v1/events`, `POST /v1/identity/resolve`, `GET /v1/captions`, live `viewer-token`/`publisher-token`/`start` (without these the documented `protocol: "webrtc"` is unusable). **No "Client/SDK Runtime" group exists — no natural home.**
- **Content sub-resources:** captions upload, carousel images, publication URLs, `finalize`, create-shell, import status, `PUT /v1/surveys/priorities` (no nav entry).

## 2. Wrong-at-the-core: init signatures broken on every platform

The single most pervasive defect — top-level setup code won't compile on **four** platforms:
- **iOS:** docs show `ShortKit(apiKey:config:userId:...feedItems:)`; actual init takes no `config:`/`feedItems:` (config goes to `ShortKitFeedViewController`).
- **Android:** same phantom `config`/`feedItems` ctor params; required `context` missing; half the pages import nonexistent `dev.shortkit.*` package.
- **RN:** `ShortKitProvider` has no `config` prop (belongs on `<ShortKitFeed>`); affects 8 pages.
- Related cross-platform error: `FeedFilter.metadata` is now `Map<String, [String]>` with **OR** semantics on iOS/Android/RN/Web/API (Flutter pending 0.3.0); all docs show `Map<String,String>` + AND.

## 3. Phantom APIs to remove

- API: pk-table entries `GET /v1/content{,/{id}}`, `/v1/analytics/*`, `POST /v1/org/rotate-secret-key` (`api/authentication.mdx` — table is materially wrong overall).
- iOS: `FeedOverlay.resetPlaybackProgress()` (also phantom on Android), `feedReady` player publisher, `feedItems:` init param.
- Android: `ShortKitFeedView` Compose/View embed; **entire Kotlin tabs in `sdk/player-and-widget.mdx` are fabricated** (`ShortKitPlayerView`, `ShortKitWidgetView`, etc.).
- RN: `surveyMode`/survey surface, `FeedItem`/`SurveyItem`/`AdSlot` types, `ContentItem.isLive`.
- Flutter: `SurveyMode` on `FeedConfig`, `VTTCue` (actual: `CaptionCue`).
- Web: `player.setItem()`, `widget.setItems()`, `scrollAxis: 'horizontal'` (real APIs: `init()`/`initWithItems()`; widgets self-fetch).

## 4. Stale versions and "coming soon" lies

- Pinned **0.2.22** in `installation.mdx`/`quickstart.mdx` across iOS/Android/RN — current is **0.2.55**. Web CDN snippets pin **0.3.0** — current **0.5.0** (web versions independently and is absent from `VERSIONS.md`/release tooling — flag for docs pipeline).
- "Coming soon" for things that shipped: Flutter `ShortKitPlayer`/`ShortKitWidget` (`player-and-widget.mdx:12`), Flutter carousel overlays (`overlays.mdx:200`), content list filters, client-upload guide; RN widget section has six "Coming soon" stubs for shipped props.
- WebRTC live sections predate the token flow; live-stream lifecycle claim ("cannot be restarted") contradicts backend reactivation.

## 5. Platform parity gaps (shipped, undocumented)

- **Android:** carousel namespace (full parity, zero Kotlin tabs — `sdk/carousel.mdx` is a page-level rework), fragment programmatic API, preload, pull-to-refresh, lifecycle/multi-surface, ads types (`ShortKitAdProvider` et al. — **no ads SDK page exists**).
- **Web:** live-stream viewing (badge, viewer count, `currentProgramDate()`) — `guides/live-streams.mdx` has no Web tab; single-player/widget real APIs; constructor options.
- **Flutter:** custom feeds (`ShortKitFeedController`), feed callbacks, `fetchContent`, storyboard API; plus a **0.3.0-pending merged-but-unpublished surface needing an "unreleased" marker convention** (none exists; only one "since 0.2.36" note repo-wide).
- **RN:** feed ref handle + event props, `ShortKitCommands`, overlay registration. RN's overlay architecture (isolated surfaces, props-in/commands-out) is structurally different from the iOS/Android protocol model — **shared-tab `sdk/overlays.mdx` systematically misdocuments it; RN needs its own overlay section/page**.
- Android has no live support at all — `sdk/feed.mdx` line 8 needs a platform caveat.

## 6. Coherent features with NO home in current nav (build new pages/sections)

1. **iOS live viewer surface** (`LiveOverlay`/`LiveEndedOverlay`/`LiveRoomMask`, live-room expand/collapse, `.liveStream` FeedInput) — fits neither API-centric `guides/live-streams.mdx` nor 53 KB `sdk/overlays.mdx`. Proposed: `sdk/live`.
2. **Downloads** (iOS `downloadVideo`/`ShortKitDownloadDelegate`, RN `ShortKitCommands.downloadVideo`, API download-url) — zero docs on every surface; needs a page.
3. **Custom feeds** — scattered/orphaned on all five platforms (`setFeedItems`/`appendFeedItems`/`applyFilter`/`FeedSource.CUSTOM`/`FeedInput`); one cross-platform "Custom feeds" page resolves five reports at once.
4. **Controlling the feed** (scroll, refresh, filter, lock, deep-link seeding, lifecycle `activate`/`deactivate`) — `sdk/feed.mdx` is embed-only on every platform; grow it into a component reference with an events table.
5. **Multi-surface/lifecycle** (Android `suspendPlayers`/`ShortKitSurface`, RN `active`/`surfaceId`, iOS `ShortKitFeedLifecycle`).
6. **Preload/cold-start, pull-to-refresh, debug/tracing** — smaller homeless clusters; fold into the above.
7. **Web platform page** — distribution model (CDN vs npm slim/full, `hls.js` peer dep), manager pattern, web-only callbacks don't fit the tab-per-platform layout.
8. **Shared "Callbacks/webhooks" page** — retry semantics currently duplicated across `upload.mdx`/`import.mdx` plus clips.

## 7. Conventions needed (IA-level decisions)

- Version-availability annotations ("since X", "unreleased") — no convention exists.
- Platform-availability annotations on shared publisher/command tables (e.g. `feedReady`, `didLoop` absent on Web; `rotationInterval` note wrongly excludes Web).
- Vendor-name hygiene: published pages are clean; when writing new RN/Web content, don't propagate source-comment vendor leaks (streaming vendor, SDWebImage/expo-image).
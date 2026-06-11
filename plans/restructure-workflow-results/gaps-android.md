# Android docs gap analysis — `com.shortkit.sdk` v0.2.55

## 1. UNDOCUMENTED (ranked by integrator impact)

1. **Entire `ShortKit.carousel` namespace** — `sdk/carousel.mdx` has only iOS and React Native tabs. Android has full parity (`activeIndex`/`activeCarouselChanged` StateFlows, `activeVideoCompleted` SharedFlow, `next()`/`previous()`/`setActiveIndex()`, sync accessors) plus the fragment callbacks `onVideoCarouselCellTap`/`onVideoCarouselCellLongPress` (shipped 2026-05, #279/#280). Zero Kotlin coverage.
2. **`ShortKitFeedFragment` programmatic API** — `scrollToItem(id, animated)` (#225), `setFeedItems(items, startAtId?)`, `appendFeedItems()`, `refresh()`, `applyFilter(filter?)`, `setFeedScrollEnabled()`, `activate()`/`deactivate()`, and callbacks `onDismiss`, `onFeedReady`, `onFeedTransition`, `onRemainingContentCountChange`, `seedThumbnail`. None documented anywhere; `setFeedItems`/`appendFeedItems` get one passing mention in `sdk/configuration.mdx`. This is the only real path to custom feeds on Android (see Phantom #2).
3. **`FeedFilter.metadata` array-OR filtering** — type changed to `Map<String, List<String>>` (2026-06-04). Docs still show `Map<String, String>` with "all pairs must match (AND)" semantics in `sdk/configuration.mdx`.
4. **`FeedOverlay.captionTracksResolved(tracks)`** — new lazy caption-resolution hook (#445, 2026-06-08). Absent from `sdk/overlays.mdx`.
5. **`VideoCarouselCellLongPressPayload.x`/`y`** — added #441 (2026-06-08); long-press payload docs (iOS/RN) omit coordinates, Android omits everything.
6. **`ShortKit.preloadFeed(...)` / `FeedPreload` / `FeedConfig.preload`** — entire preload feature undocumented.
7. **`FeedConfig.pullToRefreshEnabled`** and **`ShortKitRefreshState`** (`Idle`/`Pulling(progress)`/`Triggered`/`Refreshing`) + `onRefreshStateChanged` — pull-to-refresh control/observation undocumented.
8. **`ShortKitFeedActivity.launch(...)`** — one-call fullscreen feed, undocumented.
9. **Lifecycle/multi-surface APIs** — `ShortKit.release()` (host-managed teardown), `suspendPlayers(surface)`, `ShortKitSurface` interface, `activeInstance()`. `pause()`/`resume()` appear only in one Compose-tab note in `sdk/feed.mdx`.
10. **Player storyboard methods** — `prefetchStoryboard(playbackId)`, `getStoryboardData(playbackId)` missing from `sdk/player.mdx` command reference. `seekThumbnail` documented with the wrong signature (see Stale #6).
11. **`ShortKitDelegate`** (`onContentTapped`, `onRefreshStateChanged`, `onFeedContentFetched`) and **`loadingViewProvider`** — undocumented.
12. **`ContentItem.videoWidth`/`videoHeight`/`aspectRatio`** — missing from the Kotlin (and Swift) model in `guides/content-types.mdx`.
13. Ctor flags `debugPanelEnabled`/`serverTracingEnabled`/`consoleTracingEnabled`/`poolDebugEnabled` and `debugPanelFactory` — debug-oriented; low priority, judgment call.

## 2. STALE / WRONG

1. **`ShortKit` Kotlin constructor** (`sdk/configuration.mdx`, `sdk/identity.mdx`, `sdk/analytics.mdx`, `sdk/feed.mdx`) — documented as `ShortKit(apiKey, config, userId, ..., feedItems)`. Actual: `ShortKit(context, apiKey, userId, adProvider, clientAppName, clientAppVersion, customDimensions, ...)` — `context` is required first, and **`config` and `feedItems` params do not exist** (config goes to `ShortKitFeedFragment.newInstance`). Even `quickstart.mdx`/`sdk/installation.mdx`, which get the package right, pass `config = FeedConfig()` to the ctor — won't compile.
2. **Wrong package in imports** — `sdk/feed.mdx`, `sdk/configuration.mdx`, `sdk/player.mdx`, `sdk/player-and-widget.mdx` import `dev.shortkit.*`. Actual package is `com.shortkit.sdk.*` (`dev.shortkit` is only the Maven coordinate). `quickstart.mdx`/`installation.mdx` are correct — inconsistent across pages.
3. **Fragment construction** — `sdk/feed.mdx` shows `ShortKitFeedFragment(shortKit)`; `installation.mdx` shows `newInstance(shortKit)`. Actual: `newInstance(shortKit, config, startAtItemId?)` — `config` is required, not defaulted.
4. **Version pins `0.2.22`** in `quickstart.mdx:36` and `sdk/installation.mdx:134` — Android is at 0.2.55 (per `VERSIONS.md`).
5. **Kotlin examples contradict the documented `PlayerTime`** — `sdk/player.mdx` example (lines ~595) and `sdk/overlays.mdx` scrubber example use `time.duration`/`time.current` (Double seconds); actual fields are `currentMs`/`durationMs`/`bufferedMs` (Long ms) — correctly documented in the PlayerTime section of the same page.
6. **`seekThumbnail(30.0)`** in the Kotlin commands example — actual is `seekThumbnail(atMs: Long)` (milliseconds).
7. **`PlayerState.PLAYING`** in the Kotlin overlay example — actual is sealed-class `PlayerState.Playing`. Same page also documents `FeedSource.Algorithmic`; actual enum is `FeedSource.ALGORITHMIC`/`CUSTOM`.
8. **Overlay interfaces drift** (`sdk/overlays.mdx`): documented Kotlin `FeedOverlay` lists `resetPlaybackProgress()` (doesn't exist) and omits required `fadeOutForTransition()`/`restoreFromTransition()` plus optional `release()`/`captionTracksResolved()`. `CarouselOverlay`/`SurveyOverlay`/`AdOverlay` docs omit `fadeOutForTransition()`/`restoreFromTransition()` (and `CarouselOverlay`'s `updateActiveImage`/`resetToFirstImage`/`activatePlayback`).
9. **`FeedConfig` Kotlin** in `sdk/configuration.mdx` omits `pullToRefreshEnabled` and `preload`; `FeedHeight.Percentage` takes `Float` (docs imply parity with iOS `CGFloat` — example `0.7f` is fine, struct listing is incomplete rather than wrong).
10. **Live streams on Android** — `sdk/feed.mdx` line 8 says (unqualified) that live streams render with an `isLive` flag. Android has no `isLive` field and no live support at all. Needs a platform caveat; exclude live from Android tabs.

## 3. PHANTOM

1. **`ShortKitFeedView`** — `sdk/feed.mdx` shows an Android `@Composable ShortKitFeedView(shortKit)`; `sdk/configuration.mdx` shows `ShortKitFeedView(this, shortKit)` as a View. Neither exists; the SDK has zero Compose composables. Fragment is the only embed path.
2. **`feedItems` ctor param** for custom feeds — documented in `sdk/configuration.mdx` (Kotlin); doesn't exist. Real path: `FeedSource.CUSTOM` + `setFeedItems()`.
3. **`sdk/player-and-widget.mdx` Kotlin tabs are fabricated** — `ShortKitPlayerView`, `ShortKitWidgetView`, `PlayerConfig`, `PlayerClickAction`, `WidgetConfig`, `playerView.initialize/setItem/activate`, and the `<dev.shortkit.ShortKitPlayerView>` XML element: none exist on Android. Either remove Kotlin tabs or mark iOS-only.
4. **`player.captionsEnabledValue`** — used in the `sdk/overlays.mdx` caption example; no such accessor (only `currentItemValue`, `playbackRateValue`; use `captionsEnabled.value`).
5. **`feedReady` as a player publisher** (player.mdx table) — on Android this is `ShortKitFeedFragment.onFeedReady`, not a player flow; needs a platform caveat.

## 4. PLACEMENT NOTES

- **No page owns the feed component's programmatic API** (methods + callbacks on the fragment/VC). `sdk/feed.mdx` is embed-only. The Android surface (and presumably iOS parity APIs) needs a "Controlling the feed" section or page: scroll, refresh, filter, lock scrolling, custom-feed item management, multi-feed activation.
- **Custom feeds (`FeedSource.CUSTOM` + `FeedInput`)** have no guide; `FeedInput` shapes live in content-types but the wiring (`setFeedItems`/`appendFeedItems`, preload-by-items) is homeless.
- **Multi-surface / player-pool sharing** (`activate`/`deactivate`, `pause`/`resume`, `suspendPlayers`, `ShortKitSurface`) is a coherent concept with no home — candidates for a "Lifecycle & multiple feeds" page.
- **Ads**: `ShortKitAdProvider`/`ShortKitAdDelegate`/`PreparedAd`/`AdError`/`SkipPolicy` have no docs page (`sdk/ads.mdx` referenced in repo tooling does not exist in this docs tree); only `AdOverlay` is covered.
- **`sdk/carousel.mdx`** is structured as iOS-vs-RN two-tab; adding Android requires touching every section — plan as a page-level rework, not a patch.
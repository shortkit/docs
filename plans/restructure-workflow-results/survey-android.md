# Android SDK public surface — `com.shortkit.sdk` (v0.2.55)

Source: `/Users/michaelseleman/orca/workspaces/shortkit/fabledocs/android_sdk/shortkit/src/main/java/com/shortkit/sdk/`. Views are classic View/Fragment — **no Jetpack Compose composables exist** (zero `@Composable` in the SDK). All public API below; `internal` machinery (PlayerPool, PlayerManager, FeedAdapter, cells, trace pipeline, ApiClient internals) omitted.

## Entry point

| Name | Kind | Purpose |
|---|---|---|
| `ShortKit` | class | SDK root. Ctor: `context, apiKey, userId?, adProvider?, clientAppName?, clientAppVersion?, customDimensions?, debugPanelEnabled, serverTracingEnabled, consoleTracingEnabled, poolDebugEnabled`. Exposes `player`, `carousel`, `delegate`, `loadingViewProvider` (custom loading-view factory), `activeSurface`. |
| `ShortKit.setUserId(id)` / `clearUserId()` | methods | Bind/unbind a known user identity (resolves anonymous → user server-side). |
| `ShortKit.fetchContent(limit, filter?)` | suspend fun | Headless fetch of `ContentItem`s from the feed API (no UI). |
| `ShortKit.preloadFeed(filter?, limit)` / `preloadFeed(items: List<FeedInput>)` | methods | Background-fetch feed data before the view appears; returns `FeedPreload` for `FeedConfig.preload`. |
| `ShortKit.pause()` / `resume()` | methods | Yield/re-claim playback when the hosting view hides/shows (tab switch). |
| `ShortKit.suspendPlayers(surface)` | method | Park the active player for modal cover; resume-in-place on re-claim. |
| `ShortKit.release()` | method | Tear down the instance (host-managed; no auto-release). |
| `ShortKit.activeInstance()` | static | Most-recently-created live instance. |
| `ShortKitVersion.CURRENT` | const | SDK version string. |
| `ShortKitDelegate` | interface | Optional callbacks: `onContentTapped(contentId, index)`, `onRefreshStateChanged(state)`, `onFeedContentFetched(items)`. |
| `ShortKitSurface` | interface | Contract for custom surfaces sharing the player pool: `surfaceLabel`, `activeVideoURL`, `nextVideoURL`, `activeContentID`, `nextContentID`, `didClaimPlayers()`, `willYieldPlayers()`, `willSuspendPlayers()`, `didResumePlayers()`. |

## Feed UI

| Name | Kind | Purpose |
|---|---|---|
| `ShortKitFeedFragment` | Fragment | Main vertical/horizontal feed. `newInstance(shortKit, config, startAtItemId?)`. |
| — `setFeedItems(items, startAtId?)` | method | Replace custom-feed content (CUSTOM mode). |
| — `appendFeedItems(items)` | method | Append custom-feed items (pagination). |
| — `scrollToItem(id, animated)` | method | Programmatic scroll to a feed item. |
| — `refresh()` | method | Programmatic refresh. |
| — `applyFilter(filter?)` | method | Re-fetch algorithmic feed with a new `FeedFilter`. |
| — `setFeedScrollEnabled(enabled)` | method | Lock/unlock feed swiping. |
| — `activate()` / `deactivate()` | methods | Multi-feed surface activation (claim/yield player pool). |
| — callbacks | vars | `onDismiss`, `onFeedReady`, `onRefreshStateChanged`, `onFeedTransition`, `onRemainingContentCountChange`, `onVideoCarouselCellTap` (`VideoCarouselCellTapPayload`), `onVideoCarouselCellLongPress` (`VideoCarouselCellLongPressPayload` incl. `x`/`y`), `seedThumbnail: Bitmap?`, `debugPanelFactory`. |
| `ShortKitFeedActivity` | Activity | One-call fullscreen feed: `ShortKitFeedActivity.launch(context, shortKit, config, startAtItemId?)`. |
| `ShortKitRefreshState` | sealed class | Pull-to-refresh lifecycle: `Idle`, `Pulling(progress)`, `Triggered`, `Refreshing`. |
| `VideoCarouselCellLongPressState` | enum | `BEGAN`, `ENDED`, `CANCELLED`. |

## Player control (`ShortKit.player`)

`ShortKitPlayer` — reactive control surface for the active feed video.
- **StateFlows:** `playerState` (`PlayerState`: Idle/Loading/Ready/Playing/Paused/Seeking/Buffering/Ended/Error), `currentItem: ContentItem?`, `isMuted`, `playbackRate`, `captionsEnabled`, `activeCaptionTrack`, `activeCue: VttCue?`, `prefetchedAheadCount`, `remainingContentCount`.
- **SharedFlows:** `time` (`PlayerTime` currentMs/durationMs/bufferedMs), `didLoop` (`LoopEvent`), `feedTransition` (`FeedTransitionEvent` with `from`/`to` ContentItem + `fromFeedItem`/`toFeedItem`), `formatChange` (`FormatChangeEvent` bitrate/resolution), `feedScrollPhase` (`FeedScrollPhase.Dragging/Settled`).
- **Commands:** `play()`, `pause()`, `seek(s)`, `seekAndPlay(s)`, `setMuted()`, `skipToNext()`, `skipToPrevious()`, `setPlaybackRate()`, `sendContentSignal(POSITIVE|NEGATIVE)`, `setMaxBitrate(bps)`, `setCaptionsEnabled()`, `selectCaptionTrack(language)`.
- **Storyboards:** `seekThumbnail(atMs): Bitmap?`, `prefetchStoryboard(playbackId)`, `getStoryboardData(playbackId): String?` (JSON).

## Carousel namespace (`ShortKit.carousel`)

`ShortKitCarousel` — navigation/state for the active video carousel. Flows: `activeIndex: StateFlow<Int?>`, `activeCarouselChanged: StateFlow<VideoCarouselItem?>`, `activeVideoCompleted: SharedFlow<CarouselCompletionEvent>` (contentItem, indexInCarousel, wasLast, willAutoAdvance). Sync accessors: `activeIndexValue`, `videoCountValue`, `activeCarouselItemValue`. Imperative: `next()`, `previous()`, `setActiveIndex(i)` (all thread-safe, return Boolean).

## Overlay interfaces (`overlay/`)

All wired via `FeedConfig.*Overlay = Custom { view }`; the View must implement the matching interface:
- `FeedOverlay` — video overlay: `attach(player)`, `configure(item)`, `activatePlayback()`, `fadeOutForTransition()`, `restoreFromTransition()`, `release()`, `captionTracksResolved(tracks)`.
- `CarouselOverlay` — image carousel: `cachedImage` lookup, `configure`, `updateActiveImage(index)`, `resetToFirstImage()`, plus reset/fade hooks.
- `VideoCarouselOverlay` — `configure(item)`, `updateActiveVideo(index, item)`, `attach(player)`, `activatePlayback()`/`deactivatePlayback()`, `resetState()`.
- `SurveyOverlay` — `onSurveyResponse(surveyId, option)`, `onAutoAdvance`, `configure(SurveyItem)`.
- `AdOverlay` — `configure(NativeAdContent)` + reset/fade hooks.

## Configuration (`config/`)

- `FeedConfig` (data class): `feedHeight` (`FeedHeight.Fullscreen`/`Percentage`), `videoOverlay`/`carouselOverlay`/`videoCarouselOverlay`/`surveyOverlay`/`adOverlay` modes (`None`/`Custom(factory)`), `muteOnStart`, `autoplay`, `feedSource` (`FeedSource.ALGORITHMIC|CUSTOM`), `pullToRefreshEnabled`, `preload`, `filter`, `scrollAxis` (`ScrollAxis.Vertical|Horizontal`).
- `FeedFilter`: `tags`, `section`, `author`, `contentType`, `metadata: Map<String, List<String>>` (array OR filtering).
- `FeedPreload` — opaque preload handle (created only via `ShortKit.preloadFeed`).

## Models (`model/`)

`ContentItem` (id, playbackId, title, description, duration, streamingUrl, thumbnailUrl, captionTracks, customMetadata, author, articleUrl, commentCount, fallbackUrl, videoWidth/Height, aspectRatio) · `FeedInput` sealed: `Video(playbackId, fallbackUrl?, contentId?)`, `ImageCarousel(ImageCarouselItem)`, `VideoCarousel(VideoCarouselInput)` · `ImageCarouselItem`/`CarouselImage` · `VideoCarouselItem`/`VideoCarouselInput`/`VideoCarouselVideoInput` (`hydrated()`) · `SurveyItem`/`SurveyOption` · `CaptionTrack`/`CaptionSource` (EMBEDDED/EXTERNAL/GENERATED) · `FeedItem` sealed (feed cell union) · `AdSlot`, `SkipPolicy` (NonSkippable/SkippableAfter/AlwaysSkippable), `NativeAssetKeyMap` · `JsonValue`.

## Ads (`ads/`)

`ShortKitAdProvider` (interface: `loadAd(adSlot, container) → PreparedAd?`, `displayAd`, `dismissAd`) · `ShortKitAdDelegate` (adDidStart/ReachQuartile/Complete/WasSkipped/Fail/ReceiveClick) · `PreparedAd`, `NativeAdContent`, `AdError` (NoFill/Timeout/NetworkError/ProviderError), `AdQuartile`.

## Identity & analytics

Identity is via `ShortKit.setUserId`/`clearUserId` (anonymous ID auto-generated and persisted; `IdentityManager` is technically public but accessed through ShortKit). Analytics is fully automatic (view sessions, engagement, QoE batched events) — no public tracking API; the only developer hooks are `sendContentSignal()` and `customDimensions` in the ctor.

## Surface changed in last ~2 months (since ~2026-04-10)

- **2026-06-08** — lazy caption resolution (#445): added `FeedOverlay.captionTracksResolved(tracks)`; caption tracks now resolve lazily.
- **2026-06-08** — `VideoCarouselCellLongPressPayload` gained `x`/`y` coordinates (#441).
- **2026-06-04** — `FeedFilter.metadata` type changed to `Map<String, List<String>>` (array OR filtering).
- **2026-05-04/05** — `onVideoCarouselCellTap` / `onVideoCarouselCellLongPress` callbacks added (#280, #279).
- **2026-04-28** — iOS-parity feed APIs (#225): `ShortKitFeedFragment.scrollToItem(id, animated)` and `setFeedItems(..., startAtId?)` added.
- 0.2.4x–0.2.55 releases otherwise were internal fixes (telemetry parity, segment cache, surface guards) — no public surface change.

## Live streaming — confirmed absent

No live/broadcast API exists on Android. Confirmed: no live types, no `isLive` field on `ContentItem`, `FeedCell` does not branch on live status, and explicit `TODO(parity)` comments in `ShortKitFeedFragment.kt` (lines ~1731, 2214, 2361) and `FeedDataSource.kt` state "Android does not yet have a LiveStreamMonitor analog" and that the iOS livestream-end removal policy is unported. There is no partial live-viewing support — live is iOS-only, matching project memory. Exclude live streaming from Android docs entirely.
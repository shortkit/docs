# React Native SDK public surface — `@shortkitsdk/react-native` (`react_native_sdk/src`)

Authoritative source: `react_native_sdk/src/index.ts`. All names below are exported there unless flagged.

## Components

| Name | Kind | Purpose |
|---|---|---|
| `ShortKitProvider` | component | Root context provider; initializes SDK with `apiKey`, optional `userId`, `clientAppName`/`clientAppVersion`, `customDimensions`, `loadingViewComponent`, `debugPanel`, `serverTracingEnabled`, `consoleTracingEnabled` |
| `ShortKitFeed` | component | Full vertical/horizontal feed; props: `config`, `preloadId`, `style`, `startAtItemId`, `seedThumbnailUrl`, `feedItems` (custom-feed construction-time items), `active` (tab-focus suspension), `debugPanel`, plus events: `onLoop`, `onFeedTransition`, `onFormatChange`, `onContentTapped`, `onDismiss`, `onRefreshStateChanged`, `onDidFetchContentItems`, `onRemainingContentCountChange`, `onFeedReady`, `onCarouselActiveVideoCompleted`, `onVideoCarouselCellTap`, `onVideoCarouselCellLongPress` |
| `ShortKitPlayer` | component | Inline single player; props: `config: PlayerConfig`, `contentItem`, `active`, `feedItems` (seeds expanded feed on tap), `style`, `onTap` |
| `ShortKitWidget` | component | Preview-card carousel widget; props: `config: WidgetConfig`, `items: WidgetInput[]`, `onCardTap`, `active`, `feedItems`, `style` |

`ShortKitFeed` exposes a `ref` handle (`ShortKitFeedHandle`): `setFeedItems(items, {startAt})`, `scrollToItem(id, {animated})`, `appendFeedItems`, `applyFilter(filter|null)`, `refresh()`.

## Hooks

| Name | Returns | Purpose |
|---|---|---|
| `useShortKit` | `{setUserId, clearUserId, fetchContent(limit, filter), preloadFeed(config, items)}` | SDK-level ops: identity + content fetch + feed preloading (requires provider) |
| `useShortKitPlayer` | `ShortKitPlayerState` | Reactive player state (playerState, currentItem, time, isMuted, playbackRate, captions, activeCue, prefetchedAheadCount, isActive, feedScrollPhase) + commands (play, pause, seek, seekAndPlay, skipToNext/Previous, setMuted, setPlaybackRate, setCaptionsEnabled, selectCaptionTrack, sendContentSignal, setMaxBitrate, prefetchStoryboard, getStoryboardData). **NOT usable inside overlay components** (isolated surfaces) — use `ShortKitCommands` |
| `useShortKitCarousel` | `ShortKitCarouselState` | Video-carousel state (`activeIndex`, `videoCount`, `activeCarouselItem`) + commands (`next`, `previous`, `setActiveIndex`); works inside overlays, no provider required |

## Imperative commands and overlay infrastructure

- `ShortKitCommands` — object — player/carousel control from overlay surfaces: play, pause, seek, seekAndPlay, skipToNext/Previous, carouselNext/Previous/SetActiveIndex, setMuted, setPlaybackRate, setCaptionsEnabled, selectCaptionTrack, sendContentSignal, setMaxBitrate, `setFeedScrollEnabled(bool)` (gesture-exclusivity toggle for overlay scrubbers), prefetchStoryboard, getStoryboardData, `downloadVideo(itemId, {mode: 'interruptive'|'nonInterruptive', overlayMode: 'none'|'static'|'deterministic'})`, `cancelDownload`.
- `registerOverlayComponent(name, component)` / `registerCarouselOverlayComponent` / `registerVideoCarouselOverlayComponent` / `registerFeedMaskComponent` — functions — register host React components for native-hosted overlay/mask surfaces.
- `pushFeedScreen(componentName, props)` / `popFeedScreen()` — functions — native parallax-push of an AppRegistry-registered RN screen onto the feed-mask navigation stack (requires `feedMask`; iOS).
- `NativeShortKitModule`, `ShortKitInitContext` (marked `@internal`), `serializeFeedConfig`/`serializeFeedInputs` (marked `@internal`) — escape hatches; exclude from public docs.

## Types (exported)

- **Config:** `FeedConfig` (feedHeight, scrollAxis, `overlay`, `carouselOverlay`, `videoCarouselOverlay`, muteOnStart, feedSource, autoplay, filter, pullToRefreshEnabled, onDidFetchContentItems), `FeedHeight`, `ScrollAxis`, `FeedSource` (`'algorithmic'|'custom'`), `FeedFilter` (tags/section/author/contentType/metadata with `string|string[]` values), `PlayerConfig` (cornerRadius, clickAction, autoplay, loop, muteOnStart, overlay, feedConfig, `feedMask` iOS-only), `PlayerClickAction` (`'feed'|'mute'|'none'`), `WidgetConfig` (cardCount, cardSpacing, cornerRadius, autoplay, muteOnStart, loop, rotationInterval, clickAction, overlay, filter, feedConfig, feedMask, `playbackMode: 'singleVisibleRotating'|'allVisibleSimultaneous'`, `previewDuration`), `WidgetInput`.
- **Overlay:** `OverlayConfig`/`CarouselOverlayConfig`/`VideoCarouselOverlayConfig` (`'none' | {type:'custom', name, component}`), `FeedMaskConfig` (+`height`, default 96), `OverlayProps` (item, isActive, playerState, time, isMuted, playbackRate, captionsEnabled, activeCue, feedScrollPhase), `CarouselOverlayProps` (item, isActive, activeImageIndex), `VideoCarouselOverlayProps` (carouselItem, activeVideo, activeVideoIndex, isActive, time, playerState, isMuted), `FeedMaskProps` (item, activeIndex, totalCount).
- **Data:** `ContentItem` (id, playbackId, title, description, duration, streamingUrl, thumbnailUrl, captionTracks, customMetadata, author, articleUrl, commentCount, fallbackUrl, downloadUrl, videoWidth/videoHeight/aspectRatio), `CarouselImage`, `ImageCarouselItem`, `VideoCarouselItem`, `VideoCarouselInput` (+`initialPageIndex`, one-shot landing semantics), `VideoCarouselVideoInput`, `FeedInput` (`video` | `imageCarousel` | `videoCarousel`), `CaptionTrack` (`url`; `sourceUrl` deprecated), `CaptionSource`, `JSONValue`, `StoryboardData`/`StoryboardTile`.
- **Events/state:** `PlayerTime`, `PlayerState`, `LoopEvent`, `FeedTransitionEvent`, `FeedScrollPhase`, `FormatChangeEvent`, `ContentSignal`, `ShortKitRefreshState`, `ShortKitPlayerState`, `ShortKitCarouselState`, `ShortKitFeedHandle`, props types.

## RN naming divergences / gaps (vs other SDKs)

- Overlay config keys are `overlay` / `carouselOverlay` / `videoCarouselOverlay` (not `videoOverlay`).
- No `surveyMode` and no survey API in RN — surveys are not on the RN surface.
- No live-streaming surface in RN (iOS-only feature).
- `DownloadState`/`DownloadStatus`/`DownloadOverlayMode` types exist in `types.ts` but are **not exported from `index.ts`**; `downloadState` is reachable via the provider context (`useShortKitPlayer` spread). Download commands are public via `ShortKitCommands.downloadVideo`/`cancelDownload`.
- `feedMask` and `pushFeedScreen` are iOS-only (Android no-op); `setFeedScrollEnabled` has intentional Android fan-out divergence.
- Identity = `userId` prop on provider + `setUserId`/`clearUserId` via `useShortKit`. Analytics config = `clientAppName`, `clientAppVersion`, `customDimensions` on provider; engagement signal via `sendContentSignal('positive'|'negative')`.

## Recent additions (last ~2 months, git log)

- **June 2026:** long-press `x`/`y` coordinates on `onVideoCarouselCellLongPress`; download overlay modes (stubs); interactive swipe-back for pushed feed screens; `FeedFilter.metadata` now accepts `string|string[]`.
- **May 2026:** `pushFeedScreen`/`popFeedScreen` native push navigation; `VideoCarouselInput.initialPageIndex`; `onVideoCarouselCellLongPress`; `setFeedScrollEnabled`; widget multi-player `playbackMode`/`previewDuration`; widget `feedItems`; FeedMask RN bridge; `onCardTap`; widget `active` prop.
- **April 2026:** `consoleTracingEnabled`/`serverTracingEnabled` rename; per-feed `debugPanel`; `refresh()`; `feedItems` + `active` on feed; `seedThumbnailUrl`; carousel swipe API (`useShortKitCarousel`); `WidgetInput`; breaking change — `videoCarousel` FeedInput takes playback IDs only; `downloadVideo`/`cancelDownload` + download state.

## Doc-rule caution

`WidgetConfig.previewDuration` and `useShortKitCarousel` source comments mention a third-party vendor ("Mux Instant Clip") — must not leak into public docs; use "streaming clip URL" phrasing. `ShortKitFeedProps.seedThumbnailUrl` doc mentions SDWebImage/UIKit internals — paraphrase. `onVideoCarouselCellTap` JSDoc references `useShortKit().setMuted(...)`, which does not exist (`setMuted` lives on `ShortKitCommands`/`useShortKitPlayer`) — do not propagate into docs.
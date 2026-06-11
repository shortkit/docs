# iOS SDK public surface survey — `swift_sdk/Sources/ShortKit` (v0.2.55, iOS 15+, SPM product `ShortKitSDK`)

## Entry point
- `ShortKit` | class | Root SDK object. `init(apiKey:userId:adProvider:clientAppName:clientAppVersion:customDimensions:loadingViewProvider:debugPanelEnabled:serverTracingEnabled:consoleTracingEnabled:poolDebugEnabled:)`. Exposes `player`, `carousel`, `delegate`, `downloadDelegate`, `loadingViewProvider`, `defaultDebugPanelFactory`.
- Methods: `preloadFeed(filter:limit:) -> FeedPreload`, `preloadFeed(items:[FeedInput])`, `fetchContent(limit:filter:) async -> [ContentItem]`, `setUserId(_:)`, `clearUserId()` (identity), `setColdStartQueue(_:)`, `clearColdStartCache()`, `downloadVideo(_:mode:)`, `downloadVideo(_:mode:overlayMode:)` (overlayMode currently ignored — Phase 2 stub), `cancelDownload()`.
- `ShortKitVersion` | enum | `current` version string.

## Feed
- `ShortKitFeedViewController` | UIViewController | Vertical/horizontal feed. `init(shortKit:config:startAtItemId:lifecycle:)`. Methods: `setFeedItems(_:startAtId:)`, `appendFeedItems(_:)`, `scrollToItem(id:animated:)`, `switchFeedSource(to:)`, `prependSeedItem(_:scrollToId:animated:)`, `applyFilter(_:)`, `refresh()`, `activate()`/`deactivate()`, `overlayView(forItemId:)`. Hooks: `onDismiss`, `onFeedReady`, `onRemainingContentCountChange`, `onRefreshStateChanged`, `onFeedTransition`, `onVideoCarouselCellTap`/`onVideoCarouselCellLongPress` (+ `VideoCarouselCellTapPayload`/`LongPressPayload`/`LongPressState`), `seedThumbnail`, `isActiveSurface`, `currentFeedSource`, `debugPanelFactory`.
- `ShortKitFeedView` | SwiftUI view | `UIViewControllerRepresentable` wrapper; `init(shortKit:config:onFeedReady:)`; `Coordinator.feedViewController`.
- `ShortKitFeedLifecycle` | enum | `.automatic` / `.manual` ownership of player claiming.
- `ShortKitRefreshState` | enum | `.idle/.pulling(progress:)/.triggered/.refreshing` pull-to-refresh state.
- `FeedPreload` | class | Opaque preload handle; `init(immediateItems:)` for client-provided items.
- `SeedThumbnailResolver` | enum | `resolveFromMemory(url:)` cached thumbnail lookup for deep-link seeds.

## Configuration
- `FeedConfig` | struct | `feedHeight`, `scrollAxis`, 7 overlay modes (`videoOverlay`, `carouselOverlay`, `videoCarouselOverlay`, `surveyOverlay`, `adOverlay`, `liveOverlay`, `liveEndedOverlay`), `liveRoomMask`, `muteOnStart`, `autoplay`, `feedSource`, `coldStartEnabled`, `pullToRefreshEnabled`, `filter`, `preload`, `shouldExpandLiveRoom: ((ContentItem)->Bool)?`.
- `FeedFilter` | struct | `tags`, `section`, `author`, `contentType`, `metadata: [String:[String]]` (array OR-matching).
- `FeedHeight`, `ScrollAxis`, `FeedSource` (`.algorithm`/`.custom`) | enums.
- Overlay-mode enums | `VideoOverlayMode`, `CarouselOverlayMode`, `VideoCarouselOverlayMode`, `SurveyOverlayMode`, `AdOverlayMode` (`.none/.custom(factory)`); `LiveOverlayMode` (`.none/.default/.custom`); `LiveEndedOverlayMode` (`.default/.custom`); `FeedMaskMode`, `LiveRoomMaskMode` (`.none/.custom`).

## Player control (`ShortKitPlayer`)
- Commands: `play`, `pause`, `seek(to:)`, `seekAndPlay(to:)`, `setMuted`, `skipToNext`, `skipToPrevious`, `setPlaybackRate`, `setMaxBitrate`, `setCaptionsEnabled`, `selectCaptionTrack(language:)`, `setFeedScrollEnabled`, `sendContentSignal(_:)` (signals: `.positive/.negative`), `dismissLiveRoom()`, `downloadCurrentItem(mode:) async -> URL`, `seekThumbnail(at:) -> UIImage?`, `currentProgramDate()`.
- Combine publishers: `time`, `playerState`, `currentItem`, `didLoop`, `feedTransition`, `feedScrollPhase`, `formatChange`, `isMuted`, `playbackRate`, `captionsEnabled`, `activeCaptionTrack`, `activeCue`, `prefetchedAheadCount`, `remainingContentCount`, `isLiveRoomExpanded`, `liveStreamStatus` (+ `*Value` synchronous accessors).
- Event types | `PlayerTime`, `PlayerState`, `LoopEvent`, `FeedTransitionEvent`(+`Phase`/`Direction`), `FormatChangeEvent`, `FeedScrollPhase`, `ContentSignal` | structs/enums.

## Single player & widget
- `ShortKitPlayerViewController` / `ShortKitPlayerView` (SwiftUI) | Single-item player; `configure(with: ContentItem)`, `setFeedItems(_:)`, `activate()/deactivate()`, `feedMask`, `onModalFeedPresented`, `onPreviewCompleted`.
- `PlayerConfig` | struct | `cornerRadius`, `clickAction` (`PlayerClickAction`: `.feed/.mute/.none`), `autoplay`, `loop`, `muteOnStart`, `videoOverlay`, `feedConfig`, `previewMode` (`.full/.instantClip(seconds:)`).
- `ShortKitWidgetViewController` | UIViewController | Carousel/grid widget. `init(shortKit:config:items:)`, `configure(with:[WidgetInput])`, `setFeedItems(_:)`, `appendItems(_:)`, `parentScrollViewDidScroll(_:)`, `active: Bool`, `feedMask`, `onCardTap`, `onModalFeedPresented/Dismissed`, `onContentHeightChange`.
- `WidgetConfig` | struct | card sizing, `playbackMode` (`WidgetPlaybackMode`: `singleVisibleRotating/allVisibleSimultaneous/gridAlternating(startSide:)`), `layout` (`WidgetLayout`: `.carousel/.grid(columns:cellAspectRatio:scrollable:)`), `previewDuration`, grid height helpers. `WidgetInput` | enum | `.video(playbackId:origin:fallbackUrl:contentId:)`.

## Carousel control
- `ShortKitCarousel` | class | `next()`, `previous()`, `setActiveIndex(_:)`; publishers `activeIndex`, `activeCarouselChanged`, `activeVideoCompleted`; value accessors. `CarouselCompletionEvent` | struct.

## Overlays & masks (protocols, all `UIView &`-conformed)
- `FeedOverlay` | per-video overlay (`attach(player:)`, `configure(with:)`, `activatePlayback()`, `captionTracksResolved`) ; `FeedMask` (feed-in-chrome, `feedRegion`); `CarouselOverlay` (image carousels, image prefetch hooks); `VideoCarouselOverlay`; `SurveyOverlay` (`onSurveyResponse`, `onAutoAdvance`); `AdOverlay` (`configure(with: NativeAdContent)`); `LiveOverlay` (`activate/deactivate`, `liveStreamStatusDidChange`, `expand/collapse`); `LiveEndedOverlay`; `LiveRoomMask` (`liveRegion`, `willDismiss`).
- `CellContent` | ObservableObject | `@Published item` for SwiftUI overlay bindings. (SwiftUI overlay host classes are internal.)

## Models
- `ContentItem` | struct | `id`, `playbackId`, `title`, `description`, `duration`, `streamingUrl`, `thumbnailUrl`, `captionTracks`, `customMetadata`, `author`, `articleUrl`, `commentCount`, `fallbackUrl`, `downloadUrl`, `isLive`, `liveStreamId`, `liveStreamStatus`, `startedAt`, `endedAt`, `currentViewers`, `isDownloadable`.
- `FeedInput` | enum | `.video(playbackId:origin:fallbackUrl:contentId:)`, `.liveStream(playbackId:)`, `.imageCarousel`, `.videoCarousel` (`.videoCarouselItem` is DEBUG/test-only).
- Others: `FeedItem`, `ContentOrigin`, `ImageCarouselItem`/`CarouselImage`, `VideoCarouselItem`/`VideoCarouselInput`/`VideoCarouselVideoInput`, `SurveyItem`/`SurveyOption`, `CaptionTrack`/`CaptionSource`, `VTTCue`, `JSONValue`, `ShortKitError`, `LiveStreamStatus` (`.idle/.active/.ended/.dvr`).

## Live streaming
Viewer-side only in this target: `FeedInput.liveStream`, `LiveOverlay`/`LiveEndedOverlay`/`LiveRoomMask` protocols + modes, `FeedConfig.shouldExpandLiveRoom`, `player.liveStreamStatus`/`isLiveRoomExpanded` publishers, `player.dismissLiveRoom()`, `ContentItem` live fields. **No broadcast/capture (camera→stream) API exists anywhere in `Sources/ShortKit`** — the task brief's "live broadcast" claim does not match this target; live room VC and stream monitor are internal.

## Delegates, downloads, ads
- `ShortKitDelegate` | protocol | `didChangeRefreshState`, `didTapContent`, `didFetchContentItems` (all defaulted).
- `ShortKitDownloadDelegate` | protocol | start/progress/complete/fail callbacks; `DownloadMode` (`.nonInterruptive/.interruptive`), `DownloadOverlayMode` (`.none/.staticSnapshot` — stub), `ShortKitDownloadError`.
- `ShortKitAdProvider`, `ShortKitAdDelegate`, `AdQuartile`, `AdSlot`, `SkipPolicy`, `NativeAssetKeyMap`, `PreparedAd`, `NativeAdContent`, `AdError` | ads plumbing. Separate `ShortKitGoogleAds` target (`GoogleAdsProvider`, `GoogleIMAAdProvider`) is **commented out of Package.swift** (binary-artifact issue) — not currently shipped.
- Debug (public but internal-facing): `DebugPanelView`, `DebugMetrics`, `DebugAlert(s)`, `SwipeCurve`; caching internals are public-but-plumbing (`SegmentCache`, `SegmentPrefetcher`, `BandwidthMonitor`, `HLSManifestParser`, `StoryboardProvider`, `VTTParser`) — probably not doc-worthy.

## Added/changed in last ~2 months (since ~2026-04-10)
- `ShortKitFeedLifecycle` + `lifecycle:` init param, `activate()/deactivate()` (Apr 21, #169)
- Live streams surface: `LiveStreamStatus`, live overlays/masks (Apr 15, #125); `.dvr` case added Jun 1 (#399 — **source-breaking** for exhaustive switches)
- Widget `active` property (Apr 27, #212); `WidgetLayout.grid` + `gridAlternating` (May 18, #333)
- `FeedConfig.shouldExpandLiveRoom`, playbackId dedup, deep-link seed (May 26, #363); `prependSeedItem` + `SeedThumbnailResolver` (May 27, #373)
- `ShortKitPlayer.downloadCurrentItem()` (Jun 1, #403); unified download-url, compositing removed (#397)
- `FeedFilter.metadata` array values; `WidgetInput` `contentId` (#418); carousel long-press payload + `DownloadOverlayMode` stubs (#436); `onModalFeedPresented`; `switchFeedSource(to:)` (Jun 7); `ContentItem.captionTracks` made fully public (#444)
- Note: `scrollToItem`/`preloadFeed` predate the window on iOS (Mar) but were newly exposed in Flutter (#450)

## Deprecated
- `ShortKitFeedViewController.setBridgeManaged()` — use `lifecycle: .manual` init param.

## Docs-guideline flags
- `FeedInput`/`WidgetInput` doc comments say "Mux playback ID" — public docs must say "playback ID" (vendor-name rule). Cache/debug types should stay undocumented.
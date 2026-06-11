# Flutter SDK public surface survey — `shortkit_flutter` (`flutter_sdk/lib`)

Barrel export: `/Users/michaelseleman/orca/workspaces/shortkit/fabledocs/flutter_sdk/lib/shortkit_flutter.dart`. Repo pubspec reads `0.3.0` (unpublished); pub.dev is at `0.2.22` while iOS/Android/RN ship `0.2.55` — see "Unreleased surface" below.

## Widgets

| Name | Kind | Purpose |
|---|---|---|
| `ShortKitProvider` | StatefulWidget | Provides a `ShortKitController` to the tree; `.apiKey` ctor auto-creates one (`apiKey`, `userId`, `clientAppName`, `clientAppVersion`, `customDimensions`, `debugPanel`) |
| `ShortKit` | static accessor | `ShortKit.of(context)` / `maybeOf` to retrieve the controller |
| `ShortKitFeed` | StatefulWidget (platform view) | Native swipeable feed; props: `controller`, `config`, `preloadId`, `startAtItemId`, `debugPanel` (per-surface override), `active` (suspend/release player pool slot); callbacks: `onLoop`, `onFeedTransition`, `onFormatChange`, `onContentTapped`, `onDismiss`, `onRefreshStateChanged`, `onFeedReady`, `onDidFetchContentItems`, `onRemainingContentCountChange` |
| `ShortKitPlayer` | StatefulWidget (platform view) | Single standalone video player — Flutter **does** have this; props: `config`, `contentItem`, `active`, `onTap` |
| `ShortKitWidget` | StatefulWidget (platform view) | Multi-card carousel widget; props: `config` (`WidgetConfig`), `items` (`List<ContentItem>`) |

## Controllers

| Name | Kind | Purpose |
|---|---|---|
| `ShortKitController` | class | Global SDK handle. Playback: `play`, `pause`, `seek`, `seekAndPlay`, `skipToNext/Previous`, `setMuted`, `setPlaybackRate`, `setCaptionsEnabled`, `selectCaptionTrack`, `setMaxBitrate`, `prefetchStoryboard`, `getStoryboardData`. Data: `fetchContent({limit, filter})`, `preloadFeed(config, items)`. Identity: `setUserId`, `clearUserId`. Signals: `sendContentSignal`. Observable state via `ValueNotifier`s: `playerState`, `playerError`, `currentItem`, `time`, `isMuted`, `playbackRate`, `captionsEnabled`, `activeCaptionTrack`, `activeCue`, `prefetchedAheadCount`, `isActive`, `feedScrollPhase` |
| `ShortKitFeedController` | class | Per-feed handle: `setFeedItems`, `appendFeedItems`, `applyFilter`, `refresh()`, `scrollToItem(itemId, animated:)` |
| `FeedCallbacks` | class | Callback bundle registered per feed (same events as `ShortKitFeed` props) |

## Overlay support (separate Dart entry point pattern)

| Name | Kind | Purpose |
|---|---|---|
| `ShortKitOverlayEngine` | static class | `initialize(overlays:, carouselOverlays:, videoCarouselOverlays:, loadingWidget:)` — registers named Flutter overlay builders; native drives lifecycle |
| `ShortKitOverlayBuilder` / `ShortKitCarouselOverlayBuilder` / `ShortKitVideoCarouselOverlayBuilder` | typedefs | Builder signatures for video / image-carousel (`isActive`, `activeImageIndex`) / video-carousel overlays |
| `ShortKitOverlayCommands` (+ `ShortKitOverlayCommandsProvider`) | class / InheritedWidget | Player commands from inside an overlay: play/pause/seek/skip, mute, rate, captions, `sendContentSignal(ContentSignal)`, `setMaxBitrate`, storyboard fetch |

## Types (all exported)

- Content: `ContentItem` (id, playbackId, title, description, duration, streamingUrl, thumbnailUrl, captionTracks, customMetadata, author, articleUrl, commentCount, fallbackUrl, downloadUrl), `CaptionTrack`/`CaptionSource`, `CaptionCue`, `ContentOrigin`, `ContentSignal` (positive/negative)
- Feed: `FeedConfig` (feedHeight, scrollAxis, overlay×3, muteOnStart, feedSource, autoplay, filter, pullToRefreshEnabled), `FeedSource` (algorithmic/custom), `FeedHeight` (sealed: Fullscreen/Percentage), `FeedFilter` (tags, section, author, contentType, `metadata: Map<String, List<String>>` array-OR), `FeedInput` (sealed: `.video(playbackId, origin, fallbackUrl)`, `.imageCarousel`, `.videoCarousel`), `ScrollAxis`, `ShortKitRefreshState` (sealed: Idle/Pulling/Triggered/Refreshing)
- Player: `PlayerConfig` (autoplay, loop, muteOnStart, cornerRadius, clickAction, overlay), `PlayerClickAction` (feed/mute/none), `PlayerState`, `PlayerTime`
- Widget: `WidgetConfig` (cardCount, cardSpacing, cornerRadius, autoplay, muteOnStart, loop, rotationInterval, clickAction, overlay, filter, feedConfig)
- Overlays: `OverlayConfig` / `CarouselOverlayConfig` / `VideoCarouselOverlayConfig` (each sealed: None/Custom-with-named-builder), `OverlayState`, `VideoCarouselOverlayState`
- Carousels: `ImageCarouselItem`/`CarouselImage`, `VideoCarouselInput`, `VideoCarouselVideoInput`, `VideoCarouselItem`
- Events/misc: `LoopEvent`, `FeedTransitionEvent`, `FeedScrollPhase`/`ScrollPhase`, `FormatChangeEvent`, `StoryboardData`/`StoryboardTile`

Analytics: no public analytics API beyond `sendContentSignal`, `setUserId`/`clearUserId`, and `customDimensions` at init — view/engagement events are automatic (same model as RN).

## Features other SDKs have that Flutter LACKS

- **Ads** — iOS+Android expose `ShortKitAdProvider`, `ShortKitAdDelegate`, `AdSlot`, `AdOverlay`, `NativeAdContent`, `AdQuartile`, `SkipPolicy`. Zero ad surface in Flutter (no hits in `lib/` or the Flutter native plugin).
- **Surveys** — iOS+Android have `SurveyOverlay`/`SurveyItem`/`SurveyOption`. Absent in Flutter.
- **Live streaming** — iOS only (`LiveOverlay`, `LiveEndedOverlay`, `LiveRoomMask`, `LiveStreamStatus`). Not in Android, RN, or Flutter.
- **Downloads/offline** — iOS only (`DownloadMode`, `ShortKitDownloadDelegate`, `DownloadOverlayMode`). Absent in Flutter (though `ContentItem.downloadUrl` is surfaced).
- **Feed mask** — iOS `FeedMask`/`FeedMaskMode`, RN `registerFeedMaskComponent`. No Flutter equivalent.
- **Carousel-of-feeds controller** — iOS/Android `ShortKitCarousel`, RN `useShortKitCarousel`. Flutter has only `ShortKitWidget` (multi-card) and in-feed carousel content types.
- **`WidgetInput`** — iOS/RN accept a widget input type; Flutter `ShortKitWidget` takes `List<ContentItem>` only.
- **Built-in overlay modes** — iOS/Android offer default overlay modes (`VideoOverlayMode`, etc.); Flutter `OverlayConfig` is only none/custom.
- **Navigation helpers** — RN `pushFeedScreen`/`popFeedScreen`; no Flutter analog.

## Unreleased surface (merged to main, NOT on pub.dev 0.2.22 — mark as unreleased in docs)

Commits since tag `v0.2.22` touching `flutter_sdk/lib`:

- `a49caa5de` — **breaking**: `FeedInput.videoCarousel` takes playback IDs only; new exports `VideoCarouselInput`, `VideoCarouselVideoInput`
- `762ca139f` (#134) — `ContentOrigin` export; `FeedInput.video` gains `origin` + `fallbackUrl`
- `233d734a2` (#164) — programmatic `refresh()` on `ShortKitFeedController`, `ShortKitRefreshState` sealed types, `onRefreshStateChanged`, `FeedConfig.pullToRefreshEnabled`
- `e4500a9cc` — per-surface `debugPanel` prop on `ShortKitFeed`
- `f792053d9` — `FeedFilter.metadata` as `Map<String, List<String>>` (array OR filtering)
- `809362240` (#450) — `scrollToItem`, `active` prop on `ShortKitFeed` (+ `setFeedActive`), expanded `ContentItem` fields (`commentCount`, `fallbackUrl`, `downloadUrl`), SkTrace logging

Everything in those bullets should be documented as 0.3.0-pending (in-repo pubspec already reads `0.3.0`); the published 0.2.22 package lacks all of it.
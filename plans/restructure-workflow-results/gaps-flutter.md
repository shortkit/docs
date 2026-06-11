# Flutter docs gap analysis — `shortkit_flutter`

Docs reviewed: `local-fable-docs/sdk/{installation,configuration,feed,player,player-and-widget,overlays,carousel,identity,analytics}.mdx`, `guides/{content-types,language-detection,live-streams,upload-pipeline}.mdx`, `quickstart.mdx`. Core flows (init, feed embed, identity, signals, custom dimensions, filters, video overlays, PlayerTime/state) have solid Flutter tabs. The big problem: docs describe Flutter as far behind where it actually is.

## 1. UNDOCUMENTED (by integrator impact)

1. **Custom feed mode — entire Flutter API missing.** `ShortKitFeedController` (`setFeedItems`, `appendFeedItems`, `applyFilter`), `FeedCallbacks`, and `ShortKitController.preloadFeed(config, items)` appear nowhere. `guides/content-types.mdx` "Custom feed input (`FeedInput.video`)" (line ~236) has Swift/Kotlin/RN tabs but **no Flutter tab**; `FeedInput.imageCarousel`/`.videoCarousel` Dart shapes also undocumented. `installation.mdx` line 55 names `ShortKitFeedController` but nothing explains its use.
2. **`ShortKitFeed` callbacks — zero coverage.** `onLoop`, `onFeedTransition`, `onFormatChange`, `onContentTapped`, `onDismiss`, `onFeedReady`, `onDidFetchContentItems`, `onRemainingContentCountChange` props are entirely undocumented (no page documents Flutter feed events; `player.mdx` documents the equivalent iOS publishers only).
3. **`ShortKitPlayer` widget and `ShortKitWidget`** exist (published) but are documented only as "coming soon" (see Stale). Flutter `PlayerConfig`, `PlayerClickAction`, `WidgetConfig` (incl. `rotationInterval`, `cardCount`, `filter`, `feedConfig`), `ShortKitPlayer` props (`config`, `contentItem`, `active`, `onTap`) and `ShortKitWidget` props (`config`, `items`) — all missing from `player-and-widget.mdx`.
4. **`fetchContent({limit, filter})`** — `player-and-widget.mdx` "Fetching content" tabs cover iOS/Android/RN/Web; no Flutter tab despite the method existing on `ShortKitController`.
5. **Carousel and video-carousel overlays.** `ShortKitOverlayEngine.initialize(carouselOverlays:, videoCarouselOverlays:)`, `ShortKitCarouselOverlayBuilder` (`isActive`, `activeImageIndex`), `ShortKitVideoCarouselOverlayBuilder`, `VideoCarouselOverlayState`, and `FeedConfig.carouselOverlay`/`videoCarouselOverlay` — all shipped, all undocumented (`overlays.mdx` line 200 says coming soon).
6. **Storyboard API.** `prefetchStoryboard`, `getStoryboardData`, `StoryboardData`/`StoryboardTile` types — undocumented. `player.mdx` command table lists `seekThumbnail(at:)` with no note that Flutter instead exposes raw storyboard data.
7. **Controller observables not in `player.mdx` publisher table for Flutter:** `playerError` (`ValueNotifier<String?>`), `isActive`, `prefetchedAheadCount` is listed generically but the Flutter callback `onRemainingContentCountChange` replaces `remainingContentCount`. Also `ShortKit.maybeOf`, `ShortKitFeed.preloadId`/`startAtItemId`, and `debugPanel` (provider-level and per-feed) — no docs anywhere (confirm `debugPanel` is meant to be public before documenting).
8. **0.3.0-pending surface (merged, not on pub.dev 0.2.22 — document as unreleased):** `ShortKitFeedController.refresh()`, `ShortKitRefreshState`, `onRefreshStateChanged`, `FeedConfig.pullToRefreshEnabled`; `scrollToItem(itemId, animated:)`; `ShortKitFeed.active` prop; `ContentItem.commentCount`/`fallbackUrl`/`downloadUrl`; `FeedInput.video(origin:, fallbackUrl:)` + `ContentOrigin`; `VideoCarouselInput`/`VideoCarouselVideoInput` (breaking: playback-IDs only); `FeedFilter.metadata` array-OR.

## 2. STALE / WRONG

- **`player-and-widget.mdx` line 12:** "Single player and widget components are coming soon for the Flutter SDK" — both `ShortKitPlayer` and `ShortKitWidget` are shipped. Highest-priority fix; actively steers integrators away from existing features.
- **`overlays.mdx` line 200:** "Flutter currently supports only video overlays. Carousel and video-carousel overlay support is coming soon" — both exist.
- **`player-and-widget.mdx` line 307:** "`rotationInterval` … Flutter support is coming soon" — `WidgetConfig.rotationInterval` exists.
- **`configuration.mdx` Flutter `FeedConfig` tab (lines 160–175):** omits `carouselOverlay` and `videoCarouselOverlay`; the accompanying Note's claim that Flutter only has `overlay` is wrong. (`pullToRefreshEnabled` is 0.3.0-pending.)
- **`guides/content-types.mdx` line 319:** claims `origin` "is available on the iOS, React Native, and Flutter SDKs" — for Flutter it is merged but **not published** (pub.dev 0.2.22 lacks it). Ahead of reality until 0.3.0 ships.
- **`configuration.mdx` FeedFilter Flutter tab:** `metadata: Map<String, String>?` is correct for published 0.2.22 but will be `Map<String, List<String>>?` (array OR) in 0.3.0 — flag for update at release.
- **`player.mdx`/`overlays.mdx`:** Flutter `activeCue` typed as `VTTCue?` — the Dart type is `CaptionCue` (`src/types/caption_cue.dart`). Field names in the OverlayState table otherwise check out.
- **`player.mdx` line 469:** "On Flutter … `sendContentSignal` accepts the string literals" — true for `ShortKitController.sendContentSignal(String)`, but `ShortKitOverlayCommands.sendContentSignal` takes the typed `ContentSignal` enum. Half-wrong in the overlay context.
- **`installation.mdx` Flutter export table (lines 50–56):** lists only 4 exports; omits `ShortKitPlayer`, `ShortKitWidget`, `ShortKitOverlayEngine`, `ShortKitOverlayCommands`.

## 3. PHANTOM

- **`SurveyMode` on Flutter `FeedConfig`** (`configuration.mdx` lines 165, 174: `SurveyModeNone()` / `SurveyModeTemplate('default')`) — no such field or type exists in `flutter_sdk/lib` (verified `src/types/feed_config.dart`). Flutter has no survey surface at all.
- **`VTTCue`** as a Flutter type name — renamed/never existed; it's `CaptionCue`.
- `player.mdx` publisher table implies Flutter has `remainingContentCount` and `feedReady` notifiers — Flutter delivers these as `ShortKitFeed` callbacks (`onRemainingContentCountChange`, `onFeedReady`), not controller observables.

## 4. PLACEMENT NOTES

- **Feed events/callbacks have no home.** iOS gets publishers on `player.mdx`; Flutter's per-feed callback props fit neither `feed.mdx` (embed-focused) nor `player.mdx`. Suggest a "Feed events" section on `sdk/feed.mdx` with per-platform tabs.
- **Custom feed mode is documented only as a `FeedConfig` table row + a content-types subsection.** A dedicated "Custom feeds" page (covering `feedItems`, `setFeedItems`/`appendFeedItems`/`applyFilter`, `preloadFeed`/`preloadId`, refresh) would resolve the Flutter gap and the cross-platform scatter at once.
- **`sdk/carousel.mdx` has only iOS/RN tabs** with no statement about Flutter — should explicitly note programmatic carousel control is not available on Flutter (it genuinely lacks the carousel controller), to distinguish "undocumented" from "unsupported".
- **No versioning convention for unreleased surface.** The 0.3.0-pending items need an agreed marker (docs currently use "Available since SDK 0.2.36"-style notes; nothing for "unreleased").
- **Pull-to-refresh** (config + state machine + `refresh()`) is guide-worthy and fits no existing page cleanly — candidate new section on the proposed feed-events/custom-feeds pages at 0.3.0 release.
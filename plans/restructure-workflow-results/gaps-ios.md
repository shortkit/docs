# iOS docs gap analysis — v0.2.55 vs published docs

## 1. UNDOCUMENTED (ranked by integrator impact)

1. **Live streaming viewer surface (entire feature).** `guides/live-streams.mdx` covers the REST/broadcast side plus `isLive`/`currentViewers` fields only. Missing everywhere: `LiveOverlay`, `LiveEndedOverlay`, `LiveRoomMask` protocols; `FeedConfig.liveOverlay`/`liveEndedOverlay`/`liveRoomMask` modes (`LiveOverlayMode .none/.default/.custom`, `LiveEndedOverlayMode`, `LiveRoomMaskMode`); `FeedConfig.shouldExpandLiveRoom`; `FeedInput.liveStream(playbackId:)`; `player.liveStreamStatus`/`isLiveRoomExpanded` publishers; `player.dismissLiveRoom()`; `player.currentProgramDate()`; `LiveStreamStatus` enum; `ContentItem.endedAt`. The live-room expand/collapse concept is absent entirely.
2. **Downloads (entire feature, zero docs).** `shortKit.downloadVideo(_:mode:)`, `cancelDownload()`, `player.downloadCurrentItem(mode:) async -> URL`, `ShortKitDownloadDelegate` (start/progress/complete/fail), `DownloadMode` (`.nonInterruptive/.interruptive`), `ShortKitDownloadError`, `ContentItem.isDownloadable`/`downloadUrl`. (Skip `DownloadOverlayMode` — stub.)
3. **Feed view controller imperative API.** `sdk/feed.mdx` is embed-only. Undocumented: `setFeedItems(_:startAtId:)`/`appendFeedItems(_:)` (name-dropped in `configuration.mdx` with no owner or signature), `scrollToItem(id:animated:)`, `switchFeedSource(to:)`/`currentFeedSource`, `applyFilter(_:)`, `refresh()`, `startAtItemId` init param, `overlayView(forItemId:)`, deep-link seeding (`prependSeedItem(_:scrollToId:animated:)`, `seedThumbnail`, `SeedThumbnailResolver`), hooks `onDismiss`, `onFeedReady`, `onRemainingContentCountChange`, `onFeedTransition`.
4. **Feed lifecycle ownership.** `ShortKitFeedLifecycle` (`.automatic/.manual`), `lifecycle:` init param, `activate()`/`deactivate()`, `isActiveSurface` — and the **deprecation of `setBridgeManaged()`** (guidelines: deprecations always qualify).
5. **Pull-to-refresh.** `FeedConfig.pullToRefreshEnabled`, `ShortKitRefreshState`, `onRefreshStateChanged`, `ShortKitDelegate.didChangeRefreshState`.
6. **Preload & cold start.** `preloadFeed(filter:limit:)`, `preloadFeed(items:)`, `FeedPreload`, `FeedConfig.preload`/`coldStartEnabled`, `setColdStartQueue(_:)`, `clearColdStartCache()`.
7. **`ShortKitDelegate`** (`didTapContent`, `didFetchContentItems`) and `loadingViewProvider` init param — never mentioned.
8. **Player gaps.** Commands: `setFeedScrollEnabled(_:)`. Publishers: `isLiveRoomExpanded`, `liveStreamStatus` (ties to item 1).
9. **Single player & widget gaps.** `PlayerConfig.previewMode` (`.full/.instantClip(seconds:)`) and `feedConfig`; player VC's `setFeedItems(_:)`, `feedMask`, `onModalFeedPresented`, `onPreviewCompleted`.
10. **`ContentItem` table in `overlays.mdx`** omits `playbackId`, `fallbackUrl`, `downloadUrl`, `isDownloadable`, and all live fields.
11. **`FeedOverlay.captionTracksResolved(_:)`** (defaulted, but doc-worthy for custom-feed CC buttons) — verified in `Overlays/FeedOverlay.swift`.

## 2. STALE / WRONG

1. **`ShortKit` initializer is wrong on every page (won't compile).** Docs show `ShortKit(apiKey:config:userId:...feedItems:)` with `config: FeedConfig` required. Verified `ShortKit.swift:154`: init takes **no `config:` and no `feedItems:`**; config is passed to `ShortKitFeedViewController(shortKit:config:startAtItemId:lifecycle:)`. Affects Swift tabs in `configuration.mdx`, `feed.mdx`, `identity.mdx`, `overlays.mdx`, `player-and-widget.mdx`, `quickstart.mdx`. Highest-priority fix.
2. **`ShortKitFeedViewController(shortKit:)` / `ShortKitFeedView(shortKit:)`** signatures in `feed.mdx` are wrong — both require `config:`; SwiftUI wrapper is `init(shortKit:config:onFeedReady:)`.
3. **`FeedFilter.metadata` type and semantics.** Docs: `[String: String]`, "all pairs must match (AND)". Source (`FeedConfig.swift:35`): `[String: [String]]`, OR within each key. Every example (`metadata: ["country": "Japan"]`, language-filter snippets in `configuration.mdx` and likely `language-detection.mdx`) won't compile.
4. **`liveStreamStatus` enum missing `dvr`.** `live-streams.mdx` says `"idle" | "active" | "ended"`; `.dvr` shipped Jun 1 (#399, source-breaking for exhaustive switches — exactly the kind of change that must be documented).
5. **Pinned versions stale:** `0.2.22` in `installation.mdx` (×3) and `quickstart.mdx` (×2); current is `0.2.55`.
6. **`FeedInput.video` / `WidgetInput.video` missing `contentId:`** (#418) in `content-types.mdx` (line 240) and `player-and-widget.mdx` WidgetInput table.
7. **`content-types.mdx` FeedInput comment** ("other cases: .imageCarousel, .videoCarousel") omits `.liveStream(playbackId:)`; relatedly `live-streams.mdx` tells users to pass live playback IDs as `.video(...)` — the dedicated `.liveStream` case is the current surface.
8. **`configuration.mdx` FeedConfig listing** omits 7 current fields (`liveOverlay`, `liveEndedOverlay`, `liveRoomMask`, `coldStartEnabled`, `pullToRefreshEnabled`, `preload`, `shouldExpandLiveRoom`), so the "complete reference" claim is false.
9. **`player.mdx` synchronous accessors** says only `currentItemValue`/`playbackRateValue` exist; every publisher has a `*Value` accessor.
10. **`feed.mdx` line 8** says live streams "render as videos with an `isLive` flag" — understates the live-room/overlay machinery; also references "creating, broadcasting, and clipping" guide which has no SDK-side counterpart.

## 3. PHANTOM

1. **`FeedOverlay.resetPlaybackProgress()`** — documented as a required protocol method in `overlays.mdx` (table + both example conformances). Not in source; protocol is `attach`/`configure(with:)`/`activatePlayback`/`captionTracksResolved`. Examples as written won't match the protocol.
2. **`feedReady` publisher on `ShortKitPlayer`** (`player.mdx` table, `overlays.mdx` streams table) — no such publisher in `ShortKitPlayer.swift`; the real hook is `ShortKitFeedViewController.onFeedReady` (undocumented).
3. **`feedItems:` init parameter** on `ShortKit` — doesn't exist (see Stale #1); custom feeds seed via `feedVC.setFeedItems(_:)`.
4. *Verified non-phantoms:* `.swiftUI` overlay mode and `FeedSource.algorithmic` exist in source (survey's `.algorithm` claim is wrong) — do not "fix" these.

## 4. PLACEMENT NOTES

- **No SDK live-streams page.** Live viewer surface (item 1) doesn't fit `guides/live-streams.mdx` (API-centric) or `sdk/overlays.mdx` (already 53 KB). Wants a new page under "Build Your Experience" (e.g. `sdk/live`), with `guides/live-streams.mdx` linking to it for display.
- **No home for downloads** — new page (Users & Data or Build Your Experience).
- **Custom feed mode is orphaned** — split across `configuration.mdx` (phantom `feedItems:` param), `content-types.mdx` (FeedInput shape), and nowhere (feed VC methods). Needs a single "Custom feeds" section, likely on `sdk/feed.mdx`.
- **Feed VC controls/lifecycle/deep-linking** (items 3–5) suggest `feed.mdx` should grow from "embedding" into a full component reference.
- Only one version-availability note exists ("since 0.2.36" in `carousel.mdx`) — no convention for flagging additions like `.dvr` or `lifecycle:`.
- Vendor-name check: no "Mux" leaks in the published pages (the leaks flagged by the survey are source doc-comments only).

Key files: docs at `/Users/michaelseleman/orca/workspaces/shortkit-docs-repo/local-fable-docs/{sdk,guides}/`; verified source at `/Users/michaelseleman/orca/workspaces/shortkit/fabledocs/swift_sdk/Sources/ShortKit/` (`ShortKit.swift:154`, `Feed/FeedViewController.swift:373`, `Overlays/FeedOverlay.swift`, `Configuration/FeedConfig.swift`, `Configuration/OverlayMode.swift`).
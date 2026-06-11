# RN docs gap analysis — `@shortkitsdk/react-native`

Pages audited: `sdk/{installation,configuration,feed,player,player-and-widget,overlays,carousel,identity,analytics}.mdx`, `guides/{content-types,live-streams,upload-pipeline,language-detection}.mdx`, `quickstart.mdx` (RN/Expo tabs), verified against `react_native_sdk/src/{types.ts,index.ts,ShortKitProvider.tsx,useShortKitPlayer.ts}`.

## 1. UNDOCUMENTED (ranked by integrator impact)

1. **Custom feeds & the feed ref handle.** `ShortKitFeed` props `feedItems`, `startAtItemId`, `seedThumbnailUrl`, `active`, `preloadId`, per-feed `debugPanel`; `ShortKitFeedHandle` ref methods `setFeedItems(items, {startAt})`, `appendFeedItems`, `scrollToItem(id, {animated})`, `applyFilter(filter|null)`, `refresh()`. Nothing documents how RN does custom feed mode — worse, `sdk/configuration.mdx:104,233` tells readers to pass `feedItems` on `ShortKit.init` / call `setFeedItems()`, neither of which exists in RN as described.
2. **Feed event props.** `onLoop`, `onFeedTransition`, `onFormatChange`, `onContentTapped`, `onDismiss`, `onRefreshStateChanged`, `onDidFetchContentItems`, `onRemainingContentCountChange`, `onFeedReady` + `ShortKitRefreshState` — zero coverage (only the three carousel events in `sdk/carousel.mdx` are documented). `sdk/player.mdx`'s publisher table implies RN parity via `useShortKitPlayer`, but loop/transition/format events are feed props in RN, not hook state.
3. **`ShortKitCommands`** — the only command surface usable inside overlays — appears solely in `sdk/carousel.mdx`. Undocumented members: `setFeedScrollEnabled` (overlay scrubber gesture exclusivity; Android divergence), `downloadVideo(itemId, {mode, overlayMode})`/`cancelDownload`, `prefetchStoryboard`/`getStoryboardData` (RN's analog of `seekThumbnail`, which the player.mdx command table lists with no RN caveat).
4. **Overlay registration + prop contracts.** `registerOverlayComponent` / `registerCarouselOverlayComponent` / `registerVideoCarouselOverlayComponent` / `registerFeedMaskComponent`; `OverlayProps`, `CarouselOverlayProps`, `FeedMaskProps` shapes (only `VideoCarouselOverlayProps` is documented, in `sdk/overlays.mdx:1198`).
5. **Feed mask + push navigation (iOS-only):** `FeedMaskConfig`, `pushFeedScreen`/`popFeedScreen`, interactive swipe-back. Only the iOS-native `feedMask: FeedMaskMode` widget property is documented.
6. **Widget RN surface — all "Coming soon" stubs in `sdk/player-and-widget.mdx` (lines 349, 383, 417, 596, 649, 741)** despite shipping: `WidgetConfig.playbackMode` (`'singleVisibleRotating'|'allVisibleSimultaneous'`), `previewDuration`, `filter`, `feedConfig`, `feedMask`; props `onCardTap`, `active`, `feedItems`; the RN `WidgetInput` shape.
7. **`ShortKitPlayer` (RN):** `feedItems` (seeds expanded feed), `onTap`, `active` default semantics; `PlayerConfig.feedConfig`/`feedMask`.
8. **Provider props:** `loadingViewComponent`, `debugPanel`, `serverTracingEnabled`, `consoleTracingEnabled`.
9. **Misc:** `FeedConfig.pullToRefreshEnabled` and `FeedConfig.onDidFetchContentItems`; `FeedFilter` values now `string | string[]` (June 2026); `useShortKit().preloadFeed`; long-press `x`/`y` coordinates on `onVideoCarouselCellLongPress` (carousel.mdx event shape omits them); `ContentItem` fields `downloadUrl`, `videoWidth`/`videoHeight`/`aspectRatio` (overlays.mdx/content-types ContentItem tables omit them).

## 2. STALE / WRONG

1. **`ShortKitProvider` has no `config` prop** (`types.ts:351-368`), yet every RN example passes `config={{...}}` and `sdk/configuration.mdx:66-79` prints an interface with `config: FeedConfig` required. Config belongs on `<ShortKitFeed config={...}>`. Affects: configuration.mdx, feed.mdx, overlays.mdx, identity.mdx, analytics.mdx, installation.mdx, quickstart.mdx, player-and-widget.mdx — pervasive, highest-priority fix.
2. **Overlay examples use `useShortKitPlayer()` inside overlay components** — the hook is explicitly unavailable there (`useShortKitPlayer.ts:10-14`: overlays run in isolated surfaces, receive `OverlayProps`, command via `ShortKitCommands`). Wrong in `sdk/player.mdx` MinimalOverlay (RN tab), `sdk/overlays.mdx` ScrubberOverlay/CaptionOverlay RN tabs and the line-214 guidance "use the `useShortKitPlayer()` hook -- no protocol conformance is needed".
3. **`OverlayConfig` shape missing required `name`:** actual is `'none' | {type:'custom', name, component}` for all three overlay configs. Docs show `{type:'custom', component}` (`configuration.mdx:194`, `overlays.mdx:57,1091-1092`).
4. **`overlays.mdx:221`:** `config={{ videoOverlay: { mode: "custom", ... } }}` — wrong key and wrong discriminator, contradicting the same page's own note that RN uses `overlay`.
5. **Phantom hook fields in examples:** `isTransitioning` (`overlays.mdx` RN scrubber + caption examples) — use `feedScrollPhase`.
6. **Widget `items` typed/exemplified as `ContentItem[]`** (`player-and-widget.mdx:522-535`); actual prop is `items?: WidgetInput[]`.
7. **Hardcoded versions `0.2.22`** in installation.mdx/quickstart.mdx; current release is 0.2.55.
8. **`installation.mdx` RN exports table** lists only 4 exports and describes `useShortKit()` as "(`setUserId`, `clearUserId`)" — omits `fetchContent`, `preloadFeed`, plus `ShortKitPlayer`, `ShortKitWidget`, `useShortKitCarousel`, `ShortKitCommands`.

## 3. PHANTOM

1. **`surveyMode` / survey surface in RN** — `configuration.mdx:186,197` (`surveyMode?: SurveyMode` in the RN FeedConfig listing) and `overlays.mdx:1094,1102` (`surveyMode: {type:'template', name:'default'}` + note claiming RN supports a built-in survey template). No survey API exists on the RN surface at all.
2. **RN `FeedItem`, `SurveyItem`, `SurveyOption`, `AdSlot` types** in `guides/content-types.mdx` (RN tabs ~675, ~571) — not exported, not in `types.ts`.
3. **`ContentItem.isLive`** in `guides/live-streams.mdx:145` RN tab (also leans on the phantom `FeedItem` discriminated union) — live streaming has no RN surface.

## 4. PLACEMENT NOTES (IA signals)

- RN's overlay architecture (isolated surfaces, props-in/commands-via-`ShortKitCommands`, name-based registration) is structurally different from the iOS/Android protocol model; the shared-tab format on `sdk/overlays.mdx` systematically misdocuments it. RN needs its own overlay section or page.
- No existing page fits: **downloads** (`downloadVideo`/`cancelDownload`, overlay modes), **feed-mask push navigation**, **feed preloading** (`preloadFeed`/`preloadId`), **debug & tracing** (`debugPanel`, `consoleTracingEnabled`/`serverTracingEnabled`), **multi-feed/tab-focus patterns** (`active` prop, `surfaceId` routing — `surfaceId` is only documented on the carousel completion event).
- The feed ref handle wants a "Controlling the feed" section on `sdk/feed.mdx`; feed event props want an events table there too.
- When writing the new content, do not propagate source-comment vendor leaks: `previewDuration`/`useShortKitCarousel` comments name a third-party streaming vendor (use "streaming clip URL"); `seedThumbnailUrl` JSDoc names SDWebImage/expo-image internals (paraphrase); the `onVideoCarouselCellTap` JSDoc references a nonexistent `useShortKit().setMuted` (it lives on `ShortKitCommands`/`useShortKitPlayer`).

**Good coverage (no action):** `sdk/carousel.mdx` is accurate and current (hook, commands, tap/long-press, completion events); `sdk/identity.mdx` and `sdk/analytics.mdx` RN flows are correct apart from the provider-`config` phantom; content-types RN tabs for `FeedInput`/`origin`/`initialPageIndex`/`VideoCarouselVideoInput` match source.
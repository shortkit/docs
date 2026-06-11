# Web SDK survey — `/Users/michaelseleman/orca/workspaces/shortkit/fabledocs/web_sdk`

## Distribution & versioning

- **npm:** `@shortkitsdk/web` v**0.5.0** (`package.json`). ESM-first; exports: `.` → slim bundle (`hls.js` as optional peer dep), `./full` → bundle with HLS included. Only `dist/` is published.
- **CDN:** `scripts/deploy.js` uploads versioned, immutable UMD builds to `https://sdk.shortkit.dev/web/<version>/` (`shortkit.js`, `shortkit.min.js`, `shortkit.slim.js`, `shortkit.slim.min.js`). UMD global is `ShortKit`. Slim variant requires `window.Hls`; full variant bundles it.
- **Version drift flag:** `ShortKitVersion` constant in `core/shortkit.js:16` still reads `'0.4.0'` while `package.json` is `0.5.0` — docs should cite 0.5.0 but this is a repo inconsistency.
- Web SDK is **absent from `VERSIONS.md`** and from `scripts/release-all.sh`; release is `npm run build` + `npm run deploy` (no release-web script).
- `livekit-client` is a hard dependency (WebRTC live playback). Vendor name must not leak into docs — describe as "low-latency WebRTC playback".

## Entry & init

| Name | Kind | Purpose |
|---|---|---|
| `ShortKit` | class (default export) | SDK root; `new ShortKit({ apiKey, ... })` — throws without `apiKey`; injects styles, sets up identity, analytics, live monitor |
| Constructor options | config | `apiKey` (required, `pk_…`), `apiBase`, `userId`, `clientAppName`, `clientAppVersion`, `customDimensions`, `loadingView`, `onContentTapped`, `onRefreshRequested`, `onDidFetchContentItems`, `liveOverlay` (`'default'` \| `'none'` \| factory), `liveStatusPollIntervalMs` (default 30 s) |
| `sdk.fetchContent({limit, filter})` | method | Fetch feed items without rendering |
| `sdk.preloadFeed({limit, filter})` | method | Fetch + prefetch first item's thumbnail and stream manifest |
| `sdk.destroy()` | method | Tear down all surfaces, flush analytics, stop live monitor |
| `ShortKitVersion` | const | SDK version string |

Note: README shows `await sdk.init()` / `await feed.init()`, but `core/shortkit.js` has **no `init()` method** and `createFeed` calls `feed.init()` itself — README is stale vs code; verify before documenting.

## Surfaces (factories on `ShortKit`)

| Name | Kind | Purpose |
|---|---|---|
| `createFeed(el, {config})` → `FeedManager` | component | Full-screen/inline vertical swipe feed; auto-inits |
| `createPlayer(el, {config})` → `SinglePlayer` | component | Single embedded video that expands to a feed overlay on tap; `init()` / `initWithItems(items)`, `setScale/Padding/CornerRadius/ClickAction/Loop` |
| `createWidget(el, {config})` → `WidgetManager` | component | Multi-card rotating video widget (carousel-style cards) that expands to feed via `FeedView` FLIP animation |
| `FeedManager`, `EmbeddedFeedManager`, `SinglePlayer`, `WidgetManager`, `FeedView`, `createFeedItem` | named exports | Direct-construction escape hatches (EmbeddedFeedManager = stripped feed used inside player/widget overlays) |

**FeedManager public methods:** `init`, `destroy`, `play`, `pause`, `seek`, `seekAndPlay`, `setMuted`, `skipToNext/Previous`, `navigateTo/Up/Down`, `setPlaybackRate`, `setCaptionsEnabled`, `selectCaptionTrack`, `sendContentSignal`, `setMaxBitrate`, `seekThumbnail`, `setFeedItems`, `appendFeedItems`, `applyFilter`. EmbeddedFeedManager mirrors most, plus `getActiveVideoElement`, `getActiveItemRect`, `startObserver`.

## Config factories (`core/config.js`)

| Name | Defaults |
|---|---|
| `createFeedConfig` | `feedHeight: 'fullscreen'` (or `{type:'percentage', value}`), `muteOnStart: true`, `autoplay: true`, `feedSource: 'algorithmic'\|'custom'`, `filter`, `overlay` (callback receiving `(overlayEl, {item, player, feed})`), `preload` |
| `createPlayerConfig` | `cornerRadius: 12`, `clickAction: 'feed'\|'mute'\|'article'\|'none'`, `autoplay`, `loop`, `muteOnStart`, `overlay` |
| `createWidgetConfig` | `cardCount: 3`, `cardSpacing: 8`, `cornerRadius: 12`, `rotationInterval: 10000`, `autoplay`, `muteOnStart`, `loop`, `clickAction`, `filter`, `overlay` |
| `createFeedFilter` | `tags`, `section`, `author`, `contentType`, `metadata` (string or string[] per key → OR filtering; metadata support added 2026-05, commit `cc7ff16a7`) |

## Player interface (`sdk.player`, singleton `ShortKitPlayer`)

- **State getters:** `playerState`, `currentItem`, `time`, `isMuted`, `playbackRate`, `captionsEnabled`, `activeCaptionTrack`, `activeCue`, `feedScrollPhase`, `prefetchedAheadCount`, `remainingContentCount`.
- **Events via `on/off`:** `stateChange`, `itemChange`, `mutedChange`, `playbackRateChange`, `captionsChange`, `captionTrackChange`, `cueChange`, `feedScrollPhase`, `prefetchedAheadCountChange`, `remainingContentCountChange`, plus live events `liveStatusChange`, `viewerCountChange`, `liveItemActivate`, `liveItemDeactivate`.
- **Commands** proxied to active surface: `play`, `pause`, `seek`, `seekAndPlay`, `setMuted`, `skipToNext/Previous`, `setPlaybackRate`, `setCaptionsEnabled`, `selectCaptionTrack`, `sendContentSignal`, `setMaxBitrate`, `seekThumbnail`.
- `currentProgramDate()` — wall-clock `Date` of current live frame (for server-side clipping), `null` for VOD.

## Identity (`core/identity.js`)

- Auto-generated anonymous ID persisted in `localStorage` (`sk_anonymous_id`); `sdk.setUserId(id)` / `sdk.clearUserId()` (clear rotates anonymous ID); identity-resolve call links anon→user.

## Analytics (automatic; `EngagementTracker` + `EventBatcher`)

Events emitted: `feedEntry`, `feedExit`, `impression`, `playStart`, `firstFrame` (TTFF), `watchProgress`, `completion`, `swipe`, `rebuffer`, `qualityChange`, `error`, `interaction`, `contentSignal`, `playbackFallback`, `viewEnd`. Batched POSTs with `sendBeacon` flush on unload. **iOS analytics parity landed in 0.5.0** (commit `633c9f978`, May 2026).

## Live streaming (public)

- Feed items with `contentType: 'live_stream'` get automatic LIVE badge, status polling, viewer-count heartbeat across all four surfaces. Configurable via `liveOverlay` ('default'/'none'/factory returning `{mount, update, destroy}`).
- Named exports: `LiveStreamMonitor`, `LiveViewerHeartbeat`, `fetchLiveStreamStatuses`.
- WebRTC low-latency playback wired into FeedManager/SinglePlayer (May 2026).
- **Not public:** `live/whip-publisher.js` (browser broadcasting) and `live/livekit-viewer.js` exist but are NOT exported from `shortkit.js` — used only by `demos/studio.html`. Do not document as public yet.

## Recent additions (git, Apr–Jun 2026)

- `0.5.0` analytics parity with iOS (~May), WebRTC live playback in feed/player (~May), FeedFilter `metadata` array OR-filtering (Jun, `cc7ff16a7`), studio/WHIP broadcaster demos (May–Jun, internal), live-stream support originally `f27374093` (SHO-50).

## Gaps vs native SDKs

- **No ads support** (native SDKs have `sdk/ads.mdx` surface) — zero ad/survey code in web SDK.
- **No surveys** rendering.
- **No video carousel component** matching native "carousel" (the widget is the closest analog but differently shaped).
- **No language detection guide surface.**
- **Live broadcasting not public** (iOS has it; web has demo-only WHIP publisher).
- **Not in `VERSIONS.md` or the docs install snippets** (current docs code tabs are Swift/Kotlin/Flutter/RN only) — Web SDK appears entirely undocumented today.
- Versioning scheme diverges (0.5.0 vs native 0.2.55).
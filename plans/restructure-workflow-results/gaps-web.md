All verification done. Compiling the report.

# Web SDK docs gap analysis

**Docs state:** Web is covered via "Web" tabs across `quickstart.mdx`, `sdk/installation.mdx`, `sdk/configuration.mdx`, `sdk/feed.mdx`, `sdk/player.mdx`, `sdk/player-and-widget.mdx`, `sdk/overlays.mdx`, `sdk/identity.mdx`, `sdk/analytics.mdx`, `guides/content-types.mdx`, `guides/language-detection.mdx`. The survey's claim that "Web SDK appears entirely undocumented" is **wrong**. Coverage of identity, analytics, content-types, language detection, and basic feed/overlay usage is accurate. The gaps below are verified against `web_sdk/` source.

## 1. UNDOCUMENTED (ranked by integrator impact)

1. **Live streaming on Web — zero coverage.** `guides/live-streams.mdx` § "Displaying live streams in the feed" has Swift/Kotlin/RN tabs only. Missing: automatic LIVE badge + viewer count (`liveOverlay: 'default' | 'none' | factory` constructor option), `liveStatusPollIntervalMs` (default 30s), player live events (`liveStatusChange`, `viewerCountChange`, `liveItemActivate`, `liveItemDeactivate`), low-latency WebRTC playback in feed/player, and `sk.player.currentProgramDate()` (wall-clock `Date` of the current live frame — pairs directly with the guide's existing clip-creation section). Do **not** document browser broadcasting (`whip-publisher.js` is demo-only, not exported).
2. **Single-player/widget real APIs.** `SinglePlayer.init()` / `initWithItems(items)` / `setScale` / `setPadding` / `setCornerRadius` / `setClickAction` / `setLoop`, and `WidgetManager.init()` are nowhere in docs (instead phantom methods are shown — see §3). `createPlayer`/`createWidget` do **not** auto-init (`core/shortkit.js:139-151`); docs never say an init call is required.
3. **Constructor options:** `loadingView`, `onContentTapped`, `onRefreshRequested`, `onDidFetchContentItems`, `liveOverlay`, `liveStatusPollIntervalMs`, `clientAppVersion` (supported, `core/shortkit.js:28`, but omitted from every Web init example). The configuration.mdx Web init block shows only `apiKey`/`userId`/`clientAppName`/`customDimensions`.
4. **Custom-feed methods on the web feed:** `setFeedItems`, `appendFeedItems`, `applyFilter` (`feed/feed-manager.js:303-354`). `configuration.mdx:233` references `setFeedItems()/appendFeedItems()` generically but no Web example exists anywhere; web has no `feedItems` constructor param, so these methods are the only custom-feed path.
5. **`sk.preloadFeed({limit, filter})`** — not documented.
6. **`clickAction: 'article'`** — valid web enum value (`core/config.js` `VALID_CLICK_ACTIONS`); the click-actions table (`player-and-widget.mdx:793-799`) lists only `feed`/`mute`/`none`.
7. **FeedFilter `metadata` array values (OR within a key)** — `createFeedFilter.toQueryParams` accepts `string | string[]` per key (commit `cc7ff16a7`, Jun 2026); docs say only `Record<string, string>`.
8. **npm package structure:** ESM `.` (slim, `hls.js` optional peer dep) vs `./full` export — installation.mdx documents slim/full for CDN only; npm section never mentions that the default import requires `hls.js`. Also no Web entry in installation's "Package structure" tabs.
9. **Web player getters** `activeCaptionTrack`, `activeCue`, `feedScrollPhase`, `prefetchedAheadCount`, `remainingContentCount` — exist on `sk.player` but the synchronous-accessors Web tab (`player.mdx:153-163`) lists only 5 of 10. Web command examples also omit `seekAndPlay`, `skipToPrevious`, `setMaxBitrate`, `seekThumbnail` (all exist).
10. **`onFeedReady`** — used in a `feed.mdx:118` example but never defined as a `createFeed` option.

## 2. STALE / WRONG

- **CDN version `0.3.0`** hardcoded in 6 places: `quickstart.mdx:89,250`, `installation.mdx:260,267,433`, `configuration.mdx:730`. Published version is **0.5.0**. (Repo-side: `web_sdk/core/shortkit.js:16` `ShortKitVersion` also stale at `'0.4.0'` — fix source, cite 0.5.0.)
- **`metadata` filter "All pairs must match (AND)"** (`configuration.mdx:394` and Web tab comment ~383) — values can now be arrays with OR semantics within a key.
- **Publisher reference table** (`player.mdx:100-116`) presents `didLoop`, `feedTransition`, `formatChange`, `feedReady` as cross-platform; none exist on web (`player/player-interface.js` STATE_EVENTS). Needs platform-availability annotations. (`timeUpdate` does exist — docs correct there.)
- **`rotationInterval` "Android and React Native only"** (`player-and-widget.mdx:307`) — web widget is also timer-based (default `10000` ms, `core/config.js`); note excludes web incorrectly.

## 3. PHANTOM

- **`player.setItem(items[0])`** — `player-and-widget.mdx:265`. No such method on `SinglePlayer` (`single-player/single-player.js`). Real API: `player.init()` (self-fetches) or `player.initWithItems(items)`. As written, the example renders nothing.
- **`widget.setItems(items)`** — `player-and-widget.mdx:569`. No such method on `WidgetManager`; it fetches its own content via `config.filter` after `widget.init()`. Example is doubly broken (no init, phantom method).
- **`scrollAxis: 'horizontal'` Web example** — `configuration.mdx:307-313`. Web `createFeedConfig` has no `scrollAxis`; the key is silently ignored. Web tab should be removed or marked unsupported.
- **`sdk.init()`** — not in docs (good); note the web README in the monorepo is stale on this, docs already match code.

## 4. PLACEMENT NOTES (IA signals)

- **No web-platform page exists.** Web-only surface (CDN/UMD vs npm slim/full distribution, factory-returns-manager pattern, `preloadFeed`, `loadingView`, content-tap/refresh callbacks, `liveOverlay` factory contract `{mount, update, destroy}`) has no natural home in the current tab-per-platform layout; consider an `sdk/web`-style page or a "Web surfaces" section.
- **Web live support needs a Web tab in `guides/live-streams.mdx`** plus a place for `currentProgramDate()` (could live in `sdk/player.mdx` with a web-only marker).
- **`sdk/carousel.mdx` and ads/surveys correctly exclude web** — content-types.mdx Web tabs already say "rendering deferred — coming soon" for carousels/surveys; keep that pattern, don't invent coverage.
- **Version drift:** web versions independently (0.5.0 vs native 0.2.55) and is absent from `VERSIONS.md`/`release-all.sh`; docs version-bump tooling keyed to native releases will keep missing the web CDN snippets — flag for the docs-update pipeline.
- **Intentionally undocumented escape hatches** (`FeedManager`/`EmbeddedFeedManager`/`FeedView`/`createFeedItem` named exports, `LiveStreamMonitor`, `fetchLiveStreamStatuses`): leave out unless a use case demands them.
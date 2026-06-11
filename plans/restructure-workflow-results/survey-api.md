# ShortKit Public REST API Surface — Survey

All routes mounted under `/v1` (`api/app/main.py:318-350`). Auth kinds: **pk** = publishable key via `X-API-Key` (`require_publishable_key`); **sk** = secret key via `Bearer sk_...` (`require_secret_key`); **sk/JWT** = `require_portal_or_secret_key` (public via sk; also accepts portal JWT); **any** = `require_any_key` (pk or sk). Excluded as non-public: `admin`, `org`, `billing`, `invitations`, `portal_auth`, `projects`, `import_dashboard`, all `/internal/*` workers + webhooks. All responses wrap payloads in `{data, meta: {request_id}}`.

## Feed (pk — SDK runtime)
- `GET /v1/feed` | pk | Paginated mixed feed (video, image_carousel, video_carousel, ad slots, live) | `limit` (1–50), `cursor`; headers `X-User-Id`, `X-Session-Id`
- `GET /v1/feed/videos` | pk | Video-only feed | same params
- `GET /v1/feed/filter` | pk | Feed filtered by `tags`, `section`, `author`, `content_type`, and repeated `metadata.<key>=` params (OR semantics within a key — **changed 2026-06-03**); requires ≥1 filter. Redirects to filtered discovery when org has discovery enabled (**2026-05-29**)
- `GET /v1/feed/filter/discovery` | pk | **NEW 2026-05-29** — filtered + randomized per-viewer deduplicated feed
- `GET /v1/feed/discovery` | pk | **NEW 2026-05-24** — randomized per-viewer deduplicated feed (Redis-backed, returns `next_cursor=discovery`)
- Feed item fields: `type`, `id`, `playbackId`, `title`, `description`, `duration`, `streamingUrl`, `thumbnailUrl`, `captionTracks[]` (`language`,`label`,`source`,`url`), `customMetadata`, `author`, `section`, `publisherUrl`, `downloadUrl`, `isLive`, `liveStreamId`, `liveStreamStatus` (incl. derived `"dvr"` — **NEW 2026-06-01**), `startedAt`, `streamingProtocol` (`hls`|`webrtc`), `currentViewers`, `videoWidth`/`videoHeight`/`aspectRatio` (**NEW 2026-05-12**)

## Content (sk/JWT)
- `POST /v1/content` (201) | Create content shell | body: `contentType` (default `video`), `title`, `description`, `tags[]`, `publishAt`, `expiresAt`, `section`, `author`, `origin` (`ios_upload`|`other`)
- `GET /v1/content` | List | `limit` (≤100), `cursor`, `status`, `tags`, `uploadStatus`, `publishStatus`
- `GET /v1/content/search` | Search | `q` (1–500 chars), `limit` (≤50)
- `GET /v1/content/count` | Count | `status`, `uploadStatus`, `publishStatus`
- `GET /v1/content/{id}` | Retrieve (echoes `externalId` — **2026-04-07**; preview URLs **2026-05-12**)
- `PATCH /v1/content/{id}` | Partial update | raw JSON: `title`, `description`, `tags`, `section`, `author`, `publishAt`/`expiresAt` (validated future, expires>publish), `publishStatus` (publish gate: `upload_status == "ready"`; publishing clears `publishAt`), `customMetadata` (merge; `null` deletes key), `origin` (**added 2026-04-16**)
- `DELETE /v1/content/{id}` | Soft delete (**2026-04-06**)
- Carousel images: `POST .../images` (multipart `file`, `position`, `altText`), `DELETE .../images/{image_id}`, `PUT .../images/order` (`imageIds[]`)
- Video carousels: `POST .../videos` (`videos[]: {contentId, position}`), `PUT .../videos/order` (`videoIds[]`), `DELETE .../videos/{entry_id}`
- Captions: `POST .../captions` (multipart `file`, `language`, `label`), `DELETE .../captions/{track_id}`
- Publication URLs: `POST .../publication-urls`, `PUT .../publication-urls/order`, `PUT/DELETE .../publication-urls/{url_id}`

## Ingestion
- `POST /v1/content/upload` (201) | **any** | Direct-upload URL issuance | body: `contentType`, `title`, `description`, `tags`, `customMetadata`, `section`, `author`, `publishAt`, `expiresAt`, `generateSubtitles`, `callbackUrl`, `externalId`, `origin`, `images[]: {position, altText}` → returns upload URL(s), image slots have `uploadUrl`, `maxSizeBytes` (10 MB)
- `POST /v1/content/import` (201) | sk/JWT | Bulk URL import (≤100 items) | items: same metadata + `sourceUrl`, `externalId`, `encodingTier`, `images[]`; top-level `callbackUrl` → response `{data[] (id, status, error), summary {total, succeeded, failed}}`
- `POST /v1/content/import/tiktok` (201) | sk/JWT | Import from TikTok URLs (≤20) | `urls[]`, `maxVideosPerProfile` (≤10000), `callbackUrl`
- `POST /v1/content/import/instagram` (201) | sk/JWT | Same for Instagram Reels | `urls[]`, `maxReelsPerProfile`, `callbackUrl`
- `GET /v1/content/import/status` | sk/JWT | Async import job status
- `POST /v1/content/{id}/finalize` | sk/JWT | Finalize a direct upload

## Downloads
- `GET /v1/content/{id}/download-url` | **any** | MP4 download URL | resolves stream UUIDs too (**2026-06-02**); priority: watermarked MP4 (**per-org watermarking 2026-05-28**) → 202 `{status: "preparing"}` → static rendition; 404 if downloads disabled. Response: `{downloadUrl, status}`
- `GET /v1/content/{id}/download` | any | Streams the watermarked MP4 directly

## Live streams (resource **NEW 2026-04-15**)
- `POST /v1/live-streams` (201) | sk/JWT | Create stream | `title`, `protocol` (`hls`|`webrtc` — **webrtc added 2026-06-02**), `latencyMode` (`low`|`reduced`|`standard`), `reconnectWindow` (0–1800s), `reconnectSlateUrl` (**2026-04-30**), `customMetadata` (**NEW 2026-06-04**) → `id`, `playbackId`, `status`, `rtmpUrl`, `streamKey`, `latencyMode`, `reconnectWindow`, `startedAt`/`endedAt`/`createdAt`
- `GET /v1/live-streams` | sk/JWT | List | `limit`, `status`
- `GET /v1/live-streams/status` | **pk** | SDK polling by `playback_ids` (comma-separated, capped) → per-id `{status, startedAt, endedAt, currentViewers}` (**currentViewers 2026-04-27**; returns `ended` post-VOD-swap **2026-04-30**)
- `GET /v1/live-streams/{id}/viewer-token` | **pk** | Short-lived WebRTC viewer JWT (webrtc streams only; 409 if not active) — **NEW 2026-05-24**
- `GET /v1/live-streams/{id}/publisher-token` | **sk** | WebRTC publisher JWT — **NEW ~2026-05/06**
- `POST /v1/live-streams/{id}/start` | **sk** | Mark webrtc stream active + auto-publish
- `GET /v1/live-streams/{id}` | sk/JWT | Retrieve
- `POST /v1/live-streams/{id}/end` | sk/JWT | End stream (sets `ended`, `endedAt`)
- `DELETE /v1/live-streams/{id}` | sk/JWT | Delete (must be `ended`)
- `POST /v1/live-streams/{id}/clips` (201) / `GET .../clips` | sk/JWT | Create/list VOD clips (**2026-04-17**) | `clips[] (startSec, endSec, title)` ≤20, `callbackUrl`; requires active/ended stream
- `POST /v1/demo/live-streams/{id}/clips` | pk | Demo clip proxy for demo app (**2026-04-17**) — probably exclude from docs

## Surveys
- CRUD, all sk/JWT: `POST /v1/surveys`, `GET /v1/surveys` (`status`), `GET/PUT/DELETE /v1/surveys/{id}`, `PUT /v1/surveys/priorities` (`surveyIds[]`) | fields: `title`, `question`, `status` (`draft`...), `priority`, `autoAdvanceDelay`, `options[] {text, position}`, `placementRules[] {ruleType, ruleValue}`
- `POST /v1/surveys/{id}/responses` (201) | **pk** | SDK submits answer | `optionId`, `userId`, `sessionId`, `deviceInfo`

## Identity & events (pk — SDK runtime)
- `POST /v1/identity/resolve` | pk | Merge anonymous → known user | `anonymousId`, `userId`
- `POST /v1/events` (202) | pk | Batch telemetry ingest (≤100) | events: `type`, `contentId`, `playbackId` (**added 2026-05-27**), `userId`, `sessionId`, `viewSessionId`, `timestamp`, `data` → `{received, failed}`
- `GET /v1/captions?playback_id=` | pk | Resolve ready caption tracks for a playback ID → `[{language, label, source, url}]` (always-on transcription/language detection **2026-06-01**)

## Analytics (all sk/JWT)
Common params: `timeframe[]` (`"7:days"`, `"24:hours"`, or two epoch seconds) and `filters[]` (`key:value`, keys from VALID_DIMENSIONS).
- `GET /v1/metrics/{metric}` | scalar aggregate | `measurement` override; metrics: `views, unique_viewers, started_views, exits_before_video_start, completions, watch_time, playing_time, video_startup_time, rebuffer_*(4), seek_count, seek_duration, avg_bitrate, rendition_changes, feed_sessions, avg_session_depth, avg_session_duration`
- `GET /v1/metrics/{metric}/breakdown` | by `dimension` (required), `limit` ≤100, `order_by` (`value`|`views`)
- `GET /v1/metrics/{metric}/timeseries`, `GET /v1/metrics/{metric}/heatmap`
- `POST /v1/metrics/batch` | multiple metric queries in one call | `queries[]`, `timeframe`, `filters`
- `GET /v1/views` (`viewer_id`, `content_id`, `order_by`, `order_direction`, `limit` ≤100, `page`), `GET /v1/views/{view_id}`, `GET /v1/exports/views` (`format=json|csv`)
- `GET /v1/events/explore` (`event_type`, `content_id`, `viewer_id`, paging), `GET /v1/events/types`, `GET /v1/events/views`, `GET /v1/events/sessions` (repeated `event_type`, `count_only`) — views/sessions perf-reworked **2026-05-27**
- `GET /v1/dimensions/{dimension}/values` | distinct values | `limit` ≤500; dimensions incl. `content_id, video_title, device_*, os_*, connection_type, country/region/city, viewer_id, client_app_*, custom_1–5, captions_enabled, completed, exit_before_start, looped`

## Ad config (sk)
- `GET /v1/ad-config` / `PUT /v1/ad-config` | per-org ad settings | fields: `enabled`, `frequency`, `firstAdOffset`, `maxPerPage`, `adTagUrl`, `adUnitId`, `skipPolicy`, `skipDelaySeconds`, `defaultTargeting`, `native*` (8 fields), `sponsoredStreamingUrl`/`sponsoredHeadline`/`sponsoredCta` (**sponsored fields 2026-04-06**)

## Vendor-name caveats for docs
Internal code exposes `muxLiveStreamId` in live-stream responses and `playback_id` is described internally as "Mux playback ID" — docs must use neutral terms ("provider stream ID", "playback ID"). `streamingProtocol`/tokens come from LiveKit — document as "WebRTC".

Key files: `api/app/routers/{feed,content,live_streams,ingestion,downloads,surveys,identity,event_ingest,captions,metrics,views,event_explore,dimensions,ad_config}.py`; schemas in `api/app/schemas/{carousel,ingestion,live_streams,live_clips,events,identity,surveys,ads}.py`; enums in `api/app/analytics_utils.py`.
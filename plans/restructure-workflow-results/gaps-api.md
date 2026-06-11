# Docs Gap Analysis — `api` domain

Coverage of the documented surface (content CRUD, upload/import, live-stream CRUD/clips, surveys, ad-config object, 3 metrics endpoints) is solid and high quality. The gaps are concentrated in (a) endpoints shipped Apr–Jun 2026, (b) the entire analytics surface beyond 3 endpoints, and (c) the pk-key feed/runtime surface, which has no API Reference home at all.

## 1. UNDOCUMENTED (by integrator impact)

**Entire endpoint groups missing:**
- **Feed** — `GET /v1/feed`, `/feed/videos`, `/feed/filter`, `/feed/discovery` (new 2026-05-24), `/feed/filter/discovery` (new 2026-05-29). No API Reference pages exist anywhere; the feed-item shape is only hinted at in a `<Note>` on `api/content/object.mdx` and the ad-slot shape inside `api/ad-config/object.mdx`. Highest-impact gap: this is the core pk surface. Includes undocumented fields `streamingProtocol`, `downloadUrl`, `publisherUrl`, `captionTracks[]`, `videoWidth`/`videoHeight`/`aspectRatio` (2026-05-12), and `metadata.<key>` filter params with OR semantics (changed 2026-06-03).
- **Downloads** — `GET /v1/content/{id}/download-url` and `/download` (any-key): watermarking, 202 `{status:"preparing"}` flow, stream-UUID resolution (2026-06-02). Zero docs.
- **Analytics, ~80% missing** — `api/analytics/metrics.mdx` lists 6 metrics; ~19 exist (`started_views`, `exits_before_video_start`, `rebuffer_*` ×4, `seek_*`, `avg_bitrate`, `rendition_changes`, `feed_sessions`, `avg_session_depth`, `avg_session_duration`). Undocumented endpoints: `GET /metrics/{metric}/breakdown`, `/heatmap`, `POST /metrics/batch`, `GET /v1/views`, `/views/{view_id}`, `/exports/views`, `/events/types`, `/events/views`, `/events/sessions`, `GET /v1/dimensions/{dimension}/values`. The `filters[]` query param (key:value dimensions) is undocumented on every metrics page.
- **WebRTC live tokens** — `GET /v1/live-streams/{id}/viewer-token` (pk, 2026-05-24), `GET .../publisher-token` (sk), `POST .../start` (sk). Without these, the documented `protocol: "webrtc"` cannot actually be consumed.
- **Identity & event ingest** — `POST /v1/identity/resolve` and `POST /v1/events` have no reference pages (`event-object.mdx` describes the shape but not the ingest endpoint or its 202 `{received, failed}` response, ≤100 batch limit, or new `playbackId` event field, 2026-05-27). `GET /v1/captions?playback_id=` also undocumented.
- **Content sub-resources** — no reference pages for caption upload (`POST/DELETE .../captions`), carousel images (`POST/DELETE .../images`, `PUT .../images/order`), publication URLs (4 endpoints), `POST /v1/content/{id}/finalize`, `POST /v1/content` (create shell), or `GET /v1/content/import/status`. Video-carousel endpoints are mentioned only in prose.

**Missing params/fields on existing pages:**
- `live-streams/create.mdx`: `customMetadata` (2026-06-04), `reconnectSlateUrl` (2026-04-30).
- `live-streams/status.mdx`: response omits `currentViewers` (2026-04-27); no mention that `ended` is returned post-recording-swap.
- `content/object.mdx` + `live-streams/object.mdx`: `liveStreamStatus`/`status` enums omit derived `"dvr"` value (2026-06-01).
- `content/list.mdx`: `status` and `publishStatus` query params exist but aren't documented. `content/count.mdx`: same for `status`/`publishStatus`.
- `content/upload.mdx`: `externalId` body param missing (referenced only in callback prose).
- `content/import.mdx`: per-item `encodingTier`; `maxVideosPerProfile`/`maxReelsPerProfile` on platform imports; ≤20 URL cap on tiktok/instagram.
- `ad-config/object.mdx` + `update.mdx`: `sponsoredStreamingUrl`, `sponsoredHeadline`, `sponsoredCta` (2026-04-06).
- Surveys: `PUT /v1/surveys/priorities` has no page and no nav entry.

## 2. STALE / WRONG

- **`api/authentication.mdx` "Endpoints by key type" table is materially wrong**: lists `GET /v1/content` and `GET /v1/content/{id}` as publishable-key endpoints (they're secret-key; the pk read path is `/v1/feed`); lists `/v1/analytics/*` (real paths are `/v1/metrics`, `/v1/views`, `/v1/events/*`); omits feed, identity, captions, live-stream status/viewer-token.
- `content/list.mdx` footer: "Additional filters (by `publishStatus`…) are coming soon" — `publishStatus` and `status` ship today.
- `content/upload.mdx` `<Info>`: "client-side uploads guide is coming soon" — `guides/upload-pipeline` exists in nav.
- `content/upload.mdx` video-carousel example posts `{"videoContentId": ...}` one at a time; actual body is `{"videos": [{"contentId", "position"}]}` (batch). Wrong request shape.
- `content/import.mdx`: "TikTok auto-expands up to 50 recent videos" — actual control is `maxVideosPerProfile` (≤10000); claims Instagram accepts only Reel/video URLs, but profile expansion (`maxReelsPerProfile`) exists.
- `live-streams/create.mdx` + `object.mdx`: WebRTC sections predate the token flow — "the broadcast workflow is identical — your encoder still connects via the `rtmpUrl`" conflicts with the publisher-token/`start` flow; needs verification and rework alongside the new token endpoints.
- `live-streams/object.mdx` lifecycle: "a stream can transition `idle` → `active` only once… cannot be restarted" — backend supports reactivation after idle (re-publish on reconnect); verify before keeping this claim.
- `ad-config/object.mdx`: "portal JWTs are not accepted" — verify; survey marks ad-config as sk-only, so likely fine, but the sponsored fields make the object stale regardless.

## 3. PHANTOM

- `api/authentication.mdx` best-practices accordion: `POST /v1/org/rotate-secret-key` — org endpoints are non-public; the same page elsewhere says rotation happens in the portal. Remove the endpoint reference.
- Same page's pk table entries `GET /v1/content`, `GET /v1/content/{id}` (don't exist under pk auth) and `/v1/analytics/*` (path never existed).

## 4. PLACEMENT NOTES (IA signals)

- **No "Feed" group** in the API Reference tab — needed for `/feed*`, the feed-item object, and ad-slot shape (currently squatting in ad-config). Discovery/filter semantics deserve their own page.
- **No home for pk "SDK runtime" endpoints** (events ingest, identity resolve, captions lookup, live status, viewer-token, survey responses) — consider an "SDK Runtime" or "Client endpoints" group; today they're scattered or absent.
- **Downloads** fit under Content but the watermark/preparing lifecycle may warrant its own page.
- **Callbacks/webhooks** are documented twice (upload.mdx, import.mdx) with near-identical retry sections, and clips add a third `callbackUrl`; a shared "Callbacks" page would consolidate.
- **Analytics group** needs restructuring into Metrics / Views / Events / Dimensions subgroups once the missing endpoints are added.
- Exclude `POST /v1/demo/live-streams/{id}/clips` (demo-only) — correctly absent today.

Key files: docs at `/Users/michaelseleman/orca/workspaces/shortkit-docs-repo/local-fable-docs/api/` and `docs.json`; source routers at `/Users/michaelseleman/orca/workspaces/shortkit/fabledocs/api/app/routers/`.
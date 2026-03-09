# API Engineering TODO

Work needed to make the codebase match the API reference documentation.

Tested against local API on 2026-03-08.

---

## 1. Content Object: Split `status` into `uploadStatus` + `publishStatus`

**Current:** API returns `status` (values: `waiting_for_upload`, `uploading`, `queued`, `processing`, `ready`, `error`, `archived`)
**Docs say:** `uploadStatus` (pending, processing, ready, error) + `publishStatus` (published, unpublished)

### Database & Model
- Add `upload_status` column (values: `pending`, `processing`, `ready`, `error`)
- Add `publish_status` column (values: `published`, `unpublished`)
- Migrate existing `status` values:
  - `waiting_for_upload` / `uploading` / `queued` → `upload_status: "pending"`
  - `processing` → `upload_status: "processing"`
  - `ready` → `upload_status: "ready"`, `publish_status` depends on org auto-publish setting
  - `error` → `upload_status: "error"`
  - `archived` → keep as soft-delete mechanism (or use `deleted_at`)
- Drop old `status` column after migration

### API Serialization — fields to REMOVE from public responses
- `pinPosition` — internal feed ordering, keep in DB/portal only
- `isSuppressed` — replaced by `publishStatus: "unpublished"`
- `publicationUrls` — internal
- `views` — currently a denormalized count (e.g. `5636`), use metrics API instead

### Fields to KEEP (now documented)
- `maxFrameRate` — useful video metadata (e.g. `60`)
- `videoQuality` — quality tier (`"basic"` or `"plus"`)
- `resolutionTier` — resolution tier (`"SD"`, `"HD"`, `"FHD"`, `"UHD"`)
### API Serialization — fields to RENAME
- `status` → split into `uploadStatus` + `publishStatus`
- `muxTrackId` → `trackId` everywhere (API responses, database column, backend code). This is a Mux implementation detail leaking into the public API. Rename `mux_track_id` to `track_id` in the DB, update all backend references, and expose as `trackId` in API responses.

### Query parameter updates
- Content list: rename `status` filter → `uploadStatus`
- Content count: rename `status` filter → `uploadStatus`

### Portal / Dashboard
- Update `StatusBadge` to show both upload status and publish status
- Update content editor to use new field names
- Add publish/unpublish toggle in portal UI

### Auto-publish
- When `upload_status` transitions to `ready`, check org auto-publish setting
- If on, set `publish_status: "published"` automatically

---

## 2. Media URLs: Proxy Through ShortKit Subdomains

**Current state:**
- Video upload URLs: `https://direct-uploads.oci-us-ashburn-1-vop1.production.mux.com/...`
- Streaming URLs: `https://stream.mux.com/{playbackId}.m3u8`
- Thumbnail URLs: `https://image.mux.com/{playbackId}/thumbnail.jpg?time=0`
- Caption URLs: `https://stream.mux.com/{playbackId}/text/{trackId}.vtt`

**Docs show:**
- Upload: `https://uploads.shortkit.dev/direct/...`
- Streaming: `https://stream.media.shortkit.dev/...`
- Thumbnail: `https://image.media.shortkit.dev/...`

### Decision needed
- **Proxy through shortkit subdomains** — cleaner developer experience, hides infrastructure
- **Accept Mux URLs** — simpler, no proxy needed, update docs to match
- Carousel image uploads (GCS signed URLs) are fine as-is

---

## 3. Carousel Uploads: Remove Finalize, Add Auto-Detection

**Current:** Requires manual `POST /v1/content/{id}/finalize` after uploading all images.
**Docs say:** "Once all images are uploaded, the carousel is automatically validated and marked as ready."

### Options (pick one)
- **GCS Object Notifications → Pub/Sub**: Bucket sends notification on object create, subscriber checks if all slots are filled, runs validation.
- **Polling**: Background task periodically checks `waiting_for_upload` carousels, verifies all image slots have files.

### Implementation
- Move validation logic from `/finalize` endpoint into shared function
- Wire up auto-detection to call that function
- Deprecate `/finalize` endpoint
- TODO comment already in `ingestion.py` at `_handle_carousel_upload()`

---

## 5. Events Endpoints: Build Public API

**Confirmed:** `GET /v1/events` returns 405 Method Not Allowed — endpoint does not exist.

### GET /v1/events
- New endpoint (not `/events/explore`)
- Secret key auth only
- Query params: `type`, `contentId`, `userId`, `startDate`, `endDate`, `limit`, `cursor`
- Cursor-based pagination
- camelCase field names
- Default time range: last 7 days

### GET /v1/events/{id}
- New endpoint
- Secret key auth only
- Returns single event with full `data` payload
- 404 if not found or wrong org

---

## 7. ~~publishAt / expiresAt~~ ✅ Already Done

Both fields enforced in all feed queries. No work needed.

---

## 8. Deploy Local Code Changes

These changes were made locally but are NOT on production (production 500s on everything):
- `require_any_key` auth for upload endpoint (accepts pk_ keys) — verified working locally
- Publishable key rate limit exemption


## Owners fixing 

---

## Summary

| Item | Effort | Priority |
|------|--------|----------|
| 1. Split status → uploadStatus + publishStatus | Large | High |
| 2. Media URL proxy decision | Medium | Medium |
| 3. Carousel auto-detection | Medium | Medium |
| ~~4. Search~~ | ~~Done~~ | ✅ |
| 5. Build GET /v1/events endpoints | Medium | Medium |
| 8. Deploy local auth changes | Small | High |
| 9. Fix production 500s (DB connection issue) | Unknown | **Critical** |

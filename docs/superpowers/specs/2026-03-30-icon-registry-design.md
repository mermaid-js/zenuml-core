# ZenUML Icon Registry Service

**Date:** 2026-03-30
**Status:** Design approved, pending implementation

## Problem

The `@zenuml/core` library needs emoji SVG fragments for consistent cross-platform rendering. A hosted service serves Twemoji SVGs on demand, provides usage visibility, and will later support community-contributed `@Type` icons with namespaces.

## Architecture

- **Runtime:** Cloudflare Worker (Hono framework)
- **Storage:** Cloudflare KV (single namespace `ICONS`)
- **Domain:** `icons.zenuml.com`
- **Repo:** `zenuml/icon-registry` on GitHub
- **Data source:** Twemoji SVGs (CC-BY 4.0) + GitHub Emoji API for shortcode mapping

```
Client (@zenuml/core)                    Cloudflare Edge
┌─────────────────┐     GET /batch       ┌─────────────────────┐
│  fetchEmojis()  │ ──────────────────▶  │  Hono Worker         │
│                 │ ◀──────────────────  │  icons.zenuml.com    │
└─────────────────┘     JSON response    │                      │
                                          │  ┌─────────────┐    │
                                          │  │ KV: ICONS    │    │
                                          │  └─────────────┘    │
                                          └─────────────────────┘
```

## API Endpoints

### `GET /batch`

Batch-fetch emoji SVG fragments by shortcode name.

**Query parameters:**
- `emoji` (required) — comma-separated shortcode names (e.g., `rocket,fire,check`)
- `v` (optional) — client version for cache-busting (e.g., `1.3.0`)

**Response (200):**
```json
{
  "rocket": {
    "viewBox": "0 0 36 36",
    "content": "<path fill=\"#A0041E\" d=\"...\"/><path fill=\"#FFAC33\" d=\"...\"/>",
    "unicode": "🚀"
  },
  "fire": {
    "viewBox": "0 0 36 36",
    "content": "<path fill=\"#F4900C\" d=\"...\"/>",
    "unicode": "🔥"
  }
}
```

Unknown shortcodes are silently omitted from the response (not an error).

**Response headers:**
```
Content-Type: application/json
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

**Error responses:**
- `400` — `{ "error": "missing_emoji_param" }` if `emoji` query param is missing
- `503` — `{ "error": "service_unavailable" }` if KV read fails

### `GET /health`

**Response (200):**
```json
{
  "status": "ok",
  "emoji_count": 3245,
  "last_updated": "2026-03-30T00:00:00Z"
}
```

### `GET /`

**Response (200):**
```json
{
  "name": "ZenUML Icon Registry",
  "version": "1.0.0",
  "endpoints": ["/batch", "/health"]
}
```

### `OPTIONS /batch`

CORS preflight — returns 200 with CORS headers, empty body.

## KV Schema

Single KV namespace: `ICONS`

### Key patterns

| Key | Value | Description |
|-----|-------|-------------|
| `emoji:{shortcode}` | `{ "viewBox": "0 0 36 36", "content": "<path.../>", "unicode": "🚀" }` | Twemoji SVG fragment |
| `meta:emoji_count` | `"3245"` | Total emoji count |
| `meta:last_updated` | `"2026-03-30T00:00:00Z"` | Last ingestion timestamp |

### Future keys (not implemented now)

| Key | Value | Description |
|-----|-------|-------------|
| `type:{name}` | `{ "viewBox": "...", "content": "...", "attributes": "..." }` | Built-in @Type icon |
| `type:{ns}.{name}` | Same format | Namespaced community icon |
| `ns:{namespace}` | `{ "org": "Confluent", "icons": ["kafka", "ksql"] }` | Namespace registration |

The `type:` prefix is reserved but not used until community @Type icons are implemented.

## Data Ingestion Script

`scripts/ingest-twemoji.ts` — run once to populate KV, re-run when Twemoji updates.

**Steps:**
1. Clone or download `datawrapper/twemoji-svg` repo (SVG-only mirror, lighter than full Twemoji)
2. Fetch `https://api.github.com/emojis` — returns `{ "shortcode": "https://.../{codepoint}.png" }`
3. For each shortcode entry:
   a. Extract Unicode codepoint from the URL (e.g., `1f680` from the PNG URL)
   b. Find matching SVG file (e.g., `1f680.svg`)
   c. Parse SVG: extract `viewBox` attribute, strip outer `<svg>` tag, keep inner content
   d. Convert codepoint to Unicode character (e.g., `1f680` → `🚀`)
   e. Build value: `{ viewBox, content, unicode }`
4. Write all entries to KV via Cloudflare API (`PUT /accounts/{id}/storage/kv/namespaces/{ns_id}/bulk`)
5. Write `meta:emoji_count` and `meta:last_updated`

**Running:**
```bash
bun run scripts/ingest-twemoji.ts
```

Requires `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` env vars.

## Worker Implementation

### File structure

```
icon-registry/
├── src/
│   ├── index.ts          # Hono app, route definitions
│   ├── handlers/
│   │   ├── batch.ts      # GET /batch handler
│   │   └── health.ts     # GET /health handler
│   └── types.ts          # Env interface, IconEntry type
├── scripts/
│   └── ingest-twemoji.ts # Data ingestion script
├── wrangler.toml
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Env interface

```typescript
interface Env {
  ICONS: KVNamespace;
}

interface IconEntry {
  viewBox: string;
  content: string;
  unicode: string;
}
```

### Batch handler logic

```typescript
// 1. Parse emoji param
const names = c.req.query("emoji")?.split(",").filter(Boolean);
if (!names?.length) return c.json({ error: "missing_emoji_param" }, 400);

// 2. Deduplicate
const unique = [...new Set(names)];

// 3. Batch KV reads (parallel)
const entries = await Promise.all(
  unique.map(async (name) => {
    const value = await c.env.ICONS.get(`emoji:${name}`, "json");
    return [name, value] as const;
  })
);

// 4. Build response (omit nulls)
const result: Record<string, IconEntry> = {};
for (const [name, value] of entries) {
  if (value) result[name] = value as IconEntry;
}

// 5. Return with caching headers
return c.json(result, 200, {
  "Cache-Control": "public, max-age=31536000, immutable",
});
```

## Caching Strategy

Three layers:
1. **Cloudflare Edge Cache** — `Cache-Control: immutable` means the edge caches the response forever for the same URL. The `v=` parameter naturally busts cache on client upgrades.
2. **Browser HTTP cache** — same `Cache-Control` header, browser won't re-fetch.
3. **Client memory cache** — `fetchEmojis()` in `@zenuml/core` caches in a `Map` across renders.

## Wrangler Configuration

```toml
name = "icon-registry"
compatibility_date = "2024-12-01"
main = "src/index.ts"

[env.production]
name = "icon-registry-production"
route = "icons.zenuml.com/*"
kv_namespaces = [
  { binding = "ICONS", id = "TBD_PRODUCTION_KV_ID" }
]

[env.staging]
name = "icon-registry-staging"
kv_namespaces = [
  { binding = "ICONS", id = "TBD_STAGING_KV_ID" }
]
```

## Testing

- **Unit tests (Vitest):** Mock KV, test batch handler with known/unknown/empty inputs
- **Integration test:** Deploy to staging, run `curl` against real endpoint
- **Ingestion test:** Verify a small subset of emoji (rocket, fire, check) are correctly parsed and stored

## What's NOT in scope

- Community @Type icon registration API (future — KV schema accommodates it)
- Namespace management UI (future)
- Icon upload/validation pipeline (future)
- Rate limiting (Cloudflare's built-in protection is sufficient for now)
- Authentication (public read-only API, no auth needed)

# Emoji Support for ZenUML

**Issue:** [mermaid-js/zenuml-core#78](https://github.com/mermaid-js/zenuml-core/issues/78)
**Date:** 2026-03-30
**Status:** Design approved, pending implementation plan

## Problem

ZenUML has no way to add lightweight visual icons to participants, messages, or fragment conditions. The standard `:shortcode:` syntax (Slack/GitHub style) conflicts with `:` used for async messages (`A->B:message`). Users want emoji for at-a-glance visual recognition of service types, status indicators, and semantic emphasis.

## Competitive Landscape

| Tool | Emoji syntax | Shortcodes | Rendering |
|------|-------------|------------|-----------|
| **PlantUML** | `<:rocket:>` | Yes (angle brackets disambiguate) | Twemoji SVG sprites |
| **Mermaid.js** | Direct Unicode in quotes | No shortcodes | System emoji font |
| **ZenUML (proposed)** | `[rocket]` / `[:rocket:]` | Yes (square brackets) | Twemoji SVGs via Icon Registry |

PlantUML's emoji support is well-received. The primary user demand is emoji as participant icons — a lightweight alternative to importing sprite libraries.

## Design

### DSL Syntax

**Delimiter:** `[shortcode]` — square brackets are unused in the ANTLR grammar, visually distinct from existing syntax.

**Two forms:**
- `[name]` — bare form, resolves CSS style first, then emoji
- `[:name:]` — colon form, always resolves as emoji

**Resolution rules:**

```
[name]      →  class="name"  + getStyle()  + emoji only if getStyle() has no match
[:name:]    →  class="name"  + emoji (skip getStyle())
```

Every `[...]` always adds the content as a CSS class regardless of resolution path. This provides semantic markup and is backwards compatible with the existing `[red]` comment styling.

| Input | class | CSS style | Emoji | Rule |
|-------|-------|-----------|-------|------|
| `[red]` | `red` | `color: red` | — | `getStyle()` matched (CSS color) |
| `[bold]` | `bold` | `font-weight: bold` | — | `getStyle()` matched (style keyword) |
| `[rocket]` | `rocket` | — | 🚀 | `getStyle()` no match → emoji lookup |
| `[fire]` | `fire` | — | 🔥 | `getStyle()` no match → emoji lookup |
| `[:red:]` | `red` | — | 🔴 | Colons → skip `getStyle()`, emoji |
| `[:rocket:]` | `rocket` | — | 🚀 | Colons → emoji |
| `[text-red-500]` | `text-red-500` | — | — | Not an emoji shortcode → class only |
| `[unknown]` | `unknown` | — | — | No CSS match, no emoji match → class only, no visual |
| `[red, bold]` | `red bold` | `color` + `font-weight` | — | Comma → multi-style |

**CSS-priority set** (from `src/utils/messageStyling.ts`):
- 147 CSS named colors (`red`, `blue`, `coral`, `tomato`, `orange`, etc.)
- Style keywords: `italic`, `oblique`, `bold`, `bolder`, `lighter`, `underline`, `overline`, `line-through`

Actual collisions between CSS colors and emoji shortcodes are minimal (~4: `orange`, `coral`, `tomato`, `chocolate`). Users resolve these with the colon form: `[:orange:]`.

Tailwind classes (hyphenated: `text-red-500`) and emoji shortcodes (underscored: `heavy_check_mark`) never collide due to different naming conventions.

### Emoji Semantics

**Emoji is a decorator, not part of the participant name.**

This is consistent with how `@Type`, `<<stereotype>>`, `#color`, and `as label` already work — they modify how a participant looks without changing its identity.

- Declare: `[rocket] Production` — name is `Production`
- Reference: `Production-->CI: done` — bare name, emoji already attached
- No separate declaration required: `CI->[rocket]Production: deploy` auto-declares with emoji at first usage

### Layout

Emoji renders **inline with the participant name**, not as a separate icon row. `@Type` icon stays in its own row above.

```
┌──────────────┐
│   [DB icon]  │   ← @Database (formal type icon)
│  «service»   │   ← <<stereotype>>
│ 🔥 HotDB     │   ← [fire] emoji + name (inline)
└──────────────┘
```

`@Type` and emoji coexist without visual conflict. They serve different semantic roles: `@Type` is a formal system classification; emoji is a lightweight visual accent.

### Contexts

| Context | DSL Example | Notes |
|---------|-------------|-------|
| Participant (header) | `[rocket] Production` | Standalone declaration |
| Participant (inline) | `CI->[rocket]Production: deploy` | Auto-declares at first use |
| Participant (subsequent) | `Production-->CI: done` | Bare name, emoji already attached |
| Async message content | `A->B: [check] validated` | Inline in message text |
| Alt/else conditions | `alt [check] success` | Inline in condition text |
| Comments | `// [eyes] review phase` | Inline in comment text |
| Dividers | `== [fire] Hot Path ==` | Inline in divider label |
| With @Type | `@Database [fire] HotDB` | Both coexist |
| Direct Unicode | `"🚀 Production"` | Existing support (emoji is part of name) |

### Rendering Architecture

#### Icon Registry Service

A Cloudflare Worker + KV service that serves Twemoji SVG fragments on demand. Emoji source: [Twemoji](https://github.com/twitter/twemoji) (CC-BY 4.0).

**Architecture:**

```
┌─────────────────┐     ┌─────────────────────────┐
│  ZenUML Client   │────▶│  icons.zenuml.com        │
│  (browser/Node)  │     │  (Cloudflare Worker)     │
└─────────────────┘     └──────┬──────────────────┘
                               │
                        ┌──────▼──────────────────┐
                        │  Cloudflare KV           │
                        │  shortcode → SVG fragment │
                        └─────────────────────────┘
```

**KV schema:**

```json
Key: "emoji:rocket"
Value: {
  "viewBox": "0 0 36 36",
  "content": "<path fill=\"#A0041E\" d=\"...\"/><path fill=\"#FFAC33\" d=\"...\"/>",
  "unicode": "🚀"
}
```

**Batch API:**

```
GET https://icons.zenuml.com/batch?emoji=rocket,fire,check&v=1.3.0

{
  "rocket": { "viewBox": "0 0 36 36", "content": "<path.../>", "unicode": "🚀" },
  "fire": { "viewBox": "0 0 36 36", "content": "<path.../>", "unicode": "🔥" },
  "check": { "viewBox": "0 0 36 36", "content": "<path.../>", "unicode": "✅" }
}
```

Response format matches the existing `IconDefinition` interface (`src/svg/icons.ts`), so emoji SVG fragments plug directly into the existing rendering pipeline.

**Caching:** `Cache-Control: public, max-age=31536000, immutable`. After first fetch, served from Cloudflare edge or browser HTTP cache. Version parameter (`v=`) provides natural cache-busting on npm upgrades.

**CORS:** `Access-Control-Allow-Origin: *` — emoji SVGs are public data.

**One-time setup script:** Download Twemoji SVGs, strip outer `<svg>` wrapper, map GitHub shortcodes to Unicode codepoints (from `api.github.com/emojis`), write all entries to KV.

#### Renderer Integration

**SVG renderer (Mermaid integration):**

The Mermaid `draw()` function already returns `Promise<void>` (`packages/mermaid-zenuml/src/zenumlRenderer.ts`). The `DrawDefinition` type explicitly supports `void | Promise<void>`. We make `draw()` truly async:

```typescript
export const draw = async function (text: string, id: string): Promise<void> {
  const code = text.replace(regexp, '');

  // Extract emoji shortcodes from parsed DSL
  const emojiNames = extractEmojis(parse(code));

  // Batch fetch from registry (async)
  const emojiCache = await fetchEmojis(emojiNames);

  // Render with cache (sync)
  const result = renderToSvg(code, { emojiCache });

  // ... inject SVG into DOM
};
```

The `renderToSvg()` function stays synchronous — it receives the pre-fetched emoji cache as a parameter. Emoji SVG fragments are injected as `<g>` elements with transform/scale, identical to how `@Type` icons render today.

**HTML renderer:**

`core.render()` is already async. Same pattern: fetch emoji before React render, pass cache to components via Jotai store.

**Fallback chain:**

```
Icon Registry service → native emoji text (<text>🚀</text>) → literal shortcode text ("[rocket]")
```

If the registry is unreachable (offline, CSP blocked, timeout), fall back to native emoji Unicode characters. If Unicode resolution also fails (no local mapping), render the shortcode as literal text.

### Future Extension: Community @Type Icons with Namespaces

ZenUML already supports a rich set of built-in `@Type` icons (Actor, Database, Queue, and many AWS/Azure/GCP service icons). The registry can extend this by allowing organizations to register custom types under a short namespace prefix (max 3 chars):

```
@cfn.Kafka MessageBus      // Confluent namespace "cfn"
@dd.APM Monitor             // Datadog namespace "dd"
@gh.Actions CI              // GitHub namespace "gh"
```

Configurable at diagram level to avoid repeating the prefix:

```
@registry(cfn, dd)          // configure active namespaces
@Kafka MessageBus           // resolves to cfn.Kafka
@Database OrderDB           // built-in, no namespace needed
```

The registry batch API already supports this:

```
GET /batch?emoji=rocket&types=cfn.kafka,dd.apm&v=1.3.0
```

Namespace design details (max length, registration process, conflict resolution) are out of scope for the emoji feature but the KV schema should accommodate it:

```
Key: "type:cfn.kafka"    // namespaced type
Key: "type:database"     // built-in type
Key: "emoji:rocket"      // emoji
```

### Edge Cases

**One emoji per bracket pair.** Comma inside brackets is already established as multi-style separator (`[red, bold]`). For multiple emoji, use multiple brackets: `[rocket][fire] Production`.

**Unknown shortcodes.** If `[word]` matches neither a CSS style nor a known emoji shortcode, it becomes a CSS class only with no visual effect. The brackets are consumed (not rendered as literal text).

**Comma-separated values.** Each value in `[a, b]` is resolved independently. If a value matches CSS, it applies as style. If it matches emoji, it renders as emoji. Both can coexist:

| Input | Result |
|-------|--------|
| `[red, bold]` | CSS color + weight, no emoji |
| `[rocket, red]` | 🚀 emoji + red text color + class="rocket red" |
| `[rocket, fire]` | 🚀 emoji + 🔥 emoji + class="rocket fire" |
| `[rocket, bold, red]` | 🚀 emoji + bold red text + class="rocket bold red" |

**Consistent resolution across all contexts.** The same resolution engine applies everywhere — participants, messages, conditions, comments, and dividers. CSS styles apply to the accompanying text in each context:

| Context | `[rocket, red] text` | Rendered |
|---------|---------------------|----------|
| Participant | `[rocket, red] Service` | 🚀 + "Service" in red |
| Message | `A->B: [rocket, red] alert` | 🚀 + "alert" in red |
| Condition | `alt [rocket, red] success` | 🚀 + "success" in red |
| Comment | `// [rocket, red] note` | 🚀 + "note" in red |
| Divider | `== [rocket, red] Phase ==` | 🚀 + "Phase" in red |

### Known Limitations

- **Emoji on `new` creation targets** — `new [database]DB()` causes parse error. Use `@Database DB` + `new DB()` instead.
- **Emoji in `return` keyword values** — `return [check] valid` causes parse error. Use `A-->B: [check] valid` instead.
- **Emoji in fragment conditions** — `if([check] success)`, `catch([x] error)`, `while([rocket] running)` all work. Emoji is resolved at the rendering layer.

### What's NOT in scope

- Emoji recoloring (changing the color of the emoji SVG itself)
- Emoji autocomplete in editor
- Custom user-defined emoji
- Animated emoji
- Namespace registration UI (future)

## Testing Strategy

- **Parser tests:** Verify `[shortcode]` is parsed correctly in all contexts (participants, messages, conditions, comments, dividers)
- **Resolution tests:** CSS-first fallback, colon override, unknown shortcodes
- **Rendering tests (HTML):** Emoji renders inline with participant name, coexists with @Type
- **Rendering tests (SVG):** Emoji SVG fragments injected correctly as `<g>` elements
- **E2E visual snapshots:** Playwright tests comparing rendered output with and without emoji
- **Fallback tests:** Registry unavailable → native emoji text → literal shortcode
- **Mermaid integration test:** Async draw() fetches and renders emoji correctly

## References

- [mermaid-js/zenuml-core#78](https://github.com/mermaid-js/zenuml-core/issues/78) — Original RFC
- [PlantUML emoji docs](https://plantuml.com/unicode) — `<:emoji:>` syntax, Twemoji rendering
- [Twemoji](https://github.com/twitter/twemoji) — CC-BY 4.0 emoji SVGs
- [GitHub Emoji API](https://api.github.com/emojis) — shortcode-to-codepoint mapping
- [Mermaid DrawDefinition](https://github.com/mermaid-js/mermaid/blob/main/packages/mermaid/src/diagram-api/types.ts) — `void | Promise<void>` supports async

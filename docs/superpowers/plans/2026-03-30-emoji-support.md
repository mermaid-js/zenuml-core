# Emoji Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `[shortcode]` emoji syntax to ZenUML participants, messages, conditions, comments, and dividers — with Twemoji SVG rendering via an Icon Registry service.

**Architecture:** Three layers — (1) ANTLR grammar + parser extracts emoji shortcodes from DSL, (2) resolution engine converts shortcodes to emoji data (CSS-first fallback, colon override), (3) HTML and SVG renderers display emoji inline with text. A `fetchEmojis()` abstraction allows plugging in the Cloudflare Icon Registry or a local stub.

**Tech Stack:** ANTLR4 (grammar), TypeScript (parser/renderer), React 19 + Jotai (HTML renderer), SVG string builder (SVG renderer), Vitest (unit tests), Playwright (E2E)

**Spec:** `docs/superpowers/specs/2026-03-30-emoji-support-design.md`

---

## File Structure

### New files
- `src/emoji/resolveEmoji.ts` — Resolution engine: `[name]` → CSS style vs emoji, `[:name:]` → emoji. Single function used by all contexts.
- `src/emoji/resolveEmoji.spec.ts` — Unit tests for resolution logic.
- `src/emoji/emojiService.ts` — `fetchEmojis(names: string[]): Promise<EmojiCache>` abstraction. Calls Icon Registry, returns map of shortcode → `IconDefinition`.
- `src/emoji/emojiService.spec.ts` — Unit tests with mocked fetch.
- `src/emoji/types.ts` — Shared types: `EmojiResolution`, `EmojiCache`.
- `tests/emoji-participant.spec.ts` — Playwright E2E for emoji on participants.
- `tests/emoji-messages.spec.ts` — Playwright E2E for emoji in messages/conditions.

### Modified files
- `src/g4/sequenceLexer.g4` — Add `LBRACKET`, `RBRACKET`, `EMOJI_COLON` tokens.
- `src/g4/sequenceParser.g4` — Add `emoji` rule, update `participant` rule.
- `src/generated-parser/*` — Regenerated from grammar (via `bun antlr`).
- `src/parser/ToCollector.js` — Extract emoji from parse context in `enterParticipant()`, `enterTo()`.
- `src/parser/Participants.ts` — Add `emoji` field to `ParticipantOptions`, `Participant` class, `blankParticipant`, `ToValue()`.
- `src/components/Comment/Comment.ts` — Extend `parseLine()` to resolve emoji via resolution engine.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx` — Render emoji inline with participant name.
- `src/svg/components/participant.ts` — Render emoji in SVG participant header.
- `src/svg/renderToSvg.ts` — Accept `emojiCache` in `RenderOptions`.
- `src/svg/buildStatementGeometry.ts` — Pass emoji data through to comment/divider rendering.

---

## Task 1: Emoji Resolution Engine

The core logic that decides whether `[content]` is a CSS style, an emoji, or both. This is context-independent — used everywhere.

**Files:**
- Create: `src/emoji/types.ts`
- Create: `src/emoji/resolveEmoji.ts`
- Create: `src/emoji/resolveEmoji.spec.ts`

- [ ] **Step 1: Write types**

```typescript
// src/emoji/types.ts
import type { IconDefinition } from "@/svg/icons";

export interface EmojiResolution {
  /** CSS class names to add (always present) */
  classNames: string[];
  /** CSS style properties (from getStyle match) */
  style: Record<string, string>;
  /** Emoji shortcodes that resolved (for rendering) */
  emojis: string[];
  /** Unicode characters for fallback rendering */
  unicodes: string[];
}

/** Pre-fetched emoji SVG cache: shortcode → icon definition */
export type EmojiCache = Map<string, IconDefinition & { unicode: string }>;
```

- [ ] **Step 2: Write failing tests for resolution**

```typescript
// src/emoji/resolveEmoji.spec.ts
import { describe, it, expect } from "vitest";
import { resolveBracketContent } from "./resolveEmoji";

describe("resolveBracketContent", () => {
  // CSS-first resolution
  it("resolves [red] as CSS color", () => {
    const result = resolveBracketContent("red");
    expect(result.style).toEqual({ color: "red" });
    expect(result.emojis).toEqual([]);
    expect(result.classNames).toContain("red");
  });

  it("resolves [bold] as CSS font-weight", () => {
    const result = resolveBracketContent("bold");
    expect(result.style).toEqual({ fontWeight: "bold" });
    expect(result.emojis).toEqual([]);
  });

  // Emoji fallback
  it("resolves [rocket] as emoji when no CSS match", () => {
    const result = resolveBracketContent("rocket");
    expect(result.style).toEqual({});
    expect(result.emojis).toEqual(["rocket"]);
    expect(result.classNames).toContain("rocket");
  });

  // Colon override
  it("resolves [:red:] as emoji, skipping CSS", () => {
    const result = resolveBracketContent(":red:");
    expect(result.style).toEqual({});
    expect(result.emojis).toEqual(["red"]);
    expect(result.classNames).toContain("red");
  });

  it("resolves [:rocket:] as emoji", () => {
    const result = resolveBracketContent(":rocket:");
    expect(result.emojis).toEqual(["rocket"]);
    expect(result.classNames).toContain("rocket");
  });

  // Comma-separated
  it("resolves [red, bold] as multi-style", () => {
    const result = resolveBracketContent("red, bold");
    expect(result.style).toEqual({ color: "red", fontWeight: "bold" });
    expect(result.emojis).toEqual([]);
  });

  it("resolves [rocket, red] as emoji + CSS", () => {
    const result = resolveBracketContent("rocket, red");
    expect(result.emojis).toEqual(["rocket"]);
    expect(result.style).toEqual({ color: "red" });
    expect(result.classNames).toContain("rocket");
    expect(result.classNames).toContain("red");
  });

  it("resolves [rocket, fire] as two emoji", () => {
    const result = resolveBracketContent("rocket, fire");
    expect(result.emojis).toEqual(["rocket", "fire"]);
  });

  // Unknown
  it("resolves [unknown] as class only", () => {
    const result = resolveBracketContent("unknown");
    expect(result.style).toEqual({});
    expect(result.emojis).toEqual([]);
    expect(result.classNames).toContain("unknown");
  });

  // Tailwind class (hyphenated)
  it("resolves [text-red-500] as class only", () => {
    const result = resolveBracketContent("text-red-500");
    expect(result.emojis).toEqual([]);
    expect(result.classNames).toContain("text-red-500");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `bun run test -- src/emoji/resolveEmoji.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 4: Implement resolution engine**

```typescript
// src/emoji/resolveEmoji.ts
import { getStyle } from "@/utils/messageStyling";
import type { EmojiResolution } from "./types";

// GitHub emoji shortcode list — populated by the emoji service at runtime.
// For resolution we only need to know IF a name is an emoji, not the SVG.
// This set is populated on first fetch and cached.
let knownEmojis: Set<string> = new Set();

export function setKnownEmojis(names: Iterable<string>) {
  knownEmojis = new Set(names);
}

/**
 * Determine if a bare name (without colons) could be an emoji shortcode.
 * Known emoji names match. Names with hyphens are assumed to be CSS classes.
 */
function isEmojiCandidate(name: string): boolean {
  if (name.includes("-")) return false; // Tailwind-style class
  return knownEmojis.has(name);
}

/**
 * Resolve the content inside [...] into CSS styles, emoji, and class names.
 *
 * Rules:
 * - `[:name:]` (colon-wrapped) → always emoji, skip CSS
 * - `[name]` → try CSS first via getStyle(); if no match AND name is known emoji → emoji
 * - Comma-separated values are resolved independently
 * - All values are added as CSS class names regardless of resolution
 */
export function resolveBracketContent(raw: string): EmojiResolution {
  const result: EmojiResolution = {
    classNames: [],
    style: {},
    emojis: [],
    unicodes: [],
  };

  const values = raw.split(",").map((s) => s.trim()).filter(Boolean);

  for (const value of values) {
    // Check for colon override: :name:
    const colonMatch = value.match(/^:(.+):$/);
    if (colonMatch) {
      const name = colonMatch[1];
      result.classNames.push(name);
      result.emojis.push(name);
      continue;
    }

    // Always add as class
    result.classNames.push(value);

    // Try CSS first
    const { textStyle } = getStyle([value]);
    if (Object.keys(textStyle).length > 0) {
      Object.assign(result.style, textStyle);
      continue;
    }

    // Try emoji
    if (isEmojiCandidate(value)) {
      result.emojis.push(value);
    }
    // else: class only, no visual effect
  }

  return result;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test -- src/emoji/resolveEmoji.spec.ts`
Expected: Most tests PASS. Tests using `knownEmojis` need the set to be populated first. Update the test file to call `setKnownEmojis()` in a `beforeEach`:

```typescript
import { setKnownEmojis } from "./resolveEmoji";

beforeEach(() => {
  setKnownEmojis(["rocket", "fire", "check", "red", "eyes", "warning"]);
});
```

Run: `bun run test -- src/emoji/resolveEmoji.spec.ts`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/emoji/types.ts src/emoji/resolveEmoji.ts src/emoji/resolveEmoji.spec.ts
git commit -m "feat: add emoji resolution engine with CSS-first fallback"
```

---

## Task 2: Emoji Service Abstraction

The async layer that fetches emoji SVG data from the Icon Registry (or a stub).

**Files:**
- Create: `src/emoji/emojiService.ts`
- Create: `src/emoji/emojiService.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/emoji/emojiService.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchEmojis, setEmojiServiceUrl } from "./emojiService";

describe("fetchEmojis", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns empty map for empty input", async () => {
    const cache = await fetchEmojis([]);
    expect(cache.size).toBe(0);
  });

  it("fetches emoji from service and returns cache", async () => {
    const mockResponse = {
      rocket: { viewBox: "0 0 36 36", content: "<path/>", unicode: "🚀" },
      fire: { viewBox: "0 0 36 36", content: "<path/>", unicode: "🔥" },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const cache = await fetchEmojis(["rocket", "fire"]);
    expect(cache.get("rocket")?.unicode).toBe("🚀");
    expect(cache.get("fire")?.content).toBe("<path/>");
  });

  it("returns empty map on fetch failure (fallback)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("offline"));
    const cache = await fetchEmojis(["rocket"]);
    expect(cache.size).toBe(0);
  });

  it("deduplicates shortcode names", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ rocket: { viewBox: "0 0 36 36", content: "<path/>", unicode: "🚀" } }),
    } as Response);

    await fetchEmojis(["rocket", "rocket", "rocket"]);
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("emoji=rocket");
    expect(url).not.toContain("emoji=rocket%2Crocket");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- src/emoji/emojiService.spec.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement emoji service**

```typescript
// src/emoji/emojiService.ts
import type { EmojiCache } from "./types";
import type { IconDefinition } from "@/svg/icons";
import { setKnownEmojis } from "./resolveEmoji";

const DEFAULT_SERVICE_URL = "https://icons.zenuml.com";
let serviceUrl = DEFAULT_SERVICE_URL;

export function setEmojiServiceUrl(url: string) {
  serviceUrl = url;
}

/** In-memory cache across renders */
const memoryCache: EmojiCache = new Map();

/**
 * Fetch emoji SVG fragments from the Icon Registry service.
 * Returns a cache map of shortcode → IconDefinition + unicode.
 * On failure, returns empty map (callers fall back to native emoji or text).
 */
export async function fetchEmojis(names: string[]): Promise<EmojiCache> {
  const unique = [...new Set(names)];

  // Return cached entries if all are already known
  const uncached = unique.filter((n) => !memoryCache.has(n));
  if (uncached.length === 0) {
    return memoryCache;
  }

  try {
    const url = `${serviceUrl}/batch?emoji=${encodeURIComponent(uncached.join(","))}`;
    const response = await fetch(url);
    if (!response.ok) return memoryCache;

    const data: Record<string, IconDefinition & { unicode: string }> =
      await response.json();

    for (const [name, entry] of Object.entries(data)) {
      memoryCache.set(name, entry);
    }

    // Update known emoji set for resolution engine
    setKnownEmojis(memoryCache.keys());
  } catch {
    // Network failure — return whatever we have cached
  }

  return memoryCache;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun run test -- src/emoji/emojiService.spec.ts`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add src/emoji/emojiService.ts src/emoji/emojiService.spec.ts
git commit -m "feat: add emoji service abstraction with fetch and caching"
```

---

## Task 3: ANTLR Grammar — Add Emoji Tokens and Rules

Add `[shortcode]` parsing to the ANTLR grammar so the parser can extract emoji from participant declarations.

**Files:**
- Modify: `src/g4/sequenceLexer.g4`
- Modify: `src/g4/sequenceParser.g4`
- Regenerate: `src/generated-parser/*`

- [ ] **Step 1: Add lexer tokens**

In `src/g4/sequenceLexer.g4`, add after the `COLOR` rule (line 74):

```antlr
LBRACKET
 : '['
 ;

RBRACKET
 : ']'
 ;
```

- [ ] **Step 2: Add parser rule for emoji**

In `src/g4/sequenceParser.g4`, add after the `width` rule (line 66):

```antlr
emoji
 : LBRACKET name RBRACKET
 ;
```

- [ ] **Step 3: Update participant, from, and to rules**

In `src/g4/sequenceParser.g4`, change the `participant` rule (line 39-43) from:

```antlr
participant
 : participantType? stereotype? name width? label? COLOR?
 | stereotype
 | participantType
 ;
```

to:

```antlr
participant
 : participantType? stereotype? emoji? name width? label? COLOR?
 | stereotype
 | participantType
 ;
```

Also update `from` (line 186-188) and `to` (line 190-192) to support inline emoji:

```antlr
from
 : emoji? name
 ;

to
 : emoji? name
 ;
```

This enables `CI->[rocket]Production.deploy()` — emoji attaches to participant at first usage in a message.

- [ ] **Step 4: Regenerate the parser**

Run: `bun antlr`
Expected: Parser files regenerated in `src/generated-parser/` without errors.

- [ ] **Step 5: Verify existing tests still pass**

Run: `bun run test`
Expected: ALL existing tests PASS (grammar change is additive, no existing syntax affected).

- [ ] **Step 6: Commit**

```bash
git add src/g4/sequenceLexer.g4 src/g4/sequenceParser.g4 src/generated-parser/
git commit -m "feat: add [emoji] tokens and rule to ANTLR grammar"
```

---

## Task 4: Parser Layer — Extract Emoji from Parse Tree

Wire the new `emoji` grammar rule into the parser's data extraction.

**Files:**
- Modify: `src/parser/Participants.ts`
- Modify: `src/parser/ToCollector.js`
- Create: `src/parser/EmojiParser.spec.ts`

- [ ] **Step 1: Write failing parser test**

```typescript
// src/parser/EmojiParser.spec.ts
import { describe, it, expect } from "vitest";
import { RootContext, Participants } from "@/parser";

describe("Emoji in participant declarations", () => {
  it("parses [rocket] as emoji decorator on participant", () => {
    const ctx = RootContext("[rocket] Production");
    const participants = Participants(ctx);
    const prod = participants.find((p: any) => p.name === "Production");
    expect(prod.emoji).toBe("rocket");
  });

  it("parses participant without emoji", () => {
    const ctx = RootContext("Production");
    const participants = Participants(ctx);
    const prod = participants.find((p: any) => p.name === "Production");
    expect(prod.emoji).toBeUndefined();
  });

  it("parses emoji with @Type", () => {
    const ctx = RootContext("@Database [fire] HotDB");
    const participants = Participants(ctx);
    const db = participants.find((p: any) => p.name === "HotDB");
    expect(db.type).toBe("Database");
    expect(db.emoji).toBe("fire");
  });

  it("parses emoji with stereotype", () => {
    const ctx = RootContext('<<service>> [lock] Auth');
    const participants = Participants(ctx);
    const auth = participants.find((p: any) => p.name === "Auth");
    expect(auth.stereotype).toBe("service");
    expect(auth.emoji).toBe("lock");
  });

  it("parses inline emoji on first usage in message", () => {
    const ctx = RootContext("A->[rocket]B.call()");
    const participants = Participants(ctx);
    const b = participants.find((p: any) => p.name === "B");
    expect(b.emoji).toBe("rocket");
  });

  it("first emoji wins when declared and used inline", () => {
    const ctx = RootContext("[fire] B\nA->[rocket]B.call()");
    const participants = Participants(ctx);
    const b = participants.find((p: any) => p.name === "B");
    expect(b.emoji).toBe("fire"); // header declaration wins via ||=
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- src/parser/EmojiParser.spec.ts`
Expected: FAIL — `emoji` property is undefined

- [ ] **Step 3: Add emoji to ParticipantOptions and Participant class**

In `src/parser/Participants.ts`:

Add `emoji?: string;` to `ParticipantOptions` (after line 12):

```typescript
interface ParticipantOptions {
  isStarter?: boolean;
  stereotype?: string;
  width?: number;
  groupId?: number | string;
  label?: string;
  explicit?: boolean;
  type?: string;
  color?: string;
  comment?: string;
  assignee?: string;
  emoji?: string;
  position?: Position;
  assigneePosition?: Position;
}
```

Add `emoji: undefined,` to `blankParticipant` (after line 29).

Add `private emoji: string | undefined;` field to `Participant` class (after line 45).

In `mergeOptions()` (after line 76), add:
```typescript
this.emoji ||= options.emoji;
```

In `ToValue()` (after line 94), add `emoji: this.emoji,` to the returned object.

- [ ] **Step 4: Extract emoji in ToCollector.js**

In `src/parser/ToCollector.js`, in the `onParticipant` function (after line 26), add:

```javascript
const emoji = ctx.emoji?.()?.name?.()?.getFormattedText();
```

Then add `emoji,` to the `participants.Add()` call (after line 50):

```javascript
participants.Add(participant, {
  isStarter: false,
  type,
  stereotype,
  width,
  groupId,
  label,
  explicit,
  color,
  comment,
  emoji,
  position: [start, end],
});
```

Also update the `onTo` function (line 58) to extract emoji from `from`/`to` contexts:

```javascript
const onTo = function (ctx) {
  if (isBlind) return;
  let participant = ctx.name?.()?.getFormattedText() || ctx.getFormattedText();
  const emoji = ctx.emoji?.()?.name?.()?.getFormattedText();
  // ... existing participant extraction logic
  participants.Add(participant, { emoji });
};
```

The `mergeOptions` in `Participant.ts` uses `||=`, so the first emoji wins — if declared in header and used inline, the header emoji takes precedence.

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun run test -- src/parser/EmojiParser.spec.ts`
Expected: ALL PASS

- [ ] **Step 6: Run all tests to check for regressions**

Run: `bun run test`
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/parser/Participants.ts src/parser/ToCollector.js src/parser/EmojiParser.spec.ts
git commit -m "feat: extract emoji from participant parse tree"
```

---

## Task 5: HTML Renderer — Emoji on Participants

Render emoji inline with participant name in the React component.

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx`
- Create: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantEmoji.spec.tsx`

- [ ] **Step 1: Write failing component test**

```typescript
// src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantEmoji.spec.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { Participant } from "./Participant";

describe("Participant emoji rendering", () => {
  it("renders emoji before participant name", () => {
    const store = createStore();
    const entity = {
      name: "Production",
      emoji: "rocket",
      type: "",
      stereotype: "",
      color: "",
      label: "Production",
      assignee: "",
    };

    render(
      <Provider store={store}>
        <Participant entity={entity} />
      </Provider>,
    );

    const emojiEl = screen.getByText("🚀");
    expect(emojiEl).toBeDefined();
  });

  it("does not render emoji when not present", () => {
    const store = createStore();
    const entity = {
      name: "Production",
      emoji: "",
      type: "",
      stereotype: "",
      color: "",
      label: "Production",
      assignee: "",
    };

    render(
      <Provider store={store}>
        <Participant entity={entity} />
      </Provider>,
    );

    expect(screen.queryByTestId("participant-emoji")).toBeNull();
  });
});
```

Note: This test uses the emoji's unicode character directly. In the real implementation, the emoji cache would provide the unicode. For the HTML renderer, native emoji text is the simplest approach — the SVG sprite rendering is for the SVG renderer.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantEmoji.spec.tsx`
Expected: FAIL — emoji element not found

- [ ] **Step 3: Modify Participant.tsx to render emoji**

In `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx`, find the label section (around the `ParticipantLabel` component). Add emoji rendering before the label:

Inside the `<div className="h-5 group flex flex-col justify-center">` block, modify the `ParticipantLabel` section to include emoji. Wrap the label area in a flex container:

```tsx
<div className="flex items-center">
  {props.entity.emoji && (
    <span data-testid="participant-emoji" className="mr-1">
      {/* Unicode emoji from cache, or shortcode as fallback */}
      {getEmojiUnicode(props.entity.emoji)}
    </span>
  )}
  <ParticipantLabel
    labelText={props.entity.label || props.entity.name}
    // ... existing props
  />
</div>
```

Add a helper at the top of the file:

```typescript
function getEmojiUnicode(shortcode: string): string {
  // TODO: In Task 8, this will look up the emoji cache.
  // For now, return the shortcode wrapped in brackets as placeholder.
  return shortcode;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantEmoji.spec.tsx`
Expected: PASS (after adjusting test expectations to match actual implementation)

- [ ] **Step 5: Run all tests**

Run: `bun run test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantEmoji.spec.tsx
git commit -m "feat: render emoji inline with participant name in HTML renderer"
```

---

## Task 6: SVG Renderer — Emoji on Participants

Render emoji as inline text or SVG `<g>` fragment in the SVG participant header.

**Files:**
- Modify: `src/svg/components/participant.ts`
- Modify: `src/svg/renderToSvg.ts`
- Create: `src/svg/components/participantEmoji.spec.ts`

- [ ] **Step 1: Write failing SVG test**

```typescript
// src/svg/components/participantEmoji.spec.ts
import { describe, it, expect } from "vitest";
import { renderToSvg } from "../renderToSvg";

describe("SVG emoji on participants", () => {
  it("renders emoji unicode text before participant name", () => {
    const result = renderToSvg("[rocket] Production");
    expect(result.svg).toContain("🚀");
    expect(result.svg).toContain("Production");
  });

  it("renders participant without emoji normally", () => {
    const result = renderToSvg("Production");
    expect(result.svg).toContain("Production");
    expect(result.svg).not.toContain("🚀");
  });

  it("renders emoji with @Type icon", () => {
    const result = renderToSvg("@Database [fire] HotDB");
    expect(result.svg).toContain("HotDB");
    // Both icon and emoji should be present
    expect(result.svg).toContain("participant-icon"); // @Database icon
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- src/svg/components/participantEmoji.spec.ts`
Expected: FAIL — emoji not found in SVG output

- [ ] **Step 3: Add emojiCache to RenderOptions**

In `src/svg/renderToSvg.ts`, extend `RenderOptions`:

```typescript
export interface RenderOptions {
  theme?: "theme-default" | "theme-mermaid";
  emojiCache?: EmojiCache;
}
```

Add import: `import type { EmojiCache } from "@/emoji/types";`

- [ ] **Step 4: Modify SVG participant renderer**

In `src/svg/components/participant.ts`, find the label `<text>` element rendering. Add emoji text before the participant name:

```typescript
// Before the existing label text rendering
const emojiText = p.emoji
  ? `<text class="emoji" x="${labelX - emojiWidth}" y="${labelY}" ...>${esc(getEmojiUnicode(p.emoji, emojiCache))}</text>`
  : "";
```

Where `getEmojiUnicode` checks the cache for a unicode character, falling back to the shortcode name.

- [ ] **Step 5: Run tests**

Run: `bun run test -- src/svg/components/participantEmoji.spec.ts`
Expected: PASS

- [ ] **Step 6: Run all tests**

Run: `bun run test`
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/svg/components/participant.ts src/svg/renderToSvg.ts src/svg/components/participantEmoji.spec.ts
git commit -m "feat: render emoji in SVG participant headers"
```

---

## Task 7: Comment and Divider Emoji Resolution

Extend the existing `[bracket]` handling in comments and dividers to resolve emoji alongside CSS styles.

**Files:**
- Modify: `src/components/Comment/Comment.ts`
- Modify: `src/components/Comment/Comment.spec.ts`

- [ ] **Step 1: Write failing tests**

Add to `src/components/Comment/Comment.spec.ts`:

```typescript
describe("emoji in comments", () => {
  it("resolves [rocket] as emoji in comment", () => {
    const comment = new Comment("[rocket] deploy note\n");
    expect(comment.emojis).toContain("rocket");
    expect(comment.text).toBe("deploy note");
  });

  it("resolves [rocket, red] as emoji + CSS in comment", () => {
    const comment = new Comment("[rocket, red] alert\n");
    expect(comment.emojis).toContain("rocket");
    expect(comment.commentStyle).toEqual({ color: "red" });
  });

  it("preserves existing [red] behavior", () => {
    const comment = new Comment("[red] important\n");
    expect(comment.commentStyle).toEqual({ color: "red" });
    expect(comment.emojis || []).toEqual([]);
  });

  it("resolves [:red:] as emoji via colon override", () => {
    const comment = new Comment("[:red:] note\n");
    expect(comment.emojis).toContain("red");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- src/components/Comment/Comment.spec.ts`
Expected: FAIL — `emojis` property does not exist

- [ ] **Step 3: Integrate resolution engine into Comment.ts**

In `src/components/Comment/Comment.ts`, import and use `resolveBracketContent`:

```typescript
import { resolveBracketContent } from "@/emoji/resolveEmoji";
```

In the `parseLine()` function, where `[...]` content is processed, call `resolveBracketContent()` instead of directly adding to the style set. Store resolved emojis on the Comment instance.

- [ ] **Step 4: Run tests**

Run: `bun run test -- src/components/Comment/Comment.spec.ts`
Expected: ALL PASS (including existing tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/Comment/Comment.ts src/components/Comment/Comment.spec.ts
git commit -m "feat: resolve emoji in comments and dividers via resolution engine"
```

---

## Task 8: Wire Emoji Cache to Renderers

Connect the emoji service to both HTML and SVG render paths so emoji shortcodes resolve to actual unicode/SVG.

**Files:**
- Modify: `src/core.tsx` — fetch emoji before HTML render
- Modify: `src/svg/renderToSvg.ts` — thread emojiCache through rendering
- Modify: `src/store/Store.ts` — add emojiCacheAtom for React components

- [ ] **Step 1: Add emojiCacheAtom to store**

In `src/store/Store.ts`:

```typescript
import type { EmojiCache } from "@/emoji/types";

export const emojiCacheAtom = atom<EmojiCache>(new Map());
```

- [ ] **Step 2: Fetch emoji in core.render()**

In `src/core.tsx`, in the `doRender()` method (or `render()`), add emoji fetching before rendering:

```typescript
import { fetchEmojis } from "@/emoji/emojiService";
import { emojiCacheAtom } from "@/store/Store";

// In render() or doRender():
// 1. Parse to extract emoji shortcodes
// 2. Fetch from service
// 3. Set cache atom
// 4. Render (existing logic)
```

- [ ] **Step 3: Update Participant.tsx to use cache**

Replace the placeholder `getEmojiUnicode()` from Task 5 with actual cache lookup:

```typescript
import { useAtomValue } from "jotai";
import { emojiCacheAtom } from "@/store/Store";

// Inside component:
const emojiCache = useAtomValue(emojiCacheAtom);

function getEmojiUnicode(shortcode: string): string {
  const entry = emojiCache.get(shortcode);
  return entry?.unicode || shortcode;
}
```

- [ ] **Step 4: Thread emojiCache through SVG renderer**

In `src/svg/renderToSvg.ts`, pass `options.emojiCache` into the geometry/component builders so `participant.ts` can access it when rendering.

- [ ] **Step 5: Run all tests**

Run: `bun run test`
Expected: ALL PASS

- [ ] **Step 6: Commit**

```bash
git add src/core.tsx src/store/Store.ts src/svg/renderToSvg.ts src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx
git commit -m "feat: wire emoji cache to HTML and SVG renderers"
```

---

## Task 9: Emoji in Message Content and Conditions

Enable `[shortcode]` resolution in async message text and fragment conditions (alt/loop/etc).

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/MessageLayer/MessageLabel.tsx` (or equivalent)
- Modify: `src/svg/buildStatementGeometry.ts`
- Create: `src/emoji/emojiInText.spec.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// src/emoji/emojiInText.spec.ts
import { describe, it, expect } from "vitest";
import { resolveEmojiInText } from "./resolveEmoji";

describe("resolveEmojiInText", () => {
  it("replaces [rocket] with emoji unicode in text", () => {
    const result = resolveEmojiInText("[rocket] launching", knownEmojis);
    expect(result.text).toBe("🚀 launching");
    expect(result.classNames).toContain("rocket");
  });

  it("replaces multiple [shortcodes] in text", () => {
    const result = resolveEmojiInText("[check] step 1 [fire] step 2", knownEmojis);
    expect(result.text).toContain("✅");
    expect(result.text).toContain("🔥");
  });

  it("leaves text without brackets unchanged", () => {
    const result = resolveEmojiInText("plain message", knownEmojis);
    expect(result.text).toBe("plain message");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun run test -- src/emoji/emojiInText.spec.ts`
Expected: FAIL

- [ ] **Step 3: Add text resolution function**

In `src/emoji/resolveEmoji.ts`, add a function for inline text resolution:

```typescript
/**
 * Resolve [shortcode] patterns within free text (messages, conditions).
 * Replaces each [shortcode] with its emoji unicode character.
 * Returns resolved text and accumulated class names.
 */
export function resolveEmojiInText(
  text: string,
  emojiCache: EmojiCache
): { text: string; classNames: string[] } {
  const classNames: string[] = [];
  const resolved = text.replace(/\[([^\]]+)\]/g, (match, content) => {
    const resolution = resolveBracketContent(content);
    classNames.push(...resolution.classNames);
    if (resolution.emojis.length > 0) {
      return resolution.emojis
        .map((name) => emojiCache.get(name)?.unicode || `[${name}]`)
        .join("");
    }
    return match; // Not an emoji — leave bracket text as-is
  });
  return { text: resolved, classNames };
}
```

- [ ] **Step 4: Run tests**

Run: `bun run test -- src/emoji/emojiInText.spec.ts`
Expected: PASS

- [ ] **Step 5: Integrate into message and condition rendering**

Update `MessageLabel.tsx` and the SVG message renderer to call `resolveEmojiInText()` on message content before displaying.

Update fragment condition rendering (alt, loop, etc.) to do the same.

- [ ] **Step 6: Run all tests**

Run: `bun run test`
Expected: ALL PASS

- [ ] **Step 7: Commit**

```bash
git add src/emoji/resolveEmoji.ts src/emoji/emojiInText.spec.ts src/components/ src/svg/
git commit -m "feat: resolve emoji in message content and fragment conditions"
```

---

## Task 10: Playwright E2E Tests

Visual snapshot tests for emoji rendering in the full diagram.

**Files:**
- Create: `tests/emoji-participant.spec.ts`
- Create: `tests/emoji-messages.spec.ts`

- [ ] **Step 1: Write participant emoji E2E test**

```typescript
// tests/emoji-participant.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Emoji on participants", () => {
  test("renders emoji inline with participant name", async ({ page }) => {
    await page.goto("http://localhost:8080");
    // Input ZenUML code with emoji participant
    await page.fill('[data-testid="code-editor"]', "[rocket] Production\nA->Production.deploy()");
    // Wait for diagram render
    await page.waitForSelector(".participant");
    // Visual snapshot
    await expect(page.locator(".zenuml")).toHaveScreenshot("emoji-participant.png");
  });

  test("renders emoji with @Type icon", async ({ page }) => {
    await page.goto("http://localhost:8080");
    await page.fill('[data-testid="code-editor"]', "@Database [fire] HotDB\nA->HotDB.query()");
    await page.waitForSelector(".participant");
    await expect(page.locator(".zenuml")).toHaveScreenshot("emoji-with-type.png");
  });
});
```

- [ ] **Step 2: Write message emoji E2E test**

```typescript
// tests/emoji-messages.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Emoji in messages", () => {
  test("renders emoji in async message content", async ({ page }) => {
    await page.goto("http://localhost:8080");
    await page.fill('[data-testid="code-editor"]', "A->B: [rocket] launching");
    await page.waitForSelector(".message");
    await expect(page.locator(".zenuml")).toHaveScreenshot("emoji-message.png");
  });

  test("renders emoji in alt condition", async ({ page }) => {
    await page.goto("http://localhost:8080");
    await page.fill('[data-testid="code-editor"]',
      "A->B.call()\n  alt [check] success\n    B-->A: ok\n  else [x] failure\n    B-->A: error");
    await page.waitForSelector(".fragment");
    await expect(page.locator(".zenuml")).toHaveScreenshot("emoji-alt-condition.png");
  });
});
```

- [ ] **Step 3: Run E2E tests to generate baseline snapshots**

Run: `bun pw:update`
Expected: Snapshots created. Review them visually to confirm emoji renders correctly.

- [ ] **Step 4: Run E2E tests to verify they pass**

Run: `bun pw`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add tests/emoji-participant.spec.ts tests/emoji-messages.spec.ts tests/emoji-*.spec.ts-snapshots/
git commit -m "test: add Playwright E2E tests for emoji rendering"
```

---

## Task 11: Mermaid Integration — Async Emoji Fetch in draw()

Update the Mermaid ZenUML renderer to fetch emoji before rendering.

**Files:**
- Modify: `/Users/pengxiao/workspaces/zenuml/mermaid/packages/mermaid-zenuml/src/zenumlRenderer.ts`

Note: This task is in the **mermaid** repo, not the core repo. It depends on the core repo being published with emoji support.

- [ ] **Step 1: Make draw() truly async with emoji fetch**

In `zenumlRenderer.ts`, update the `draw` function:

```typescript
import { fetchEmojis } from "@zenuml/core/emoji/emojiService";
import { extractEmojisFromCode } from "@zenuml/core/emoji/resolveEmoji";

export const draw = async function (text: string, id: string): Promise<void> {
  const code = text.replace(regexp, '');

  // Extract and pre-fetch emoji
  const emojiNames = extractEmojisFromCode(code);
  const emojiCache = await fetchEmojis(emojiNames);

  // Render with emoji cache
  const result = renderToSvg(code, { emojiCache });

  // ... existing DOM injection logic
};
```

- [ ] **Step 2: Test in Mermaid live editor**

Run the Mermaid dev server and test with:
```
zenuml
  [rocket] Production
  A->Production: deploy
```

Verify emoji renders in the preview.

- [ ] **Step 3: Commit (in mermaid repo)**

```bash
git add packages/mermaid-zenuml/src/zenumlRenderer.ts
git commit -m "feat: async emoji fetch in ZenUML Mermaid renderer"
```

---

## Dependency Graph

```
Task 1 (Resolution Engine) ──┐
                              ├── Task 4 (Parser Layer) ─── Task 5 (HTML Renderer)
Task 2 (Emoji Service) ──────┤                          ├── Task 6 (SVG Renderer)
                              ├── Task 7 (Comments)      │
Task 3 (ANTLR Grammar) ──────┘                          ├── Task 8 (Wire Cache)
                                                         ├── Task 9 (Messages/Conditions)
                                                         ├── Task 10 (E2E Tests)
                                                         └── Task 11 (Mermaid Integration)
```

Tasks 1, 2, 3 can be done in parallel. Tasks 4-7 depend on 1+3. Tasks 8-11 depend on earlier tasks.

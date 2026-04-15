# Keyboard-Only Editing on Diagram — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a keyboard-only editing layer (arrow-key navigation + Miro-style Tab-to-sibling) on top of the existing mouse-driven edit-on-diagram feature. Scope: add participant, rename participant, add message, rename message.

**Architecture:** Two independent focus rings (participants, messages) backed by Jotai atoms. Arrow keys move focus between elements via a top-level `useDiagramKeyboard` hook installed on `SeqDiagram`. Inside edit mode, `Tab` is intercepted by `EditableSpan` via a new `onTabCreateSibling` prop and routed to `insertParticipantIntoDsl` / `insertMessageInDsl`. Ring order is computed by pure functions that walk the ANTLR parse tree in DSL order.

**Tech Stack:** React 19, Jotai, TypeScript, Vitest (unit), Playwright (E2E), Tailwind, Bun.

**Spec:** `docs/superpowers/specs/2026-04-15-keyboard-editing-on-diagram-design.md`

**Base branch:** `feat/keyboard-editing` (forked from `origin/feat/sequence-editor-interactions-v3`)

---

## File map

### New files

- `src/store/keyboardAtoms.ts` — `focusedParticipantAtom`, `focusedMessageAtom`, paired setter atoms. Kept separate from `Store.ts` to avoid bloating it.
- `src/components/DiagramFrame/SeqDiagram/keyboard/rings.ts` — pure ring builders. `buildParticipantRing(rootContext)`, `buildMessageRing(rootContext)`.
- `src/components/DiagramFrame/SeqDiagram/keyboard/rings.spec.ts` — unit tests.
- `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts` — top-level keydown handler.
- `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx` — unit tests.
- `src/components/DiagramFrame/SeqDiagram/keyboard/EmptyDiagramPlaceholder.tsx` — focusable phantom for empty diagrams.
- `e2e/fixtures/keyboard-editing.html` — Playwright fixture page.
- `tests/keyboard-editing.spec.ts` — Playwright spec covering the full flow.

### Modified files

- `src/store/Store.ts` — re-export the keyboard atoms so consumers keep importing from `@/store/Store` (DRY).
- `src/components/common/EditableSpan/EditableSpan.tsx` — add `onTabCreateSibling?: (direction: "before" | "after") => void` prop; intercept Tab in edit mode when provided.
- `src/components/common/EditableSpan/EditableSpan.spec.tsx` — add test coverage for the new prop (create file if it does not exist).
- `src/utils/participantInsertTransform.ts` — change `insertParticipantIntoDsl` return type from `string` to `{ code: string; labelPosition: [number, number] }` so we can auto-open the new participant in edit mode. Update call sites.
- `src/utils/participantInsertTransform.spec.ts` — update tests for new return shape.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx` — update to new return shape.
- `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx` — wire `onTabCreateSibling`; render focus ring from `focusedParticipantAtom`.
- `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx` — wire `onTabCreateSibling` with inherited from/to; render focus ring from `focusedMessageAtom`.
- `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx` — install `useDiagramKeyboard`; `tabIndex={0}` on container; auto-focus first participant on container focus; render `EmptyDiagramPlaceholder` when empty.
- `src/components/DiagramFrame/SeqDiagram/SeqDiagram.css` — focus-ring styles.

---

## Task 1: Add focus atoms

**Files:**
- Create: `src/store/keyboardAtoms.ts`
- Modify: `src/store/Store.ts`
- Test: `src/store/keyboardAtoms.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `src/store/keyboardAtoms.spec.ts`:

```typescript
import { createStore } from "jotai";
import {
  focusedParticipantAtom,
  focusedMessageAtom,
  setFocusedParticipantAtom,
  setFocusedMessageAtom,
} from "./keyboardAtoms";

describe("keyboardAtoms", () => {
  it("stores focused participant", () => {
    const store = createStore();
    store.set(setFocusedParticipantAtom, "A");
    expect(store.get(focusedParticipantAtom)).toBe("A");
    expect(store.get(focusedMessageAtom)).toBeNull();
  });

  it("setting focused message clears focused participant", () => {
    const store = createStore();
    store.set(setFocusedParticipantAtom, "A");
    store.set(setFocusedMessageAtom, { start: 10, end: 20 });
    expect(store.get(focusedParticipantAtom)).toBeNull();
    expect(store.get(focusedMessageAtom)).toEqual({ start: 10, end: 20 });
  });

  it("setting focused participant clears focused message", () => {
    const store = createStore();
    store.set(setFocusedMessageAtom, { start: 10, end: 20 });
    store.set(setFocusedParticipantAtom, "B");
    expect(store.get(focusedParticipantAtom)).toBe("B");
    expect(store.get(focusedMessageAtom)).toBeNull();
  });

  it("setting null on either clears that ring only", () => {
    const store = createStore();
    store.set(setFocusedParticipantAtom, "A");
    store.set(setFocusedParticipantAtom, null);
    expect(store.get(focusedParticipantAtom)).toBeNull();
    expect(store.get(focusedMessageAtom)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/store/keyboardAtoms.spec.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the atoms**

Create `src/store/keyboardAtoms.ts`:

```typescript
import { atom } from "jotai";

export type FocusedMessageKey = {
  start: number;
  end: number;
};

export const focusedParticipantAtom = atom<string | null>(null);
export const focusedMessageAtom = atom<FocusedMessageKey | null>(null);

export const setFocusedParticipantAtom = atom(
  null,
  (_get, set, name: string | null) => {
    set(focusedParticipantAtom, name);
    if (name !== null) {
      set(focusedMessageAtom, null);
    }
  },
);

export const setFocusedMessageAtom = atom(
  null,
  (_get, set, key: FocusedMessageKey | null) => {
    set(focusedMessageAtom, key);
    if (key !== null) {
      set(focusedParticipantAtom, null);
    }
  },
);
```

- [ ] **Step 4: Re-export from Store.ts**

Edit `src/store/Store.ts`. At the bottom of the file, add:

```typescript
export {
  focusedParticipantAtom,
  focusedMessageAtom,
  setFocusedParticipantAtom,
  setFocusedMessageAtom,
} from "./keyboardAtoms";
export type { FocusedMessageKey } from "./keyboardAtoms";
```

- [ ] **Step 5: Run tests to verify pass**

Run: `bun run test src/store/keyboardAtoms.spec.ts`
Expected: PASS (all 4 cases).

- [ ] **Step 6: Commit**

```bash
git add src/store/keyboardAtoms.ts src/store/keyboardAtoms.spec.ts src/store/Store.ts
git commit -m "feat(store): add focused participant/message atoms for keyboard editing"
```

---

## Task 2: Ring builders

**Files:**
- Create: `src/components/DiagramFrame/SeqDiagram/keyboard/rings.ts`
- Create: `src/components/DiagramFrame/SeqDiagram/keyboard/rings.spec.ts`

Goal: two pure functions that walk the parse tree in DSL order. The participant ring returns participant names (strings). The message ring returns entries shaped to match `focusedMessageAtom` (`{ start, end }`) — the text position of the message's label in the DSL, so the ring items can be matched back to `EditableSpan`s via `pendingEditableRangeAtom`-style coordinates.

- [ ] **Step 1: Write the failing test**

Create `src/components/DiagramFrame/SeqDiagram/keyboard/rings.spec.ts`:

```typescript
import { Fixture } from "@/../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";
import { buildParticipantRing, buildMessageRing } from "./rings";

describe("rings.buildParticipantRing", () => {
  it("returns explicit participants in DSL order", () => {
    const root = RootContext("A\nB\nC\nA->B.m1\n");
    expect(buildParticipantRing(root)).toEqual(["A", "B", "C"]);
  });

  it("skips the implicit _STARTER_", () => {
    const root = RootContext("A->B.m1\n");
    const ring = buildParticipantRing(root);
    expect(ring).not.toContain("_STARTER_");
    expect(ring).toEqual(["A", "B"]);
  });

  it("returns empty for empty code", () => {
    expect(buildParticipantRing(null)).toEqual([]);
  });
});

describe("rings.buildMessageRing", () => {
  it("returns top-level messages in DSL order", () => {
    const root = RootContext("A->B.m1\nA->B.m2\n");
    const ring = buildMessageRing(root);
    expect(ring).toHaveLength(2);
    expect(ring[0].signature).toBe("m1");
    expect(ring[1].signature).toBe("m2");
  });

  it("walks into alt/loop fragments in order", () => {
    const code = "A->B.m1\nalt x\n  A->B.m2\nelse y\n  A->B.m3\nend\nA->B.m4\n";
    const root = RootContext(code);
    const ring = buildMessageRing(root);
    const sigs = ring.map((r) => r.signature);
    expect(sigs).toEqual(["m1", "m2", "m3", "m4"]);
  });

  it("each ring entry exposes label start/end and from/to", () => {
    const root = RootContext("A->B.m1\n");
    const ring = buildMessageRing(root);
    expect(ring[0].from).toBe("A");
    expect(ring[0].to).toBe("B");
    expect(typeof ring[0].labelStart).toBe("number");
    expect(typeof ring[0].labelEnd).toBe("number");
    expect(ring[0].labelEnd).toBeGreaterThanOrEqual(ring[0].labelStart);
  });

  it("returns empty for null rootContext", () => {
    expect(buildMessageRing(null)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/rings.spec.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `buildParticipantRing`**

Create `src/components/DiagramFrame/SeqDiagram/keyboard/rings.ts`:

```typescript
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
import { AllMessages } from "@/parser/MessageCollector";

export type MessageRingEntry = {
  from: string;
  to: string;
  signature: string;
  labelStart: number;
  labelEnd: number;
  blockContext: any;
  insertIndex: number;
};

export const buildParticipantRing = (rootContext: any): string[] => {
  if (!rootContext) return [];
  return OrderedParticipants(rootContext)
    .map((p) => p.name)
    .filter((name) => name !== _STARTER_);
};

export const buildMessageRing = (rootContext: any): MessageRingEntry[] => {
  if (!rootContext) return [];
  // Walk the parse tree (not AllMessages — we need ctx to compute positions
  // and the containing block). Recursive walk covers fragments.
  const out: MessageRingEntry[] = [];
  walkBlock(rootContext.block?.(), out);
  return out;
};

const walkBlock = (blockCtx: any, out: MessageRingEntry[]) => {
  if (!blockCtx) return;
  const stats: any[] = blockCtx.stat?.() ?? [];
  stats.forEach((stat, index) => {
    const message = stat.message?.();
    if (message) {
      const from = message.From?.()?.getText?.() ?? "";
      const to = message.Owner?.()?.getText?.() ?? "";
      const sigCtx = message.signature?.() ?? message;
      const signature = sigCtx?.getText?.() ?? "";
      const labelStart = sigCtx?.start?.start ?? -1;
      const labelEnd = sigCtx?.stop?.stop ?? -1;
      if (labelStart !== -1) {
        out.push({
          from,
          to,
          signature,
          labelStart,
          labelEnd,
          blockContext: blockCtx,
          insertIndex: index,
        });
      }
    }
    // Recurse into fragment children (alt/loop/par/opt/section/critical/tcf)
    const fragments = [
      stat.alt?.(),
      stat.loop?.(),
      stat.par?.(),
      stat.opt?.(),
      stat.section?.(),
      stat.critical?.(),
      stat.tcf?.(),
    ].filter(Boolean);
    for (const frag of fragments) {
      // Fragment children expose one or more nested blocks — walk each.
      const nestedBlocks = collectFragmentBlocks(frag);
      for (const block of nestedBlocks) {
        walkBlock(block, out);
      }
    }
  });
};

const collectFragmentBlocks = (fragment: any): any[] => {
  const blocks: any[] = [];
  // Standard fragments expose .block() (single) or .braceBlock() (alt/par with multiple)
  const single = fragment?.block?.();
  if (single) blocks.push(single);
  const multi = fragment?.braceBlock?.() ?? [];
  if (Array.isArray(multi)) blocks.push(...multi);
  else if (multi) blocks.push(multi);
  return blocks;
};
```

- [ ] **Step 4: Run tests to verify pass**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/rings.spec.ts`
Expected: PASS (all 6 cases).

- [ ] **Step 5: If any fragment-walk test fails**

The ANTLR generated accessors may differ between fragment types. Fix by reading `src/g4/sequenceParser.g4` (or the generated parser) to find the actual child accessor names. Update `collectFragmentBlocks` accordingly. Re-run.

- [ ] **Step 6: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/keyboard/rings.ts src/components/DiagramFrame/SeqDiagram/keyboard/rings.spec.ts
git commit -m "feat(keyboard): add participant and message ring builders"
```

---

## Task 3: Extend `insertParticipantIntoDsl` to return label position

**Files:**
- Modify: `src/utils/participantInsertTransform.ts`
- Modify: `src/utils/participantInsertTransform.spec.ts` (or create)
- Modify: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx`

The helper currently returns the new code as a string. To auto-open the new participant in edit mode after a Tab-sibling insertion, we need the label range.

- [ ] **Step 1: Find the existing spec or create one**

Run: `ls src/utils/participantInsertTransform.spec.ts 2>/dev/null && echo exists || echo missing`
If missing, create it in Step 2.

- [ ] **Step 2: Write the failing test**

In `src/utils/participantInsertTransform.spec.ts` add (or create with):

```typescript
import { RootContext } from "@/parser";
import { insertParticipantIntoDsl } from "./participantInsertTransform";

describe("insertParticipantIntoDsl", () => {
  it("returns the new code plus the label position of the inserted name", () => {
    const code = "A\nB\nA->B.m1\n";
    const rootContext = RootContext(code);
    const result = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex: 1,
      name: "X",
      type: "default",
    });

    expect(typeof result).toBe("object");
    expect(result.code).toContain("X");
    const [start, end] = result.labelPosition;
    expect(result.code.slice(start, end + 1)).toBe("X");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun run test src/utils/participantInsertTransform.spec.ts`
Expected: FAIL — `result.code` is undefined (currently the function returns a string).

- [ ] **Step 4: Update `insertParticipantIntoDsl`**

Edit `src/utils/participantInsertTransform.ts`. Replace the function body's return statements with a shape that includes `labelPosition`. The label position is the range of the newly-inserted `name` (which goes through `normalizeName`, so it may be quoted). Compute it by finding the new line in the returned code and locating `normalizedName` within it.

Replace the two `return` branches at the bottom of the function with:

```typescript
  const normalizedName = normalizeName(name);

  if (head) {
    const headStart = head.start.start;
    const headEnd = head.stop.stop + 1;
    const starter = head.starterExp?.();
    const starterText = starter
      ? code.slice(starter.start.start, starter.stop.stop + 1)
      : "";
    const nextHead = starterText
      ? `${participantLines}\n${starterText}`
      : participantLines;
    const nextCode = code.slice(0, headStart) + nextHead + code.slice(headEnd);
    const labelStart = nextCode.indexOf(normalizedName, headStart);
    return {
      code: nextCode,
      labelPosition: [labelStart, labelStart + normalizedName.length - 1] as [
        number,
        number,
      ],
    };
  }

  const insertionPoint = block
    ? block.start.start
    : title
    ? title.stop.stop + 1
    : 0;
  const prefix = code.slice(0, insertionPoint);
  const suffix = code.slice(insertionPoint);
  const separator =
    prefix.length > 0 && !prefix.endsWith("\n") ? "\n" : "";
  const nextCode = `${prefix}${separator}${participantLines}\n${suffix}`;
  const labelStart = nextCode.indexOf(normalizedName, insertionPoint);
  return {
    code: nextCode,
    labelPosition: [labelStart, labelStart + normalizedName.length - 1] as [
      number,
      number,
    ],
  };
```

Also update the return type annotation on the exported function to:

```typescript
): { code: string; labelPosition: [number, number] } => {
```

- [ ] **Step 5: Run tests to verify pass**

Run: `bun run test src/utils/participantInsertTransform.spec.ts`
Expected: PASS.

- [ ] **Step 6: Update call site in `ParticipantInsertControls.tsx`**

Edit `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx`. Change:

```typescript
    const nextCode = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex,
      name,
      type: "default",
    });
    setCode(nextCode);
    onContentChange(nextCode);
```

to:

```typescript
    const { code: nextCode } = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex,
      name,
      type: "default",
    });
    setCode(nextCode);
    onContentChange(nextCode);
```

- [ ] **Step 7: Run the full unit test suite to catch regressions**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/utils/participantInsertTransform.ts src/utils/participantInsertTransform.spec.ts src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls.tsx
git commit -m "refactor(insert): return labelPosition from insertParticipantIntoDsl"
```

---

## Task 4: Extend `EditableSpan` with `onTabCreateSibling`

**Files:**
- Modify: `src/components/common/EditableSpan/EditableSpan.tsx`
- Create or modify: `src/components/common/EditableSpan/EditableSpan.spec.tsx`

Goal: when in edit mode and the parent provides `onTabCreateSibling`, pressing `Tab` should save the current text and call the callback with `"after"`; `Shift+Tab` with `"before"`. If current text is empty, Tab is a no-op (empty-text guard from the spec).

- [ ] **Step 1: Check if spec file exists**

Run: `ls src/components/common/EditableSpan/EditableSpan.spec.tsx 2>/dev/null || echo missing`

If missing, create it in Step 2 with the full content. If it exists, append the new test cases.

- [ ] **Step 2: Write the failing test**

Create or extend `src/components/common/EditableSpan/EditableSpan.spec.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableSpan } from "./EditableSpan";

describe("EditableSpan onTabCreateSibling", () => {
  it("calls callback with 'after' on Tab in edit mode", async () => {
    const onSave = vi.fn();
    const onTabCreateSibling = vi.fn();
    render(
      <EditableSpan
        text="hello"
        onSave={onSave}
        onTabCreateSibling={onTabCreateSibling}
        autoEditToken={1}
      />,
    );
    const span = screen.getByText("hello");
    const user = userEvent.setup();
    await user.keyboard("world");
    await user.keyboard("{Tab}");
    expect(onSave).toHaveBeenCalled();
    expect(onTabCreateSibling).toHaveBeenCalledWith("after");
    // the parent's span content should still be "world" (value at save)
    expect(onSave.mock.calls.at(-1)?.[0]).toContain("world");
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    span;
  });

  it("calls callback with 'before' on Shift+Tab in edit mode", async () => {
    const onSave = vi.fn();
    const onTabCreateSibling = vi.fn();
    render(
      <EditableSpan
        text="hello"
        onSave={onSave}
        onTabCreateSibling={onTabCreateSibling}
        autoEditToken={1}
      />,
    );
    const user = userEvent.setup();
    await user.keyboard("x");
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(onTabCreateSibling).toHaveBeenCalledWith("before");
  });

  it("empty-text guard: Tab on empty content is a no-op", async () => {
    const onSave = vi.fn();
    const onTabCreateSibling = vi.fn();
    render(
      <EditableSpan
        text=""
        onSave={onSave}
        onTabCreateSibling={onTabCreateSibling}
        autoEditToken={1}
      />,
    );
    const user = userEvent.setup();
    await user.keyboard("{Tab}");
    expect(onTabCreateSibling).not.toHaveBeenCalled();
  });

  it("falls back to default Tab behavior when prop not provided", async () => {
    const onSave = vi.fn();
    render(<EditableSpan text="hello" onSave={onSave} autoEditToken={1} />);
    const user = userEvent.setup();
    await user.keyboard("x");
    await user.keyboard("{Tab}");
    expect(onSave).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `bun run test src/components/common/EditableSpan/EditableSpan.spec.tsx`
Expected: FAIL — prop does not exist, callback never invoked.

- [ ] **Step 4: Extend `EditableSpan`**

Edit `src/components/common/EditableSpan/EditableSpan.tsx`.

a) Update `EditableSpanProps`:

```typescript
export interface EditableSpanProps {
  text: string;
  isEditable?: boolean;
  className?: string;
  onSave: (newText: string) => void;
  title?: string;
  autoEditToken?: number;
  selectAllOnEdit?: boolean;
  onTabCreateSibling?: (direction: "before" | "after") => void;
}
```

b) Destructure the new prop in the component signature:

```typescript
export const EditableSpan = ({
  text,
  isEditable = true,
  className = "",
  onSave,
  title = "Click to edit",
  autoEditToken,
  selectAllOnEdit = false,
  onTabCreateSibling,
}: EditableSpanProps) => {
```

c) Replace the existing `handleKeydown` Tab branch. The current `handleKeydown` does not handle Tab explicitly (Tab is handled in `handleKeyup` which saves). We need to intercept Tab in `handleKeydown` BEFORE the browser moves focus. Inside the `if (editing)` block in `handleKeydown`, add this BEFORE the existing `Enter` handler:

```typescript
    if (e.key === "Tab" && onTabCreateSibling) {
      e.preventDefault();
      e.stopPropagation();
      const currentText = spanRef.current?.innerText?.trim() ?? "";
      if (currentText === "") {
        // Empty-text guard — do nothing.
        return;
      }
      cancelRef.current = true;
      setEditing(false);
      setIsHovered(false);
      saveText();
      onTabCreateSibling(e.shiftKey ? "before" : "after");
      return;
    }
```

d) Also update `handleKeyup` so that when `onTabCreateSibling` is provided, Tab in keyup is ignored (keydown already handled it):

```typescript
  const handleKeyup = (e: KeyboardEvent) => {
    if (!isEditable) return;
    if (!editing) return;

    if (e.key === "Tab" && onTabCreateSibling) {
      // Handled in keydown.
      return;
    }

    if (e.key === "Enter" || e.key === "Tab") {
      cancelRef.current = true;
      setEditing(false);
      setIsHovered(false);
      saveText();
    }
  };
```

- [ ] **Step 5: Run tests to verify pass**

Run: `bun run test src/components/common/EditableSpan/EditableSpan.spec.tsx`
Expected: PASS (all 4 cases).

- [ ] **Step 6: Run the full unit test suite to catch regressions**

Run: `bun run test`
Expected: PASS. `EditableSpan` is used by several components — this step confirms no existing tests regressed.

- [ ] **Step 7: Commit**

```bash
git add src/components/common/EditableSpan/EditableSpan.tsx src/components/common/EditableSpan/EditableSpan.spec.tsx
git commit -m "feat(editable-span): add onTabCreateSibling prop for Miro-style sibling creation"
```

---

## Task 5: Wire `onTabCreateSibling` into `ParticipantLabel`

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx`
- Modify: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.spec.tsx`

Goal: when the user Tabs while editing a participant label, insert a new participant before/after the current one and auto-open it in edit mode.

- [ ] **Step 1: Write the failing test**

Append to `ParticipantLabel.spec.tsx`:

```typescript
describe("ParticipantLabel keyboard sibling creation", () => {
  it("Tab while editing inserts a new participant after and auto-opens it", async () => {
    // Fixture: a diagram with participants A and B
    const Fixture = ({ code }: { code: string }) => {
      const store = createStore();
      store.set(codeAtom, code);
      return (
        <Provider store={store}>
          <DiagramFrame>
            <SeqDiagram />
          </DiagramFrame>
        </Provider>
      );
    };
    const { container } = render(<Fixture code="A\nB\n" />);
    const firstLabel = container.querySelector<HTMLElement>(
      ".participant[data-participant-id='A'] .editable-span-base",
    );
    expect(firstLabel).toBeTruthy();
    firstLabel!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const user = userEvent.setup();
    await user.keyboard("{Enter}Alpha{Tab}");
    // After Tab: a new participant should be inserted after A (auto-named).
    const all = container.querySelectorAll(".participant");
    expect(all.length).toBeGreaterThanOrEqual(3);
  });
});
```

*(The existing `ParticipantLabel.spec.tsx` imports and test harness can be reused — read the file first and adapt the fixture helper to match its style.)*

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.spec.tsx`
Expected: FAIL — Tab is saved into the existing participant, no new one created.

- [ ] **Step 3: Add a helper for ring-aware insertion**

Edit `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx`. Add imports at top:

```typescript
import {
  codeAtom,
  modeAtom,
  onContentChangeAtom,
  pendingEditableRangeAtom,
  rootContextAtom,
  setFocusedParticipantAtom,
  RenderMode,
} from "@/store/Store";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";
import { OrderedParticipants, _STARTER_ } from "@/parser/OrderedParticipants";
```

- [ ] **Step 4: Implement the sibling creator**

Inside the component body, after the existing atom hooks, add:

```typescript
  const rootContext = useAtomValue(rootContextAtom);
  const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);
  const setFocusedParticipant = useSetAtom(setFocusedParticipantAtom);

  const handleTabCreateSibling = (direction: "before" | "after") => {
    if (!rootContext) return;
    const names = OrderedParticipants(rootContext)
      .map((p) => p.name)
      .filter((n) => n !== _STARTER_);
    const existing = new Set(names);
    const currentIndex = names.indexOf(props.labelText);
    if (currentIndex === -1) return;
    const insertIndex =
      direction === "after" ? currentIndex + 1 : currentIndex;
    const autoName = generateParticipantName(existing);
    const { code: nextCode, labelPosition } = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex,
      name: autoName,
      type: "default",
    });
    setCode(nextCode);
    onContentChange(nextCode);
    setPendingEditableRange({
      start: labelPosition[0],
      end: labelPosition[1],
      token: Date.now(),
    });
    setFocusedParticipant(autoName);
  };
```

Also add the helper at module scope (above the component):

```typescript
const generateParticipantName = (existing: Set<string>): string => {
  for (let i = 1; ; i++) {
    if (i <= 26) {
      const candidate = String.fromCharCode(64 + i);
      if (!existing.has(candidate)) return candidate;
      continue;
    }
    const fallback = `P${i - 26}`;
    if (!existing.has(fallback)) return fallback;
  }
};
```

*(This is duplicated from `ParticipantInsertControls.generateName` — it's 8 lines and shared extraction would require a new utility file, which we can do in a cleanup PR. For now, duplicate and note it.)*

- [ ] **Step 5: Pass the handler to `EditableSpan`**

In the returned JSX, add `onTabCreateSibling` to both `EditableSpan` usages:

```typescript
      <EditableSpan
        text={displayText}
        isEditable={props.assignee ? assigneeIsEditable : participantIsEditable}
        className={cn("name leading-4 right px-1")}
        onSave={
          props.assignee
            ? createCombinedSaveHandler(displayText)
            : createSaveHandler(props.labelPositions ?? [], props.labelText)
        }
        onTabCreateSibling={handleTabCreateSibling}
        title="Click to edit"
      />
```

- [ ] **Step 6: Run test to verify it passes**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.spec.tsx`
Expected: PASS.

- [ ] **Step 7: Run full unit suite**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.spec.tsx
git commit -m "feat(keyboard): Tab in participant label creates a sibling participant"
```

---

## Task 6: Wire `onTabCreateSibling` into `EditableLabelField` (messages)

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx`
- Create: `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.spec.tsx`

Goal: when the user Tabs while editing a message label, insert a new message in the same block, inheriting from/to from the current message, and auto-open the new label.

This requires the caller (e.g. `MessageLabel`) to pass additional context: `blockContext`, `insertIndex`, `from`, `to`. We extend `EditableLabelFieldProps` with an optional `siblingContext` object that carries those fields.

- [ ] **Step 1: Write the failing test**

Create `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.spec.tsx`:

```typescript
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { codeAtom } from "@/store/Store";
import { DiagramFrame } from "@/components/DiagramFrame/DiagramFrame";
import { SeqDiagram } from "@/components/DiagramFrame/SeqDiagram/SeqDiagram";

describe("EditableLabelField Tab-create-sibling", () => {
  it("Tab while editing a message creates another message A->B", async () => {
    const store = createStore();
    store.set(codeAtom, "A->B.m1\n");
    const { container } = render(
      <Provider store={store}>
        <DiagramFrame>
          <SeqDiagram />
        </DiagramFrame>
      </Provider>,
    );
    const label = container.querySelector<HTMLElement>(
      ".message .editable-span-base",
    );
    expect(label).toBeTruthy();
    // Click to select, then click to edit (branch behavior)
    label!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    label!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const user = userEvent.setup();
    await user.keyboard("renamed{Tab}newLabel{Enter}");
    expect(store.get(codeAtom)).toMatch(/A->B\.renamed/);
    expect(store.get(codeAtom)).toMatch(/A->B\.newLabel/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.spec.tsx`
Expected: FAIL — the second message is not created.

- [ ] **Step 3: Extend `EditableLabelFieldProps`**

Edit `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx`. Update the interface:

```typescript
interface EditableLabelFieldProps {
  text: string;
  position: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
  title?: string;
  siblingContext?: {
    from: string;
    to: string;
    blockContext: any;
    insertIndex: number;
  };
}
```

- [ ] **Step 4: Implement the handler**

Add imports at the top of the file:

```typescript
import { insertMessageInDsl } from "@/utils/insertMessageInDsl";
```

Inside the component body (after the existing hooks), add:

```typescript
  const handleTabCreateSibling = (direction: "before" | "after") => {
    if (!siblingContext) return;
    const { from, to, blockContext, insertIndex } = siblingContext;
    const effectiveIndex = direction === "after" ? insertIndex + 1 : insertIndex;
    const result = insertMessageInDsl({
      code,
      from,
      to,
      blockContext,
      insertIndex: effectiveIndex,
    });
    setCode(result.code);
    onContentChange(result.code);
    setPendingEditableRange({
      start: result.labelPosition[0],
      end: result.labelPosition[1],
      token: Date.now(),
    });
  };
```

And add `siblingContext` to the destructured props, and `onTabCreateSibling` to the `EditableSpan` render:

```typescript
export const EditableLabelField = ({
  text,
  position,
  normalizeText,
  className,
  title = "Click to edit",
  siblingContext,
}: EditableLabelFieldProps) => {
  // ...existing hooks...
  return (
    <EditableSpan
      text={formattedText}
      isEditable={isEditable}
      className={cn(className)}
      onSave={handleSave}
      title={title}
      autoEditToken={shouldAutoEdit}
      onTabCreateSibling={siblingContext ? handleTabCreateSibling : undefined}
    />
  );
};
```

- [ ] **Step 5: Pass `siblingContext` from `MessageLabel`**

Edit `src/components/DiagramFrame/SeqDiagram/MessageLayer/MessageLabel.tsx`. Extend its props to accept the sibling context and forward it:

```typescript
export const MessageLabel = (props: {
  labelText: string;
  labelPosition: [number, number];
  normalizeText?: (text: string) => string;
  className?: string;
  siblingContext?: {
    from: string;
    to: string;
    blockContext: any;
    insertIndex: number;
  };
}) => {
  return (
    <EditableLabelField
      text={props.labelText}
      position={props.labelPosition}
      normalizeText={props.normalizeText}
      className={cn("px-1 right", props.className)}
      siblingContext={props.siblingContext}
    />
  );
};
```

- [ ] **Step 6: Forward context from `Interaction` and `InteractionAsync`**

Read `Interaction.tsx`, find where `MessageLabel` is rendered, and add:

```typescript
siblingContext={{
  from: /* owner / from name for this message */,
  to: /* target / to name for this message */,
  blockContext: props.blockContext,
  insertIndex: props.insertIndex,
}}
```

The blockContext and insertIndex should already be available as props in `Interaction.tsx` (they are used by GapHandleZone). Verify by reading `Statement.tsx` which renders `Interaction`. If `insertIndex`/`blockContext` are not present as props, thread them through from `Block.tsx` → `Statement.tsx` → `Interaction.tsx` (Block already has the block context and the index of each child).

Apply the same change to `InteractionAsync.tsx` / `Interaction-async.tsx`.

- [ ] **Step 7: Run the new spec**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.spec.tsx`
Expected: PASS.

- [ ] **Step 8: Run the full unit test suite**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx \
        src/components/DiagramFrame/SeqDiagram/MessageLayer/MessageLabel.tsx \
        src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.spec.tsx \
        src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Interaction/Interaction.tsx \
        src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/InteractionAsync/Interaction-async.tsx
git commit -m "feat(keyboard): Tab in message label creates a sibling message with same from/to"
```

---

## Task 7: `useDiagramKeyboard` hook

**Files:**
- Create: `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts`
- Create: `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`

Goal: a hook that installs a keydown listener on a provided container `ref`, reading the current focused atom and dispatching arrow-key navigation. Only active when no element in the container is in edit mode (detected via `document.activeElement?.isContentEditable`).

- [ ] **Step 1: Write the failing test**

Create `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`:

```typescript
import { render, fireEvent } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import {
  codeAtom,
  focusedParticipantAtom,
  focusedMessageAtom,
} from "@/store/Store";
import { SeqDiagram } from "../SeqDiagram";
import { DiagramFrame } from "@/components/DiagramFrame/DiagramFrame";

const renderWith = (code: string) => {
  const store = createStore();
  store.set(codeAtom, code);
  const utils = render(
    <Provider store={store}>
      <DiagramFrame>
        <SeqDiagram />
      </DiagramFrame>
    </Provider>,
  );
  return { store, ...utils };
};

describe("useDiagramKeyboard", () => {
  it("Right arrow moves to next participant", () => {
    const { store, container } = renderWith("A\nB\nC\nA->B.m1\n");
    store.set(focusedParticipantAtom, "A");
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    expect(diagram).toBeTruthy();
    fireEvent.keyDown(diagram!, { key: "ArrowRight" });
    expect(store.get(focusedParticipantAtom)).toBe("B");
  });

  it("Right arrow from last participant wraps to first", () => {
    const { store, container } = renderWith("A\nB\nC\nA->B.m1\n");
    store.set(focusedParticipantAtom, "C");
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    fireEvent.keyDown(diagram!, { key: "ArrowRight" });
    expect(store.get(focusedParticipantAtom)).toBe("A");
  });

  it("Left arrow wraps backwards", () => {
    const { store, container } = renderWith("A\nB\nC\n");
    store.set(focusedParticipantAtom, "A");
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    fireEvent.keyDown(diagram!, { key: "ArrowLeft" });
    expect(store.get(focusedParticipantAtom)).toBe("C");
  });

  it("Down from participant drops into messages ring", () => {
    const { store, container } = renderWith("A\nB\nA->B.m1\n");
    store.set(focusedParticipantAtom, "A");
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    fireEvent.keyDown(diagram!, { key: "ArrowDown" });
    expect(store.get(focusedParticipantAtom)).toBeNull();
    expect(store.get(focusedMessageAtom)).not.toBeNull();
  });

  it("Down in messages moves to next message", () => {
    const { store, container } = renderWith("A->B.m1\nA->B.m2\n");
    // Focus first message
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    fireEvent.keyDown(diagram!, { key: "ArrowDown" });
    const first = store.get(focusedMessageAtom);
    fireEvent.keyDown(diagram!, { key: "ArrowDown" });
    const second = store.get(focusedMessageAtom);
    expect(second).not.toEqual(first);
  });

  it("Up from first message jumps back to the source participant", () => {
    const { store, container } = renderWith("A->B.m1\n");
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    fireEvent.keyDown(diagram!, { key: "ArrowDown" }); // into messages
    fireEvent.keyDown(diagram!, { key: "ArrowUp" });
    expect(store.get(focusedParticipantAtom)).toBe("A");
    expect(store.get(focusedMessageAtom)).toBeNull();
  });

  it("arrow keys are ignored when a contenteditable has focus", () => {
    const { store, container } = renderWith("A\nB\n");
    store.set(focusedParticipantAtom, "A");
    // Create a contenteditable and focus it
    const editable = document.createElement("span");
    editable.contentEditable = "true";
    container.appendChild(editable);
    editable.focus();
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    fireEvent.keyDown(diagram!, { key: "ArrowRight" });
    expect(store.get(focusedParticipantAtom)).toBe("A"); // unchanged
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: FAIL — hook not yet implemented.

- [ ] **Step 3: Implement the hook**

Create `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts`:

```typescript
import { useEffect, RefObject } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  rootContextAtom,
  focusedParticipantAtom,
  focusedMessageAtom,
  setFocusedParticipantAtom,
  setFocusedMessageAtom,
} from "@/store/Store";
import { buildParticipantRing, buildMessageRing } from "./rings";

export const useDiagramKeyboard = (
  containerRef: RefObject<HTMLElement | null>,
) => {
  const rootContext = useAtomValue(rootContextAtom);
  const focusedParticipant = useAtomValue(focusedParticipantAtom);
  const focusedMessage = useAtomValue(focusedMessageAtom);
  const setFocusedParticipant = useSetAtom(setFocusedParticipantAtom);
  const setFocusedMessage = useSetAtom(setFocusedMessageAtom);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // Ignore if a contenteditable is focused (edit mode).
      const active = document.activeElement as HTMLElement | null;
      if (active?.isContentEditable) return;

      const key = event.key;
      if (
        key !== "ArrowLeft" &&
        key !== "ArrowRight" &&
        key !== "ArrowUp" &&
        key !== "ArrowDown"
      ) {
        return;
      }

      const participants = buildParticipantRing(rootContext);
      const messages = buildMessageRing(rootContext);

      // Participant ring
      if (focusedParticipant !== null) {
        const idx = participants.indexOf(focusedParticipant);
        if (idx === -1) return;
        if (key === "ArrowRight") {
          event.preventDefault();
          setFocusedParticipant(participants[(idx + 1) % participants.length]);
          return;
        }
        if (key === "ArrowLeft") {
          event.preventDefault();
          setFocusedParticipant(
            participants[(idx - 1 + participants.length) % participants.length],
          );
          return;
        }
        if (key === "ArrowDown") {
          if (messages.length === 0) return;
          event.preventDefault();
          setFocusedMessage({
            start: messages[0].labelStart,
            end: messages[0].labelEnd,
          });
          return;
        }
        return;
      }

      // Message ring
      if (focusedMessage !== null) {
        const idx = messages.findIndex(
          (m) =>
            m.labelStart === focusedMessage.start &&
            m.labelEnd === focusedMessage.end,
        );
        if (idx === -1) return;
        if (key === "ArrowDown") {
          event.preventDefault();
          const next = messages[(idx + 1) % messages.length];
          setFocusedMessage({ start: next.labelStart, end: next.labelEnd });
          return;
        }
        if (key === "ArrowUp") {
          event.preventDefault();
          if (idx === 0) {
            // Jump to the source participant of the first message.
            setFocusedParticipant(messages[0].from);
            return;
          }
          const prev = messages[idx - 1];
          setFocusedMessage({ start: prev.labelStart, end: prev.labelEnd });
          return;
        }
        return;
      }

      // Nothing focused — ArrowDown enters the messages ring at index 0,
      // ArrowRight/Left enters the participant ring at index 0.
      if (key === "ArrowDown" && messages.length > 0) {
        event.preventDefault();
        setFocusedMessage({
          start: messages[0].labelStart,
          end: messages[0].labelEnd,
        });
        return;
      }
      if (
        (key === "ArrowRight" || key === "ArrowLeft") &&
        participants.length > 0
      ) {
        event.preventDefault();
        setFocusedParticipant(participants[0]);
        return;
      }
    };

    container.addEventListener("keydown", onKeyDown);
    return () => container.removeEventListener("keydown", onKeyDown);
  }, [
    containerRef,
    rootContext,
    focusedParticipant,
    focusedMessage,
    setFocusedParticipant,
    setFocusedMessage,
  ]);
};
```

- [ ] **Step 4: Run the unit tests to verify pass**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: PASS (all 7 cases). If the "nothing focused → ArrowDown" test needs a fresh store, adjust the test setup.

- [ ] **Step 5: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts \
        src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx
git commit -m "feat(keyboard): add useDiagramKeyboard hook for arrow-key navigation"
```

---

## Task 8: Install the hook on `SeqDiagram` + tabIndex + auto-focus

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx`

- [ ] **Step 1: Write the failing test**

Append to `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`:

```typescript
describe("SeqDiagram container focus", () => {
  it("focusing the container auto-focuses the first participant", () => {
    const { store, container } = renderWith("A\nB\nC\n");
    const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
    expect(diagram).toBeTruthy();
    diagram!.focus();
    expect(store.get(focusedParticipantAtom)).toBe("A");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: FAIL — container is not focusable yet.

- [ ] **Step 3: Wire the hook and tabIndex**

Edit `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx`. Add imports:

```typescript
import { useDiagramKeyboard } from "./keyboard/useDiagramKeyboard";
import {
  focusedParticipantAtom,
  setFocusedParticipantAtom,
} from "@/store/Store";
import { buildParticipantRing } from "./keyboard/rings";
```

Inside the component body, add:

```typescript
  useDiagramKeyboard(diagramRef);
  const setFocusedParticipant = useSetAtom(setFocusedParticipantAtom);
  const focusedParticipant = useAtomValue(focusedParticipantAtom);

  const handleContainerFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    // Only act when the container itself received focus (not a child).
    if (event.target !== diagramRef.current) return;
    if (focusedParticipant !== null) return;
    const ring = buildParticipantRing(rootContext);
    if (ring.length > 0) {
      setFocusedParticipant(ring[0]);
    }
  };
```

Update the container `<div>`:

```typescript
    <div
      className={cn(
        "zenuml sequence-diagram relative box-border text-left overflow-visible px-2.5",
        theme,
        props.className,
      )}
      style={props.style}
      ref={diagramRef}
      tabIndex={0}
      onFocus={handleContainerFocus}
    >
```

- [ ] **Step 4: Run test to verify pass**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Run full unit suite**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx \
        src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx
git commit -m "feat(keyboard): tabIndex + auto-focus first participant on SeqDiagram"
```

---

## Task 9: Focus ring visuals

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx`
- Modify: `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx`
- Modify: `src/components/DiagramFrame/SeqDiagram/SeqDiagram.css`

Goal: show a 2px sky-blue ring on the focused participant / message label without interfering with existing `.selected` styles.

- [ ] **Step 1: Add CSS classes**

Append to `src/components/DiagramFrame/SeqDiagram/SeqDiagram.css`:

```css
.participant.kb-focused {
  outline: 2px solid rgb(56, 189, 248);
  outline-offset: 2px;
}

.editable-span-base.kb-focused {
  outline: 2px solid rgb(56, 189, 248);
  outline-offset: 2px;
  border-radius: 2px;
}
```

- [ ] **Step 2: Apply class in `Participant.tsx`**

Edit `Participant.tsx`. Import:

```typescript
import { focusedParticipantAtom } from "@/store/Store";
```

In the component, add:

```typescript
  const focusedParticipant = useAtomValue(focusedParticipantAtom);
  const isKeyboardFocused = focusedParticipant === props.entity.name;
```

Update the outer `div` className with `{ "kb-focused": isKeyboardFocused }` in the `cn(...)` call.

- [ ] **Step 3: Apply class in `EditableLabelField.tsx`**

Edit `EditableLabelField.tsx`. Add:

```typescript
import { focusedMessageAtom } from "@/store/Store";
```

In the component body:

```typescript
  const focusedMessage = useAtomValue(focusedMessageAtom);
  const isKeyboardFocused =
    focusedMessage !== null &&
    focusedMessage.start === position[0] &&
    focusedMessage.end === position[1];
```

Update the `className` passed to `EditableSpan`:

```typescript
      className={cn(className, { "kb-focused": isKeyboardFocused })}
```

- [ ] **Step 4: Manual smoke test**

Run: `bun dev`
Open http://localhost:8080, focus the diagram, press `→`, confirm sky-blue ring moves between participants; press `↓`, confirm ring moves to message label.

- [ ] **Step 5: Run unit suite**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx \
        src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx \
        src/components/DiagramFrame/SeqDiagram/SeqDiagram.css
git commit -m "feat(keyboard): sky-blue focus ring for keyboard navigation"
```

---

## Task 10: Enter on focused element opens edit mode

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts`
- Modify: `src/components/DiagramFrame/SeqDiagram/MessageLayer/EditableLabelField.tsx`
- Modify: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx`

Goal: `Enter` on a kb-focused participant / message opens its `EditableSpan` in edit mode. Reuse the `autoEditToken` plumbing via `pendingEditableRangeAtom` for messages, and directly via `autoEditToken` for participants.

Strategy: the hook dispatches Enter by setting `pendingEditableRangeAtom` to the focused element's range. `EditableLabelField` already consumes `pendingEditableRangeAtom` to auto-open. For participants, we add the same pattern: `ParticipantLabel` starts editing when `pendingEditableRangeAtom` matches any of its `labelPositions`.

- [ ] **Step 1: Write the failing test**

Append to `useDiagramKeyboard.spec.tsx`:

```typescript
it("Enter on focused message opens its label for editing", () => {
  const { store, container } = renderWith("A->B.m1\n");
  const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
  fireEvent.keyDown(diagram!, { key: "ArrowDown" });
  fireEvent.keyDown(diagram!, { key: "Enter" });
  // pendingEditableRange should be set to the focused message range
  const pending = store.get(pendingEditableRangeAtom);
  expect(pending).not.toBeNull();
});
```

Add the import for `pendingEditableRangeAtom` at the top of the spec.

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Extend the hook**

Edit `useDiagramKeyboard.ts`. Add Enter handling. At the top of `onKeyDown`, after the contenteditable guard, before the arrow-key early return, add:

```typescript
      if (key === "Enter") {
        if (focusedMessage !== null) {
          event.preventDefault();
          setPendingEditableRange({
            start: focusedMessage.start,
            end: focusedMessage.end,
            token: Date.now(),
          });
          return;
        }
        if (focusedParticipant !== null) {
          event.preventDefault();
          setPendingParticipantEdit({
            name: focusedParticipant,
            token: Date.now(),
          });
          return;
        }
        return;
      }
```

Add the imports:

```typescript
import {
  pendingEditableRangeAtom,
  pendingParticipantEditAtom,
} from "@/store/Store";
```

And inside the hook, add `const setPendingEditableRange = useSetAtom(pendingEditableRangeAtom);` and `const setPendingParticipantEdit = useSetAtom(pendingParticipantEditAtom);`.

- [ ] **Step 4: Add `pendingParticipantEditAtom` to `Store`**

Edit `src/store/keyboardAtoms.ts`:

```typescript
export type PendingParticipantEdit = { name: string; token: number };
export const pendingParticipantEditAtom = atom<PendingParticipantEdit | null>(
  null,
);
```

Re-export from `Store.ts`:

```typescript
export {
  // ...
  pendingParticipantEditAtom,
} from "./keyboardAtoms";
export type { PendingParticipantEdit } from "./keyboardAtoms";
```

- [ ] **Step 5: Consume in `ParticipantLabel`**

Edit `ParticipantLabel.tsx`. Add:

```typescript
import { pendingParticipantEditAtom } from "@/store/Store";
```

Inside the component:

```typescript
  const pendingParticipantEdit = useAtomValue(pendingParticipantEditAtom);
  const autoEditToken =
    pendingParticipantEdit?.name === props.labelText
      ? pendingParticipantEdit.token
      : undefined;
```

Pass `autoEditToken={autoEditToken}` to the `<EditableSpan>` render.

- [ ] **Step 6: Run tests to verify pass**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.spec.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts \
        src/store/keyboardAtoms.ts \
        src/store/Store.ts \
        src/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel.tsx \
        src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx
git commit -m "feat(keyboard): Enter on focused element opens edit mode"
```

---

## Task 11: Escape blurs the diagram; Tab escapes outside edit mode

**Files:**
- Modify: `src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts`

Goal: `Esc` outside edit mode clears focus atoms and blurs the container. `Tab` outside edit mode lets the browser's default tabbing run (no `preventDefault`) so the user Tabs out to the next page widget.

- [ ] **Step 1: Write the failing test**

Append to `useDiagramKeyboard.spec.tsx`:

```typescript
it("Escape clears focus atoms and blurs the diagram", () => {
  const { store, container } = renderWith("A\nB\n");
  store.set(focusedParticipantAtom, "A");
  const diagram = container.querySelector<HTMLElement>(".sequence-diagram");
  diagram!.focus();
  fireEvent.keyDown(diagram!, { key: "Escape" });
  expect(store.get(focusedParticipantAtom)).toBeNull();
  expect(document.activeElement).not.toBe(diagram);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement Escape handling**

Edit `useDiagramKeyboard.ts`. In `onKeyDown`, after the contenteditable guard, add:

```typescript
      if (key === "Escape") {
        event.preventDefault();
        setFocusedParticipant(null);
        setFocusedMessage(null);
        (document.activeElement as HTMLElement | null)?.blur();
        return;
      }
```

Tab needs no explicit handling — the browser's default Tab behavior will move focus out of the diagram container naturally (since the container is `tabIndex=0` and nothing inside is captured).

- [ ] **Step 4: Run tests to verify pass**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.ts \
        src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx
git commit -m "feat(keyboard): Escape clears focus and blurs the diagram"
```

---

## Task 12: Empty-diagram placeholder

**Files:**
- Create: `src/components/DiagramFrame/SeqDiagram/keyboard/EmptyDiagramPlaceholder.tsx`
- Modify: `src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx`

Goal: when there are no participants, render a focusable dashed box that says "Add participant". Enter creates a blank participant and auto-opens it.

- [ ] **Step 1: Write the failing test**

Append to `useDiagramKeyboard.spec.tsx`:

```typescript
it("empty diagram renders a focusable placeholder; Enter creates a participant", () => {
  const { store, container } = renderWith("");
  const placeholder = container.querySelector<HTMLElement>(
    "[data-testid='empty-diagram-placeholder']",
  );
  expect(placeholder).toBeTruthy();
  placeholder!.focus();
  fireEvent.keyDown(placeholder!, { key: "Enter" });
  // A participant should have been inserted.
  const code = store.get(codeAtom);
  expect(code.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: FAIL — placeholder does not exist.

- [ ] **Step 3: Create the placeholder component**

Create `src/components/DiagramFrame/SeqDiagram/keyboard/EmptyDiagramPlaceholder.tsx`:

```typescript
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  codeAtom,
  onContentChangeAtom,
  pendingParticipantEditAtom,
  rootContextAtom,
  setFocusedParticipantAtom,
} from "@/store/Store";
import { insertParticipantIntoDsl } from "@/utils/participantInsertTransform";

export const EmptyDiagramPlaceholder = () => {
  const [code, setCode] = useAtom(codeAtom);
  const onContentChange = useAtomValue(onContentChangeAtom);
  const rootContext = useAtomValue(rootContextAtom);
  const setPending = useSetAtom(pendingParticipantEditAtom);
  const setFocusedParticipant = useSetAtom(setFocusedParticipantAtom);

  const handleAdd = () => {
    const { code: nextCode } = insertParticipantIntoDsl({
      code,
      rootContext,
      insertIndex: 0,
      name: "A",
      type: "default",
    });
    setCode(nextCode);
    onContentChange(nextCode);
    setFocusedParticipant("A");
    setPending({ name: "A", token: Date.now() });
  };

  return (
    <div
      data-testid="empty-diagram-placeholder"
      tabIndex={0}
      role="button"
      aria-label="Add participant"
      className="m-4 inline-flex items-center justify-center px-4 py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded cursor-pointer focus:outline-none focus-visible:border-sky-400 focus-visible:text-sky-500"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleAdd();
        }
      }}
      onClick={handleAdd}
    >
      + Add participant
    </div>
  );
};
```

- [ ] **Step 4: Render when the diagram is empty**

Edit `SeqDiagram.tsx`. Import:

```typescript
import { EmptyDiagramPlaceholder } from "./keyboard/EmptyDiagramPlaceholder";
```

In the JSX, wrap the existing inner content. Before the existing layer rendering, add:

```typescript
const isEmpty =
  coordinates.orderedParticipantNames().filter((n) => n !== "_STARTER_")
    .length === 0;
```

And inside the `Dynamic` branch:

```tsx
{isEmpty ? (
  <EmptyDiagramPlaceholder />
) : (
  <>
    <LifeLineLayer /* ... */ />
    <MessageLayer /* ... */ />
    <LifeLineLayer /* ... */ />
  </>
)}
```

- [ ] **Step 5: Run tests to verify pass**

Run: `bun run test src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx`
Expected: PASS.

- [ ] **Step 6: Run the full unit suite**

Run: `bun run test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/DiagramFrame/SeqDiagram/keyboard/EmptyDiagramPlaceholder.tsx \
        src/components/DiagramFrame/SeqDiagram/SeqDiagram.tsx \
        src/components/DiagramFrame/SeqDiagram/keyboard/useDiagramKeyboard.spec.tsx
git commit -m "feat(keyboard): empty-diagram placeholder with focusable add-participant affordance"
```

---

## Task 13: Playwright E2E fixture and test

**Files:**
- Create: `e2e/fixtures/keyboard-editing.html`
- Create: `tests/keyboard-editing.spec.ts`

- [ ] **Step 1: Create the fixture**

Use an existing fixture as a template. Run:

```bash
ls e2e/fixtures/editable-label.html
```

Copy its structure. Create `e2e/fixtures/keyboard-editing.html` — seed the diagram with `A\nB\nA->B.hello\n`. Follow the exact pattern of `e2e/fixtures/editable-label.html` (same `<script>` setup, same zenuml bootstrap).

- [ ] **Step 2: Write the E2E test**

Create `tests/keyboard-editing.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("keyboard editing", () => {
  test("Tab in, arrow-navigate, Enter to edit, Tab to create sibling", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/keyboard-editing.html");

    const diagram = page.locator(".sequence-diagram").first();
    await diagram.focus();

    // First participant should have a kb-focused outline.
    await expect(
      page.locator(".participant[data-participant-id='A']"),
    ).toHaveClass(/kb-focused/);

    // Right arrow moves to B.
    await page.keyboard.press("ArrowRight");
    await expect(
      page.locator(".participant[data-participant-id='B']"),
    ).toHaveClass(/kb-focused/);

    // Enter to edit, type a new name, Tab to spawn a sibling.
    await page.keyboard.press("Enter");
    await page.keyboard.type("Bravo");
    await page.keyboard.press("Tab");
    await page.keyboard.type("Charlie");
    await page.keyboard.press("Enter");

    // Three participants should exist now.
    await expect(page.locator(".participant")).toHaveCount(3);
    await expect(
      page.locator(".participant[data-participant-id='Charlie']"),
    ).toBeVisible();

    // Move into messages ring.
    await page.keyboard.press("ArrowLeft"); // back to Bravo
    await page.keyboard.press("ArrowLeft"); // back to A
    await page.keyboard.press("ArrowDown"); // into messages
    await expect(page.locator(".message.kb-focused")).toBeVisible();

    // Enter to edit the message, then Tab to create a sibling.
    await page.keyboard.press("Enter");
    await page.keyboard.type("renamed");
    await page.keyboard.press("Tab");
    await page.keyboard.type("second");
    await page.keyboard.press("Enter");

    // Two messages now.
    await expect(page.locator(".message")).toHaveCount(2);
  });

  test("Escape blurs the diagram", async ({ page }) => {
    await page.goto("/e2e/fixtures/keyboard-editing.html");
    const diagram = page.locator(".sequence-diagram").first();
    await diagram.focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Escape");
    await expect(
      page.locator(".participant.kb-focused"),
    ).toHaveCount(0);
  });
});
```

- [ ] **Step 3: Run the E2E test**

Run: `bun pw tests/keyboard-editing.spec.ts`
Expected: PASS. If the CSS class names in the fixture differ (e.g. `.message` selector), adjust the spec selectors to match what the rendered DOM actually uses.

- [ ] **Step 4: Commit**

```bash
git add e2e/fixtures/keyboard-editing.html tests/keyboard-editing.spec.ts
git commit -m "test(e2e): keyboard editing flow — Tab, arrow nav, Tab-sibling"
```

---

## Task 14: Lint, format, full test suite

- [ ] **Step 1: Run lint**

Run: `bun eslint`
Expected: no errors. Fix any introduced.

- [ ] **Step 2: Run prettier**

Run: `bun prettier`
Expected: no diff. If there is a diff, `git add` and amend-free commit it in Step 4.

- [ ] **Step 3: Run unit tests**

Run: `bun run test`
Expected: PASS across the whole suite.

- [ ] **Step 4: Run E2E smoke tests**

Run: `bun pw:smoke`
Expected: PASS.

- [ ] **Step 5: If formatter produced a diff, commit it**

```bash
git add -u
git commit -m "style: prettier formatting for keyboard editing"
```

---

## Self-Review (for plan author)

**Spec coverage**

- ✅ Two focus rings (participants, messages) — Tasks 1, 2, 7
- ✅ Arrow-key navigation — Task 7
- ✅ Enter enters edit mode — Task 10
- ✅ Esc blurs diagram — Task 11
- ✅ Tab escapes widget outside edit mode — Task 11 (relies on browser default; explicitly not prevented)
- ✅ Tab/Shift+Tab in edit mode creates sibling after/before — Tasks 4, 5, 6
- ✅ Participant Tab-sibling — Task 5
- ✅ Message Tab-sibling inherits from/to — Task 6
- ✅ Empty-text guard — Task 4
- ✅ Empty-diagram placeholder — Task 12
- ✅ Auto-open new element in edit mode — Tasks 5, 6 (via `pendingEditableRangeAtom` / `pendingParticipantEditAtom`)
- ✅ Focus ring visuals — Task 9
- ✅ Don't touch mouse paths — confirmed (only `EditableSpan` gains an optional prop)
- ✅ Tests: ring builder unit, keyboard hook unit, EditableSpan unit, E2E flow — Tasks 2, 4, 7, 13

**Placeholder scan** — no "TBD", no "add appropriate X", no "similar to task N". One known duplication (`generateParticipantName` in `ParticipantLabel.tsx` and `ParticipantInsertControls.tsx`) is called out explicitly in Task 5.

**Type consistency** — `focusedMessageAtom` stores `{ start, end }`; `MessageRingEntry` uses `labelStart` / `labelEnd`. The hook (Task 7) explicitly maps between them. `insertParticipantIntoDsl` return shape change is propagated through Task 3 and call sites are updated.

**Known risk:** Task 2 depends on ANTLR fragment accessor names (`.block()`, `.braceBlock()`). If the actual generated accessors differ, Task 2 Step 5 instructs the engineer to read the grammar and adjust. The ring tests will catch this immediately.

**Known risk:** Task 6 requires `blockContext` and `insertIndex` to be available in `Interaction.tsx`. `GapHandleZone` already receives these, so they are computed in `Block.tsx` — the engineer may need to thread them through `Statement.tsx`. This is a mechanical prop drill.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-15-keyboard-editing-on-diagram.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**

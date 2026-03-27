# SVG Parity Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stereotype labels, participant colors, and group rendering to the native SVG renderer to close feature parity gaps before publishing.

**Architecture:** Extend the existing data flow: parser model → `OrderedParticipants()` → `IParticipantModel` → `ParticipantGeometry` → SVG rendering. Each feature adds a field to the model interface, passes it through geometry, and renders it in the SVG participant component.

**Tech Stack:** TypeScript, SVG, Bun test runner

---

## File Structure

| File | Responsibility | Changes |
|------|---------------|---------|
| `src/parser/IParticipantModel.ts` | Model interface | Add `stereotype?`, `color?`, `groupId?` |
| `src/parser/OrderedParticipants.ts` | Parser → model extraction | Pass stereotype, color, groupId from collector |
| `src/svg/geometry.ts` | Geometry IR types | Add `stereotype?`, `color?`, `groupId?` to `ParticipantGeometry` |
| `src/svg/buildGeometry.ts` | Geometry builder | Extract new fields in `buildParticipants()` |
| `src/svg/components/participant.ts` | SVG participant renderer | Render stereotype label, apply color fill |
| `src/svg/components/group.ts` | **New** — SVG group renderer | Render dashed outline + title bar |
| `src/svg/composeSvg.ts` | SVG compositor | Render group elements |
| `e2e/data/compare-cases.js` | Test cases | order-service case already added |

---

### Task 1: Add stereotype to SVG participants

**Files:**
- Modify: `src/parser/IParticipantModel.ts:4-19`
- Modify: `src/parser/OrderedParticipants.ts:49-59`
- Modify: `src/svg/geometry.ts:10-24`
- Modify: `src/svg/buildGeometry.ts:301-312`
- Modify: `src/svg/components/participant.ts:19-70`
- Test: `src/svg/renderToSvg.spec.ts`

- [ ] **Step 1: Write the failing test**

In `src/svg/renderToSvg.spec.ts`, add:
```typescript
it("renders stereotype label on participant", () => {
  const result = renderToSvg('@EC2 <<BFF>> OrderService\nOrderService.method()');
  expect(result.innerSvg).toContain("«BFF»");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --testPathPattern renderToSvg`
Expected: FAIL — "«BFF»" not found in output

- [ ] **Step 3: Add `stereotype` to `IParticipantModel`**

In `src/parser/IParticipantModel.ts`, add `stereotype?: string;` to the interface.

- [ ] **Step 4: Pass stereotype from `OrderedParticipants`**

In `src/parser/OrderedParticipants.ts:53-58`, pass `participant.stereotype`:
```typescript
return new Participant(
  participant.name,
  previousName,
  participant.label,
  participant.type,
  participant.stereotype, // NEW
);
```

Update the `Participant` class constructor (same file, around line 7) to accept and store `stereotype`.

- [ ] **Step 5: Add `stereotype` to `ParticipantGeometry`**

In `src/svg/geometry.ts`, add to the interface:
```typescript
stereotype?: string;
```

- [ ] **Step 6: Extract stereotype in `buildParticipants`**

In `src/svg/buildGeometry.ts`, in the return object around line 301-312, add:
```typescript
stereotype: m.stereotype,
```

- [ ] **Step 7: Render stereotype in SVG participant**

In `src/svg/components/participant.ts`, in `renderParticipant()`, add stereotype label rendering above the participant name. The stereotype renders as `«text»` in a smaller font, positioned between the icon (if any) and the main label. Reference HTML: `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx:126-130`.

Add after the label text element:
```typescript
if (p.stereotype) {
  const stereoY = textY - 14; // Above main label
  elements.push(`<text x="${textX}" y="${stereoY}" text-anchor="middle" font-size="12" fill="#666">«${escXml(p.stereotype)}»</text>`);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `bun run test -- --testPathPattern renderToSvg`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: add stereotype labels to SVG participants"
```

---

### Task 2: Add participant background colors

**Files:**
- Modify: `src/parser/IParticipantModel.ts`
- Modify: `src/parser/OrderedParticipants.ts`
- Modify: `src/svg/geometry.ts`
- Modify: `src/svg/buildGeometry.ts`
- Modify: `src/svg/components/participant.ts`
- Test: `src/svg/renderToSvg.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("renders participant with background color", () => {
  const result = renderToSvg('@Actor Client #FFEBE6\nClient.method()');
  expect(result.innerSvg).toContain('fill="#FFEBE6"');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --testPathPattern renderToSvg`
Expected: FAIL

- [ ] **Step 3: Add `color` to model, geometry, and builder**

Same pattern as Task 1:
- `IParticipantModel.ts`: add `color?: string`
- `OrderedParticipants.ts`: pass `participant.color` to constructor
- `geometry.ts`: add `color?: string` to `ParticipantGeometry`
- `buildGeometry.ts`: add `color: m.color` to the return object

- [ ] **Step 4: Apply color in SVG participant renderer**

In `src/svg/components/participant.ts`, modify the participant rect fill:
```typescript
// If color is provided, use it; otherwise use default white
const fillColor = p.color ? `#${p.color.replace('#', '')}` : "#ffffff";
```

Apply to the rect element's `fill` attribute. Also compute text color for contrast:
```typescript
// Simple brightness check for text color
function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? "#333" : "#fff";
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `bun run test -- --testPathPattern renderToSvg`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add participant background colors to SVG renderer"
```

---

### Task 3: Add participant group rendering

**Files:**
- Create: `src/svg/components/group.ts`
- Modify: `src/svg/geometry.ts`
- Modify: `src/svg/buildGeometry.ts`
- Modify: `src/svg/composeSvg.ts`
- Test: `src/svg/renderToSvg.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
it("renders participant group container", () => {
  const code = 'group BusinessService {\n  @Lambda A\n  @Database B\n}\nA.method()';
  const result = renderToSvg(code);
  expect(result.innerSvg).toContain("BusinessService");
  // Group should have a dashed outline
  expect(result.innerSvg).toContain("stroke-dasharray");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- --testPathPattern renderToSvg`
Expected: FAIL

- [ ] **Step 3: Add `GroupGeometry` to geometry types**

In `src/svg/geometry.ts`:
```typescript
export interface GroupGeometry {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

Add `groups: GroupGeometry[]` to the build result.

- [ ] **Step 4: Build group geometry**

In `src/svg/buildGeometry.ts`, detect groups from the parser context. The parser's `ToCollector.getParticipants()` returns participants with `groupId`. Group participants that share a `groupId`, compute the bounding box from the leftmost to rightmost participant in the group, and create `GroupGeometry` entries.

Key data: Each participant from the collector has `groupId` and the group context has `name().getFormattedText()` for the label.

- [ ] **Step 5: Create group SVG renderer**

Create `src/svg/components/group.ts`:
```typescript
export function renderGroup(g: GroupGeometry): string {
  // Dashed outline matching HTML's outline-dashed
  return `<g class="participant-group">
    <rect x="${g.x}" y="${g.y}" width="${g.width}" height="${g.height}" fill="none" stroke="#999" stroke-dasharray="4 2" rx="2"/>
    <text x="${g.x + 4}" y="${g.y + 14}" font-size="12" fill="#666">${escXml(g.name)}</text>
  </g>`;
}
```

- [ ] **Step 6: Integrate groups into composeSvg**

In `src/svg/composeSvg.ts`, render groups before participants (so they appear behind).

- [ ] **Step 7: Run test to verify it passes**

Run: `bun run test -- --testPathPattern renderToSvg`
Expected: PASS

- [ ] **Step 8: Visual verification**

Run: `bun dev` → open `http://localhost:8080/e2e/tools/compare-case.html?case=order-service`
Verify: "BusinessService" group container visible around PurchaseService and InvoiceService

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: add participant group rendering to SVG renderer"
```

---

### Task 4: Visual verification and regression check

- [ ] **Step 1: Run all unit tests**

Run: `bun run test`
Expected: All tests pass

- [ ] **Step 2: Check order-service compare case**

Open `http://localhost:8080/e2e/tools/compare-case.html?case=order-service`
Verify:
- Stereotype `«BFF»` appears on OrderService
- Client has pink (#FFEBE6) background
- OrderController has blue (#0747A6) background with white text
- OrderService has green (#E3FCEF) background
- BusinessService group outline visible around PurchaseService + InvoiceService

- [ ] **Step 3: Check existing cases for regressions**

Open `http://localhost:8080/e2e/tools/compare-case.html?case=self-sync` — should still be ~98%
Open `http://localhost:8080/e2e/tools/compare-case.html?case=demo1-smoke` — check icons + groups

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A && git commit -m "fix: visual parity adjustments"
```

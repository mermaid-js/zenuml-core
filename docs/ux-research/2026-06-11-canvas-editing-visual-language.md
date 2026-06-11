---
scenario_id: canvas-editing-visual-language
scenario_title: Visual presentation audit of on-canvas editing affordances
run_date: 2026-06-11
zenuml_core_sha: 2a7beba
method: static code analysis (component styling, CSS, layering, theming); companion to 2026-06-11-canvas-editing-gap-report.md
---

# Canvas Editing — Visual Language Audit

The companion gap report covered *what* the user can do on the canvas. This report covers *how those capabilities look*: where each control appears relative to its target, what color and size it is, when it reveals itself, what layer it sits on, and whether the pieces add up to one coherent visual grammar. It audits the existing affordances as a system and ends with a proposed grammar that future affordances (delete, unwrap, context menu) should slot into. No code was changed.

---

## 1. Headline finding: a selected message has no visible selected state

Participants show selection clearly: a sky ring (`ring-2 ring-sky-400`, `Participant.tsx:102`). Messages show **nothing**. `data-selected="true"` is set on the message element (`Message.tsx:69`, `MessageView.tsx:64`, `SelfInvocation.tsx:46`) but no CSS rule anywhere in `src/` targets it — grep for `data-selected` / `data-[selected` across all `.css` and component files finds only the attribute being *written* and one place *reading* it as a behavior guard (`EditableSpan.tsx:107`). The attribute drives logic, not pixels.

So when a user clicks a message, the only feedback is (a) a floating style panel appearing *somewhere below*, and (b) the native tooltip text changing from "Click to select · drag to reorder" to "Click label to edit · drag to reorder" (`Message.tsx:70-76`) — which they will only see after the next 1-second hover. The interaction model is click-to-select / click-again-to-edit, which is a fine pattern (§3.2 of the gap report), but the model is invisible: the user cannot see *that* the first click did anything to the message, so the second click's different behavior feels random. This is the single highest-leverage visual fix on the canvas, and the spec already half-exists — whatever the participant ring does, the message should do (e.g., tinting the arrow/label via a `[data-selected="true"]` rule using the existing `--color-message-arrow` token family).

The same applies to the **drag-to-reorder** states: `data-reorder-state` is set to `pending`/`dragging` (`Block.tsx:145-167`) but the only visual consequences are `select-none`, a grabbing cursor, and the drop line on the *target*. The dragged message itself never changes appearance — no dimming, no ghost — so the user's eye has nothing confirming what is being moved.

---

## 2. Color: two-and-a-half accent systems, none tokenized

Inventory of every accent color used by editing chrome (all hardcoded Tailwind utilities or hex, none routed through the theme's `--color-*` skin tokens):

| Color family | Used for | Evidence |
|---|---|---|
| **Sky** (sky-300/400/500) | participant selection ring; reorder drop line; participant-insert "+" hover & focus rings; empty-diagram prompt hover; drag *source* highlight | `Participant.tsx:102`, `Block.tsx:201`, `ParticipantInsertControls.tsx:182`, `EmptyDiagramPrompt.tsx:23`, `MessageCreateControls.tsx:233` |
| **Amber** (amber-300/400/500, #d97706) | gap-handle "+" buttons; dashed gap guide line; drag line & drag cursor badge; drag *target* highlight; divider button | `GapHandleZone.tsx:142,148,167`, `MessageCreateControls.tsx:190,197,232` |
| **Blue** (blue-300 #93c5fd, blue-50 #eff6ff) | inline-edit active state (dashed outline + tint) | `EditableSpan.css:6-9` |
| **Gray/slate** | editable-label hover state; participant-insert "+" resting state; panel chrome | `EditableSpan.css:11-15`, `ParticipantInsertControls.tsx:182` |

The intended semantics are legible — roughly *sky = selection/structure, amber = creation* — but they leak across each other in ways a user will register as noise:

1. **Participant insertion is a creation act drawn in selection colors.** The "+" between participants hovers sky (`ParticipantInsertControls.tsx:182`) while the visually identical "+" in message gaps is amber (`GapHandleZone.tsx:148`). Same glyph, same size, same shape, same verb ("insert something here") — different palette depending on which axis you're inserting along.
2. **One gesture, two accents.** During a create-drag, the source participant is ringed sky and the target amber (`MessageCreateControls.tsx:230-234`). The user is mid-gesture in the amber "creation" mode while the thing they grabbed glows in the unrelated selection color.
3. **Edit mode is a third blue.** The contenteditable state uses blue-300/blue-50 (`EditableSpan.css`) — close enough to sky to look like it's trying to match the selection color, far enough to read as a mismatch when a selected participant (sky-400 ring) has its label in edit state (blue-300 outline) two pixels away.
4. **Reorder (a move) is sky.** The drop indicator is `bg-sky-500` (`Block.tsx:201`) — arguably "structure", but it makes amber strictly mean "create a message", not "create/insert" generally, undermining reading 1.

None of these colors are theme tokens. The diagram surface is fully tokenized (`bg-skin-participant`, `text-skin-message-arrow`, etc. — see `src/assets/tailwind.css`) and ships a dark theme (`src/themes/theme-dark.css`), but every piece of editing chrome — white panel backgrounds, `text-black` panel buttons (`StylePanel.tsx:321,332`), white handle fills, the `#eff6ff` edit tint — assumes a light canvas. On `theme-dark`, the diagram goes dark while every editing affordance stays daylight-white; contrast of amber-on-dark and the gray hover outline (`#d1d5db` on a dark surface) was never designed, it just happens.

**Recommendation:** define three semantic tokens — `--color-edit-selection` (selection rings, drop indicators), `--color-edit-creation` (insert handles, drag line, both ends of a create-drag), `--color-edit-active` (contenteditable state, ideally the same hue as selection at a different weight) — give them dark-theme values, and route all chrome through them. That single move fixes inconsistencies 1–4 and the dark-theme clash simultaneously.

---

## 3. Placement & anchoring

### What's placed well
- **Participant-insert "+" buttons** sit exactly at the gap midpoints / edge offsets, computed from real DOM boxes with a layout-coordinate fallback for first paint (`ParticipantInsertControls.tsx:31-54,105-133`). Position communicates meaning ("the new one goes *here*") — the right pattern.
- **Gap handles** sit on the lifeline crossings of the insertion seam, with a dashed guide line making the seam itself visible (`GapHandleZone.tsx:142-162`). Again: the control's position *is* the semantics.
- **Empty-state prompt** is centered, dashed-bordered, with icon + verb label (`EmptyDiagramPrompt.tsx:18-27`) — the one affordance that is self-explanatory at rest.

### What's placed poorly
1. **The divider button is orphaned.** It's pinned to the far-right end of the gap (`right-0`, `GapHandleZone.tsx:167`), an arbitrary corner unrelated to what a divider *is* (a full-width band). On a wide diagram the user hovers a gap in the middle, sees "+" handles appear around the cursor, and the divider button materializes meters away at the edge — outside the attention zone, likely outside the viewport. Its glyph (`══`, 9px text) is also the only affordance whose icon needs decoding.
2. **A gap row scales its noise with participant count.** Each gap renders one "+" per participant simultaneously (`GapHandleZone.tsx:143-163`). With 8 participants, a single hover pops 8 identical amber circles plus a dashed line plus the divider button. All buttons look the same; the *only* differentiator is horizontal position, and the tooltip naming the source appears per-button on delayed hover. The row treats "which source?" — the key decision — as undifferentiated repetition rather than highlighting the lifeline nearest the cursor.
3. **Both floating panels open blind, below their anchor, over live content.** The message style panel floats under the clicked message (floating-ui default placement, no `autoUpdate` — `StylePanel.tsx:82-85`); the participant panel at `rect.bottom + 6` (`ParticipantStylePanel.tsx:67-68`). In a sequence diagram, "directly below" is never empty — it's the next statement, or for participants the first messages. The panel thus covers exactly the elements the user is most likely to interact with next; the participant panel at least clamps to the viewport and flips when it would overflow (`ParticipantStylePanel.tsx:78-93`), the message panel doesn't even do that.
4. **Panels don't track anything.** Neither panel registers scroll/resize repositioning — no `autoUpdate`/`whileElementsMounted` anywhere in `src/`, and the participant panel computes `position: fixed` coordinates once on open (`ParticipantStylePanel.tsx:62-69`). Scroll the page with a panel open and it detaches from its anchor and floats over unrelated content, the strongest possible signal of "this UI is bolted on."

---

## 4. Size & hit targets

| Control | Visual size | Effective hit target | Standard (WCAG 2.2 min / comfortable) |
|---|---|---|---|
| Participant-insert "+" | 16 px circle | **36 px** wrapper (`HIT_AREA_SIZE`, `ParticipantInsertControls.tsx:58`) | ✅ meets 24, near 44 |
| Gap-handle "+" | 16 px circle | 16 px button inside a 16 px-tall strip (`GapHandleZone.tsx:23,220-222`) | ❌ below 24 in both axes |
| Divider button | 16 px tall, 9 px glyph | same | ❌ |
| Drag cursor badge | 16 px | n/a (display only) | — |
| Style-panel buttons (B/I/U/S) | 24 px wide, py-1 (`StylePanel.tsx:332`) | same | ⚠️ borderline |
| Panel submenu items | 11 px uppercase text rows | row height ~22 px | ⚠️ |
| Message row (select/drag) | full arrow width, ~2 px line + label | label + line band | ✅ in practice (label), thin on long bare arrows |
| Occurrence bar (drag source) | **15 px wide** column (`Occurrence.tsx:152`) | same | ❌ narrow, and visually inert (cursor change only) |

Two patterns stand out. First, the codebase already contains the correct technique — the invisible 36 px hit wrapper around a 16 px visual (`ParticipantInsertControls`) — but applies it to only one of the four small-button families. The gap handles, which require the most precise hovering (a 16 px strip offset 5 px above the statement boundary, `GapHandleZone.tsx:24,220`), get no such cushion; the 80 ms hide-delay (`GapHandleZone.tsx:64-71`) papers over exits but doesn't help entry. Second, every small control is exactly 16 px — a size constant chosen once (`HANDLE_SIZE`, `DRAG_HANDLE_SIZE`, `BUTTON_SIZE` are three separate constants that all equal 16) — which is consistent, but consistently below the 24 px floor, and these are *inside the scaled canvas* (next section), so at 80 % zoom they render at 12.8 px.

---

## 5. Layering, scale, and two coordinate worlds

The editing chrome lives in two different coordinate systems with different behavior:

- **In-canvas** (scales with zoom): gap handles, participant "+" buttons, drag line/badge/highlights, drop indicator, inline editing — all inside the `transform: scale(${scale})` wrapper (`DiagramFrame.tsx:171-174`).
- **Portaled** (never scales): both floating panels render through `FloatingPortal` to the document body (`StylePanel.tsx:318`, `ParticipantStylePanel.tsx:166`).

At 100 % zoom this is invisible. At 70 % the in-canvas controls shrink to ~11 px while the panels remain full-size — controls that are already too small get smaller exactly when the user has zoomed out to work on a large diagram, while the panel looms disproportionately large next to the shrunken element it styles. (Zoom is capped at 100 %, `DiagramFrame.tsx:89`, so the mismatch only ever makes small things smaller.)

The z-index stack is ad-hoc magic numbers spread across files: participants 10, drag highlights 20, drag line 30, insert layer / message panel / drag badge 40, gap-handle buttons / participant panel 50 (`Participant.tsx:99`, `MessageCreateControls.tsx:182,197,232`, `SeqDiagram.tsx:127`, `StylePanel.tsx:319`, `GapHandleZone.tsx:153`, `ParticipantStylePanel.tsx:170`). It currently works, but there is no documented scale, and the two panels — peers in the UI — sit on different layers (40 vs 50), so if they ever overlap, the participant panel wins by accident rather than by decision.

---

## 6. Reveal behavior and the teaching layer

How each affordance announces its existence:

| Affordance | Reveal mechanism | At rest |
|---|---|---|
| Participant "+" | opacity fade on hover of its own 36 px zone (`group-hover:opacity-80`) | invisible |
| Gap handles + divider | conditional render on strip hover (pop-in, no transition) | invisible |
| Editable labels | gray dashed outline on hover (`EditableSpan.css:11-15`) | plain text |
| Message interactivity | `cursor-pointer` + native tooltip | plain arrow |
| Occurrence drag source | `cursor-grab` + native tooltip (`Occurrence.tsx:155,164-168`) | plain bar |
| Title (empty) | `opacity-0 group-hover:opacity-100` placeholder (`DiagramTitle/index.tsx:45`) | invisible |
| Empty-diagram prompt | always visible | visible ✅ |

Three observations:

1. **Everything except the empty state is hover-gated, and the gating is inconsistent** — some things fade (participant "+", title), some pop in with no transition (gap handles), some only change the cursor (messages, occurrence bars). Fade vs pop is exactly the kind of micro-inconsistency that makes a UI feel assembled rather than designed; pick one reveal animation for "insertion handles" as a class.
2. **The entire interaction contract is delegated to native `title` tooltips** — delayed ~1 s, unstyled, absent on touch, and carrying load-bearing instructions: "Click to select · drag to reorder" (`Message.tsx:74-75`), "Drag to create a message from X" (`GapHandleZone.tsx:157`), "Click to style participant" (`Participant.tsx:122`). Native tooltips are fine as reinforcement; as the *only* teaching layer they mean a user who never hovers-and-waits never learns the model. The contradictions noted in the gap report compound this: the participant box says "Click to style participant" while the label inside it says "Double-click to edit" and actually single-click-edits.
3. **The occurrence bar is the least announced affordance with the most magic.** A 15 px bar whose entire affordance is a cursor change initiates a nested-message drag that may rewrite a leaf call into a block. Compare: the same verb (create message) from a gap gets an amber "+", a dashed guide line, and a tooltip. The visual investment is wildly uneven across two entry points to the same action.

---

## 7. Per-affordance scorecard

| Affordance | Placement | Color | Size/hit | Reveal | Feedback | Overall |
|---|---|---|---|---|---|---|
| Participant insert "+" | ✅ gap midpoint | ⚠️ sky for a create verb | ✅ 36 px hit | ✅ local fade | ⚠️ no rename handoff (gap report §2.1) | **B** |
| Gap handles | ✅ on lifelines at seam | ✅ amber | ❌ 16 px, no cushion | ⚠️ pop-in, noisy at high participant count | ✅ guide line | **C+** |
| Divider button | ❌ orphaned right edge | ✅ amber | ❌ 16×~20 px, 9 px glyph | ⚠️ appears off-attention | ✅ auto-edit | **D** |
| Create-drag overlay | ✅ line follows pointer | ⚠️ sky source vs amber target | ✅ | n/a | ⚠️ no "no-target/cancel" visual state — every position looks committable | **B-** |
| Message selection | n/a | — | ✅ row target | ⚠️ cursor+tooltip only | ❌ **no selected visual at all** | **D** |
| Reorder drag | ✅ drop line at boundary | ⚠️ sky | ✅ | ⚠️ cursor only | ❌ dragged item unchanged, no ghost, no auto-scroll | **C-** |
| Inline edit (labels) | ✅ in place | ⚠️ third blue | ✅ | ✅ hover outline | ✅ clear edit state | **A-** |
| Message style panel | ❌ covers next statement, no autoUpdate | ❌ hardcoded light | ⚠️ 24 px buttons, 11 px menus | ✅ opens on select | ✅ pressed states, disabled tooltips | **C** |
| Participant style panel | ⚠️ covers first messages; clamps but doesn't track scroll | ❌ hardcoded light | ✅ swatches+type cards | ✅ | ⚠️ closes after each apply | **C** |
| Occurrence drag bar | ✅ the bar itself | — (no visual) | ❌ 15 px wide | ❌ cursor only | ⚠️ | **D+** |
| Empty-diagram prompt | ✅ centered | ✅ neutral→sky | ✅ large | ✅ always visible | ✅ | **A** |

---

## 8. A visual grammar for current and future affordances

The findings above are individually small; the systemic issue is that there is no written grammar, so each affordance made its own choices. Proposed rules — which also dictate how the gap report's missing verbs (delete, unwrap, context menu) should look when they arrive:

1. **Three accent tokens, theme-aware.** `selection` (rings, drop lines), `creation` (all insert/create chrome, both ends of a create-drag), `active-edit` (contenteditable state, same hue as selection). Add a fourth, `destructive` (red family), *reserved now* for the future delete affordances so they don't improvise. All panel chrome moves to skin tokens so dark theme gets designed contrast instead of accidental white.
2. **Selection is always visible on the object itself.** Whatever is selected — participant, message, future fragment — carries the same selection treatment (participant's ring is the precedent). A panel appearing elsewhere is never the sole indicator.
3. **A control's position states its semantics.** Keep the gap-midpoint and lifeline-seam placements; move the divider affordance into the same attention zone as the message handles (it inserts at the same seam); give panels a placement policy (prefer the side *away* from content flow — above for messages mid-diagram, never covering the adjacent statement) plus `autoUpdate` so anchoring survives scroll.
4. **16 px visual, ≥36 px hit, everywhere.** The `ParticipantInsertControls` wrapper pattern becomes the rule for every small button (gap handles, divider, future inline delete "×"). Inside-canvas controls should counter-scale below ~90 % zoom or the minimum is fiction.
5. **One reveal animation per affordance class.** Insertion handles fade in (one duration, one curve); they never pop. Anything revealed by hover must have a non-hover route (selection-anchored controls or the future context menu) — which is also the touch story.
6. **Tooltips reinforce, never teach.** The interaction contract ("click to select, click again to edit") gets shown once visibly — e.g., a first-use hint near the canvas — and tooltips become redundant confirmation. Fix the two contracts that currently lie (participant label "Double-click", participant box "Click to style").
7. **Drags always render: source (held), path, target (committable), and — missing today — a visible *non-committable* state.** The create-drag has source/path/target but no "you are over nothing, release to cancel" appearance, because release never cancels; when drop-to-cancel lands (gap report, priority 1), gray-out the line when no target is in range. Reorder needs the same vocabulary: ghost the held item, keep the drop line.
8. **One documented z-scale.** e.g., diagram 0–10, selection chrome 20, drag overlays 30, anchored panels 40, modal 50 — written down next to the atoms so the next affordance doesn't pick 45 at random.

### Where the missing verbs should appear (forward guidance)

- **Delete message:** in the message style panel as the right-most, `destructive`-token item separated by a divider — and on the Delete key once selection is visible (rule 2 is a prerequisite: never let an invisible selection answer to a destructive key).
- **Unwrap / add-branch:** on a fragment *selection frame* (fragments adopt the same selection ring), controls anchored to the fragment header where its label already lives — not in the message panel, which acts on statements.
- **Context menu:** the conventional home for all object verbs; renders through the same portal/panel styling tokens so it doesn't become a fourth visual dialect.

---

## 9. Quick wins (visual-only, no new capability)

1. CSS rule for `[data-selected="true"]` messages — selection becomes visible. Highest leverage, smallest change.
2. Fix the two lying tooltips (`ParticipantLabel.tsx:125`, `Participant.tsx:122`).
3. Wrap gap-handle and divider buttons in 36 px hit areas (pattern already in `ParticipantInsertControls`).
4. Move the divider button next to the message handles in the gap row.
5. Unify the insert "+" hover color (amber) across participant and message insertion.
6. Dim/ghost the dragged statement via the already-present `data-reorder-state="dragging"` attribute.
7. Route panel/handle chrome through skin tokens; add dark-theme values.
8. Add `autoUpdate` to both floating panels.

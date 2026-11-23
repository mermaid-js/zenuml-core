# 0009 — Writing-time draw animation in the product renderer

Date: 2026-11-23
Status: Accepted by the maintainer on 2026-11-23. Implementation starts with G7 (identity keys); writing-time animation stays off until G1, G4, G5 and G6 pass.

Mechanics (atoms, timers, keys, motion steps) are in the design note
[`docs/writing-animation-design.md`](../writing-animation-design.md). This ADR holds the decisions and the gates.

## Context

A spike tested a pen-like draw animation while the user types DSL. It lives on branch
`claude/animation-improvement-spike-a9009f`, folder `docs/spikes/writing-animation/`, latest commit `0c42d0b6`.
Nothing in `src/` uses it. It compared three arms on the real `renderToSvg`:

| Arm | Behaviour |
|---|---|
| A | Today: no animation |
| B | Literal strokes on every raw parse |
| C | A **gate** on incomplete text, plus a stroke time budget |

The **gate** decides which text the renderer gets for one keystroke. It reads only the difference between the
previous and the next text (no caret API). It holds back the line being typed while that line is incomplete
(`Bo`, `re`, `Alice->Bo` when no `Bo` exists), closes it when that is safe (`A.m(` gets `)`, `if(x` gets
`) {` and a closing `}` later), and keeps the last frame for up to 1,200 ms when a keystroke that only adds text
would remove an element already on screen (the **loss guard**).

Measured on 150 compare-cases (1,027 lines, synthetic typing at 80 WPM, seed 3, main `260ab6e6`). Thresholds
were fixed before measurement:

| Metric | Threshold | A | C |
|---|---|---|---|
| Elements alive under 500 ms | 0 | 509 | 0 |
| Lines with 2+ width jumps of 20 px or more | 0 | 183 | **31** (max 4) |
| Elements not in the final document (reference) | none | 891 | 49 |
| Final frame equals static render | 150/150 | 150 | 150 |

Arm C fails the width-jump threshold. Of its 31 lines, 11 grow once per new participant, 16 shrink and grow back
(for example `new B(` and `"space in name"->`), and 4 are fragment headers that grow by 20 px. All keystroke
streams are synthetic; no keystroke-level data exists. The human typing trial specified on the prototype page
has not run.

Under the rule agreed before measurement, the verdict was: **no animation while typing; replay only.**

The product path differs from the spike in four ways that the spike did not measure:

1. `ZenUml.render()` (`src/core.tsx`) debounces. It clears the pending timeout on each call and waits
   `min(last render cost, 2000 ms)`. Keystrokes inside that window merge into one render. The spike gated every
   keystroke.
2. `codeAtom` is not only the render input. `StylePanel`, `EditableLabelField`, `ParticipantLabel`,
   `ParticipantInsertControls` and `MessageCreateControls` read it, and the editing controls among them write
   code back at positions taken from the parse of that text.
3. The DOM renderer keys statements by array index: `Block.tsx` renders `<Fragment key={index}>`, and
   `FragmentSections.tsx` and `LifeLineLayer.tsx` do the same. The 2021 animation was removed in commit
   `47e5a4d5` ("Causing confusion during writing"). A minimal Vue 2.6.12 repro in the spike shows the cause:
   `:key="index"` played the animation on the last row after a middle insert, and re-played it on parser
   flicker. `createStatementKey` is `"<start>-<stop>"` character offsets, so it changes on every keystroke above
   the statement and is no better than an index.
4. The DOM renderer draws with HTML layout (`div` boxes, flex positions) plus small inline `svg` pieces for
   message shafts and arrow heads. The spike's motion steps tween SVG `x`/`y` attributes, which do not exist
   there.

## Decision

The interim state stands until every gate below passes: **no animation while typing; replay only.**

If the gates pass, the product version is built as follows.

### 1. The gate runs on render input only

```
editor buffer ──raw──► Langium LSP (autocomplete, diagnostics)
      │
      └─raw──► ZenUml.render(code) ──► codeAtom (raw) ──► editing controls, onContentChange
                     │
                     └─ gate (sync, per call) ──► renderCodeAtom (gated) ──► rootContextAtom ──► React
```

| Consumer | Sees |
|---|---|
| Langium LSP (editor buffer) | raw text; the embedder feeds it, `ZenUml` never does |
| `codeAtom`, editing controls, `onContentChange` | raw text |
| `ZenUml.parse()` | raw text |
| `renderToSvg`, `exportSvg`, `exportCanvas` | raw text |
| `rootContextAtom` and everything it drives (ANTLR) | gated text, only while animation is on |

- The two parsers do **not** see the same text while a line is held back. The editor's diagnostics can mark a
  line that the diagram is not yet showing. That is accepted: the diagram lags, the editor tells the truth.
- While gated text differs from raw text, token offsets in the diagram do not match the document. Diagram
  editing is off for that time, through the interaction state of ADR 0002 (a new policy column, not a new
  flag check in each control).
- `await render()` resolves only when the frame for the **raw** text has committed. A caller that exports or
  saves after the await never gets a gated frame.

### 2. The gate sees every keystroke, the debounce stays

The gate runs synchronously inside `render()`, before the debounce timeout, so it sees each edit even when the
renders merge. One scheduler owns the debounce, the gate's dwell timer (250–500 ms) and the loss-guard hold
(1,200 ms); there are never two pending timers for one diagram.

**Idle flush (new, not in the spike).** In the spike, a line held for `keyword` or `string` (for example `re`, or
an open `"`) stays out of the diagram until the next keystroke, with no time limit. The product version adds one
rule: when no new `render()` call arrives for 1,200 ms, the scheduler renders the raw text unconditionally. That
bounds every hold, ends the editing-off state below, and lets `await render()` resolve. After a pause, the user
can therefore see the raw parse of an incomplete line. Gates G4 and G5 must run with this rule; the synthetic
streams end on complete text, so G3 (150/150) does not exercise it.

### 3. Element identity does not come from position

Before any motion ships, statements, fragments and participants get identity keys from a data-level reconcile
of the previous and next parse (the spike's `reconcile`: kind plus label, matched from both ends, participant
rename by name prefix). These keys replace `key={index}` in `Block.tsx`, `FragmentSections.tsx` and
`LifeLineLayer.tsx`. The keys are a renderer change on their own and must leave every snapshot unchanged.

### 4. Motion is built for HTML layout

Moves use measure-then-transform (FLIP) on keyed elements, not attribute tweens. New participants and messages
reveal with the prototype's order and budget (stroke `D = clamp(1.6 × key-interval EMA, 110, 240) ms`; a batch
of 5 or more new elements takes 240 ms in total; more than 120 appear at once). Text the user types appears per
key without animation. Deletions fade in 90 ms.

### 5. Opt-in, off by default

| Case | Gate | Motion |
|---|---|---|
| Option not passed | off | off |
| `enableWritingAnimation: true` | on | on |
| `enableWritingAnimation: true` and `prefers-reduced-motion: reduce` | on | off |
| `RenderMode.Static` | off | off |
| First render, `reset`, paste of 2+ lines | gate skipped | none, or the 240 ms batch |

The option is written in `render()` itself (`appliedIn: "render"`), not after the debounce like the `enable*`
editing flags, because the gate runs in `render()` and must know the option on the same call. Like those
flags, it keeps its value when `undefined`. Embedders turn it on per surface by passing it to
`render()`, and off by passing `false`. Nothing changes for an embedder that does not pass it. This ADR does not
claim how each embedder (Confluence app, web-sequence, Mermaid) calls `render()` today; each one decides in its
own repo after this ships.

## Gates before it ships

All thresholds are the ones fixed in the spike README before measurement. They do not change. If the
maintainer wants a different definition of a width jump (for example, to exempt the 11 lines that grow once
per new participant), that definition is fixed and written down **before** the next measurement, never after.

| # | Gate | Threshold | Today |
|---|---|---|---|
| G1 | Lines with 1+ width reversal, arm C (definition below) | 0 | old rule (2+ jumps): 19 — **fails**; new rule: not yet measured |
| G2 | Elements alive under 500 ms, arm C | 0 | 0 — passes on `renderToSvg` only |
| G3 | Final frame equals static render | 150/150 | 150/150 — on `renderToSvg` only |
| G4 | G1–G3 re-measured on the React path (`ZenUml.render()` with the real debounce, gated in `render()`) | same thresholds | not run |
| G5 | Real keystroke recordings replace the synthetic streams for G1–G4 | at least the trial's recordings | none exist |
| G6 | Human trial as specified on the prototype page: 8–12 people, A/B/C in Latin-square order, 3 copy tasks | C vs A: WPM drop ≤ 2%, error rate not higher, change detection not lower | not run |
| G7 | Identity keys (Decision 3) land with zero snapshot change | 0 changed snapshots | in progress, separate change |

**G1 definition (changed 2026-11-23, before re-measurement).** A **reversal** is a diagram width change of
20 px or more that undoes an earlier change of 20 px or more on the same line: widen then narrow, or narrow
then widen. G1 counts the lines with one or more reversals. Lines that only grow are not counted, for example a
line that adds a new participant or a fragment header. Lines that type a creation label (`new X(`, where the
label shows «create» and then the argument) are exempt, because the maintainer keeps that label.

The maintainer approved this rule on 2026-11-23. It replaces the earlier rule, "lines with 2+ width jumps of
20 px or more", and was fixed before G1 was measured again. Under the earlier rule G1 failed: 31 lines in the
spike measurement, and 19 lines after the parser fixes released in 4.15.2.

Evidence that would change the verdict: G1 and G4 pass on recorded keystrokes, and G6 passes. Anything less
keeps the interim state. If G6 is unclear because the sample is small, the next step is the same option behind
a feature flag in one embedder, watching close rate and complaints, before it is offered to others.

## Consequences

- The first implementation step is G7 (identity keys) and the parser fixes behind the 16 shrink and
  grow-back lines. Both are worth doing without animation.
- The renderer gains a second text atom and a scheduler. Every reader of `codeAtom` stays on raw text.
- An embedder that turns the option on gets a diagram that can lag the editor on one line until the next keystroke or
  the 1.2 s idle flush, and diagram editing that is off for that time.
- The spike README mentions a `_STARTER_` loss-guard exemption in `engine.js`. `engine.js` at `0c42d0b6` has no
  such code; `_STARTER_` appears only in the page's list of parser observations. The product version adds no
  `_STARTER_` special case.

## Alternatives rejected

- **Arm B, literal strokes on every raw parse.** Raw parses flicker: 509 elements live under 500 ms and 183
  lines jump width twice or more. Strokes make each flicker more visible. This is the 2021 failure again.
- **Gate without animation.** It removes every short-lived element (509 to 0) and cuts width-jump lines from 183
  to 31, with no motion at all. It is not rejected on its merits; it is a different decision (diagram stability
  while typing) and needs its own ADR and its own trial. This ADR does not decide it.
- **Replay only, for good.** Not rejected: it is the interim state until the gates pass.
- **Gate inside the parser** (ANTLR error recovery instead of a text gate). It would change every ANTLR
  consumer at once (`ZenUml.parse()`, `renderToSvg`, exports), not only the live diagram, and the ANTLR and
  Langium parsers would drift apart. The text gate keeps both parsers unchanged and can be switched off.

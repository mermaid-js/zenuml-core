# Writing-time draw animation — design note

Companion to [ADR 0009](adr/0009-writing-time-draw-animation.md) (status: Proposed). Nothing here is
implemented. The ADR's gates decide whether any of it is built.

Source of the mechanisms: the spike on branch `claude/animation-improvement-spike-a9009f`, commit `0c42d0b6`,
`docs/spikes/writing-animation/engine.js` (`gate`, `reconcile`, `Feed`, `Stage`, `Session`).

## 1. Data flow

```
render(code, config)                       (sync part)
  ├─ codeAtom ◄── raw code                  editing controls, onContentChange, exports
  ├─ edit = locateEdit(prevRaw, code)       per call, before the debounce
  ├─ gated = gate(code, edit, names)        spike gateLine + balanceBraces
  └─ scheduler.offer(gated, edit, now)
        │
        ▼                                  (one timer per diagram)
  scheduler fires after max(debounce, dwell or loss hold)
        ├─ loss guard: would any element on screen disappear on an add-only edit?
        │     yes and held < 1,200 ms → keep current frame, re-arm
        └─ renderCodeAtom ◄── gated → rootContextAtom → React commit → motion
```

`rootContextAtom` reads `renderCodeAtom` when the option is on and `codeAtom` when it is off. With the option
off, `renderCodeAtom` is never written and the render path is the one in `src/core.tsx` today.

## 2. Scheduler

| Event | Today | With the option on |
|---|---|---|
| `render()` call | clear timeout, set `min(cost, 2000)` ms | same, plus run the gate synchronously and keep the edit |
| Several calls inside the debounce | last text wins | last gated text wins; the gate already saw each edit |
| Gate holds a line (`reason` set) | — | timer = `max(debounce, dwell)`; on fire, `settle` closes the line or keeps it held (`keyword`, `string`) |
| Loss guard holds | — | timer = remaining hold; at 1,200 ms the frame is forced |
| No `render()` call for 1,200 ms while render text ≠ raw text | — | **idle flush** (new, not in the spike): render raw text unconditionally |
| Edit removes text, or is bulk (2+ lines) | — | no gate, no loss guard |
| `await render()` | resolves on commit of the latest revision | resolves on commit of the frame whose render text equals raw text |

`dwell = clamp(2.5 × EMA, 250, 500)` ms, `EMA` = exponential mean of key intervals (alpha 0.3, start 180 ms,
gaps over 1,200 ms ignored). Key intervals come from the times of `render()` calls, so an embedder that already
throttles its own calls gets a slower EMA and longer strokes; the clamp bounds both.

## 3. Identity keys

The spike's `reconcile(prev, next)` pairs elements of two parses:

| Group | Match rule |
|---|---|
| Statements, fragments | same kind and label, matched from the start, then from the end; the middle pairs by kind in order |
| Participants | same name; else one name a prefix of the other (a rename while typing) |
| Lifelines, occurrences | follow their participant |

Product version: a keyed id map lives next to `rootContextAtom`. On each parse, ids of paired elements carry
over; new elements get a fresh id. Components read the id by statement context and use it as the React key in
place of `index`.

Places that key by index today (from `grep 'key={'`):

| File | Line today |
|---|---|
| `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Block.tsx` | `<Fragment key={index}>` per statement |
| `src/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Fragment/FragmentSections.tsx` | `key={index}` per section |
| `src/components/DiagramFrame/SeqDiagram/LifeLineLayer/LifeLineLayer.tsx` | `key={index}` on fragments and items; participants already use `entity.name` |

`createStatementKey` (`src/positioning/vertical/StatementIdentifier.ts`) returns `"<start>-<stop>"` character
offsets. It stays as a position key for editing and geometry; it is not an identity key.

The keys land first, alone, with zero snapshot change (ADR gate G7). The same change is a precondition for any
future animation, typing-time or replay.

## 4. Motion on the DOM renderer

| Element | DOM renderer draws it as | Reveal |
|---|---|---|
| Participant | HTML box with label | border via `clip-path` wipe 0–55% of D, label wipe 45–100% |
| Lifeline | HTML element, vertical | `scaleY` from top, 35–100% |
| Message | `div` row with an inline `svg` `line` shaft and arrow-head `path` (`MessageView.tsx`) | shaft `stroke-dashoffset` 0–70%, head fade 62–82%, label wipe 55–100% |
| Self call, return | inline `svg` in `SelfInvocation.tsx`, `Return.tsx` | same as message |
| Fragment | HTML border box | border wipe 0–55% |
| Existing element moves | flex layout | FLIP: read rects before commit (`useLayoutEffect` on the previous frame), apply inverse `transform`, ease out 110 ms |
| Removed element | — | clone fades out 90 ms over the new frame |

Rules carried over from the prototype's motion spec:

- `D = clamp(1.6 × EMA, 110, 240)` ms.
- A new element arriving ends any stroke in progress at its final state.
- A message in the same frame as a new participant starts at most `0.3 × D` later, and the frame's ink finishes
  within 250 ms.
- 5 or more new elements: 120 ms each, staggered, 240 ms total. More than 120: no motion.
- Text the user types appears per key, never animated.
- Motion never changes layout: reveals are paint-only (`clip-path`, `opacity`, `transform`, dash offset), so
  the final frame is identical to the static render (gate G3).

## 5. Reduced motion and modes

- `matchMedia('(prefers-reduced-motion: reduce)')` is read on each frame decision, so a change applies at once.
  Reduced motion keeps the gate and skips all motion.
- `RenderMode.Static`: option ignored. Static is the read-only mode (ADR 0002 R3).
- Diagram editing while a line is held: the interaction policy (ADR 0002) gets a `provisional` state in which
  every editing capability is false. It ends when render text equals raw text.

## 6. Measurement plan for gate G4

1. Build the library with the option on.
2. Drive `ZenUml.render()` in Playwright with the spike's streams (150 compare-cases, 80 WPM, seed 3), with
   real timers so the debounce merges keys as it would in an editor and the idle flush fires on long gaps.
3. After each React commit, record the root width and the keyed elements, then run the spike's
   `measureFrames` rules unchanged (20 px width jump, 500 ms short-lived element).
4. Repeat with recorded keystrokes once they exist (G5).

## 7. Open points for the maintainer

- The width-jump definition. Today a new participant counts as a jump. Decide before the next measurement
  whether that stays.
- Whether the identity keys (section 3) and the gate without animation should get their own ADRs now, since
  both are useful without motion.

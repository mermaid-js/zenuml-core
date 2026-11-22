# Writing-time draw animation spike (2026-11-05)

A prototype page that tests a pen-like draw animation while the user types ZenUML DSL.
It is not product code. Nothing in `src/` uses it.

## Files

| File | What it is |
|---|---|
| `index.html` | The prototype page: three arms side by side, measured results, motion spec, gate rules, keystroke recorder |
| `engine.js` | Prototype engine (`window.ZmlInk`): gate, reconcile, Feed, Stage, Session |
| `zenuml-260ab6e6.js` | UMD build of `@zenuml/core` from main at commit `260ab6e6`. The page calls its `renderToSvg` |

The page and `engine.js` were first copied from the published artifact
<https://claude.ai/artifact/975W8JjsDvEttSc25JkUYg> (private) on 2026-11-22. The renderer was then replaced: the original `2d36d191` build is in git history (commit b79dcaf1).

## Run

The page needs HTTP; scripts do not load from `file://` in some previews.

```bash
python3 -m http.server 14731 --bind 127.0.0.1 --directory docs/spikes/writing-animation
```

Then open <http://localhost:14731>.

## Arms

| Arm | Behaviour |
|---|---|
| A | Current behaviour: no animation |
| B | Literal strokes on every raw parse |
| C | Gate on incomplete text, plus a stroke time budget |

## Result

Thresholds were fixed before measurement. Frame metrics were re-measured on 2026-11-22 with the same `engine.js`, the same 150 compare-cases (1,027 lines, 80 WPM, seed 3) and both renderers. The old bundle reproduces the Nov 5 numbers exactly.

| Metric | Threshold | A on `2d36d191` | A on `260ab6e6` | C on `2d36d191` | C on `260ab6e6` |
|---|---|---|---|---|---|
| Elements alive under 500 ms | 0 | 1,330 | 509 | 0 | 0 |
| Lines with 2+ width jumps (20 px or more) | 0 | 389 | 183 | 46 | 31 (max 4) |
| Elements not in the final document (reference) | none | 3,124 | 891 | 111 | 49 |
| Final frame equals static render | 150/150 | 150 | 150 | 150 | 150 |
| Render throws | none | 1 | 0 | – | – |

Arm C still fails the width-jump threshold. Of its 31 lines, 11 grow once per new participant, 16 shrink and grow back (real flicker, for example `new B(` and `"space in name"->`), and 4 are fragment headers growing by 20 px.

First stroke, stroke lag and 50-line paste were not re-measured: they depend on stage timing, and render cost is unchanged (p95 24 ms on `2d36d191`, 25 ms on `260ab6e6`). The human typing trial was not run.

Verdict under the rule agreed in advance is unchanged: no animation while typing; keep replay only. Parser fixes since Nov 5 halved raw flicker (arm A), so the gate matters less than before but still removes all short-lived elements.

Re-run:

```bash
node docs/spikes/writing-animation/measure/frames.mjs docs/spikes/writing-animation/zenuml-260ab6e6.js /tmp/frames.json
node docs/spikes/writing-animation/measure/jumps.mjs docs/spikes/writing-animation/zenuml-260ab6e6.js
```

The old bundle is in git history at commit b79dcaf1.

## Known limits

- All keystroke streams are synthetic. No real keystroke data exists.
- `engine.js` contains an unpublished `_STARTER_` loss-guard exemption in its gate.
- The prototype uses `renderToSvg`. `ZenUml.render()` goes through React components and a debounce, so a product version needs its own design.
- The incomplete-DSL parser issues found during this spike are mermaid-js/zenuml-core issues 667 to 674.

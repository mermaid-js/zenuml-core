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

Measured on the old renderer `2d36d191`, not re-measured on `260ab6e6`.

Thresholds were fixed before measurement. Arm C passed 5 of the 6 automatic thresholds.
It failed "at most one width jump per statement": 46 of 1027 lines jumped two or more times
(arm A: 389 lines). The human typing trial was not run.

Verdict under the rule agreed in advance: no animation while typing; keep replay only.
The gate reduces diagram flicker without animation and can be evaluated on its own.

## Known limits

- All keystroke streams are synthetic. No real keystroke data exists.
- `engine.js` contains an unpublished `_STARTER_` loss-guard exemption in its gate.
- The prototype uses `renderToSvg`. `ZenUml.render()` goes through React components and a debounce, so a product version needs its own design.
- The incomplete-DSL parser issues found during this spike are mermaid-js/zenuml-core issues 667 to 674.

# Writing-animation gates (ADR 0009)

Measures gates G1–G3 of [ADR 0009](../../docs/adr/0009-writing-time-draw-animation.md) on the React path
(`ZenUml.render()` with the real debounce), from synthetic or recorded keystrokes.

| File          | What it is                                                                                                                                                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `g4.mjs`      | The harness. Runs a built bundle in headless Chromium, in real time, and writes `<out>.json` and `<out>.summary.json`.                                                                                                                                                                                           |
| `streams.mjs` | Reads a recording (JSONL) into a stream `[{ t, code }]`; parses the flags.                                                                                                                                                                                                                                       |
| `engine.js`   | The spike engine, vendored unchanged from `docs/spikes/writing-animation/engine.js` at spike commit `7de6c3be` (branch `claude/animation-improvement-spike-a9009f`). It supplies the synthetic stream (`typeStream`), `measureFrames` and the SVG extraction. Do not edit it: the gate definitions depend on it. |

## Run

```bash
bun run build
bun run writing:g4 --out /tmp/g4.json                          # G4: 150 compare-cases, 80 WPM, seed 3, option on (about 45 min)
bun run writing:g4 --recordings recordings/ --out /tmp/g5.json  # G5: one case per recorded *.jsonl file
```

Flags: `--bundle` (default `dist/zenuml.js`), `--cases`, `--wpm`, `--seed`, `--filter a,b` (exact case names),
`--off` (option off, for comparison), `--out`.

## Recording format

One JSONL file per typing session. Line 1 is a header; each further line is one `input` event of the editor:

```json
{"start": "", "build": "e794b96f", "task": "t1", "arm": "C", "editor": "textarea"}
{"t": 182, "pos": 0, "del": 0, "ins": "A"}
```

`t` is ms from the start. An event deletes `del` characters at `pos`, then inserts `ins`, so typing, backspace,
paste and a replaced selection are all one event. The recorder on the spike's prototype page writes this format.

Fixed before any recording is measured: the editor is a plain `textarea`, with no auto-closing brackets or
quotes. Recordings contain the text people typed; use the trial's copy tasks only, never customer diagrams.

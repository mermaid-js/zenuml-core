---
name: dia-scoring
description: Score HTML-vs-SVG diagram parity in compare-case pages, including message labels, sequence numbers, and arrows, using Playwright native screenshots plus diff confirmation.
---

# Dia Scoring

Use this skill when the task is to measure **message labels, sequence numbers, and message arrows** between the HTML renderer and the native SVG renderer on `compare-case.html`.

The workflow is browser-native:

1. Open `http://localhost:8080/cy/compare-case.html?case=<name>`.
2. Use the analyzer script at [../../scripts/analyze-message-labels.mjs](../../scripts/analyze-message-labels.mjs).
3. Prefer `--json` when the next step is automated processing.
4. Prefer `--output-dir <dir>` when you need saved `html.png`, `svg.png`, `diff.png`, and `report.json`.

## Rules

- Do not use `html-to-image` for capture.
- Use browser-native screenshots only.
- Scope:
  - normal messages
  - self messages
  - returns
- For each supported message, include:
  - label text
  - sequence number text
  - arrow geometry keyed by sequence number
  - normal/return arrow endpoint deltas: `left_dx`, `right_dx`, `width_dx`
  - self-arrow loop geometry deltas using the same arrow entry format
- Each reported letter must be backed by:
  - direct HTML-vs-SVG browser layout positions
  - diff-image confirmation from the native screenshot pair
- If the evidence is weak or contradictory, keep the letter `ambiguous`.

## Commands

Run from [../..](../..):

```bash
node scripts/analyze-message-labels.mjs --case async-2a
node scripts/analyze-message-labels.mjs --case async-2a --json
node scripts/analyze-message-labels.mjs --case async-2a --output-dir tmp/message-elements/async-2a
```

## References

- Selector and pairing details: [references/selectors-and-keys.md](references/selectors-and-keys.md)

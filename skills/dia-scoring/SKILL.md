---
name: dia-scoring
description: Score HTML-vs-SVG diagram parity in compare-case pages, including message labels, fragment labels, sequence numbers, arrows, participant headers, and icons, using Playwright native screenshots plus diff confirmation.
---

# Dia Scoring

Use this skill when the task is to measure **message labels, fragment labels, sequence numbers, message arrows, participant labels, participant boxes, and participant icons** between the HTML renderer and the native SVG renderer on `compare-case.html`.

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
  - fragment conditions such as `[cond]`, `[else]`
  - fragment section labels such as `catch`, `finally`
  - participant label text and participant box geometry
  - participant icons (actor, database, sqs, sns, iam, boundary, control, entity)
- For each supported message, include:
  - label text
  - fragment condition / section label text when present
  - sequence number text, including fragment sequence numbers when present
  - arrow geometry keyed by sequence number
  - normal/return arrow endpoint deltas: `left_dx`, `right_dx`, `width_dx`
  - self-arrow loop geometry from the painted loop path plus arrowhead, not the outer `svg` viewport
  - self-arrow vertical deltas: `top_dy`, `bottom_dy`, `height_dy`
- For participant icons, include:
  - icon presence (HTML vs SVG)
  - participant label text when the participant has an icon
  - icon position relative to participant label
  - icon visual match confirmation from diff image
- For participant boxes, include:
  - `html_box` and `svg_box` with `x`, `y`, `w`, `h`
  - box deltas `dx`, `dy`, `dw`, `dh`
  - SVG measurement based on the painted outer bounds of the stroked box, not the inset rect geometry
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

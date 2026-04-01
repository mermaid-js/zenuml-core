---
name: dia-scoring
description: Score HTML-vs-SVG diagram parity in compare-case pages, including message labels, fragment labels, sequence numbers, arrows, participant headers, icons, stereotypes, participant colors, participant groups, comments, and residual diff scopes. Use Playwright for page inspection and semantic attribution.
---

# Dia Scoring

Use this skill when the task is to measure **message labels, fragment labels, sequence numbers, message arrows, participant labels, participant boxes, participant icons, stereotypes, participant colors, participant groups, inline comments, and residual diff hotspots** between the HTML renderer and the native SVG renderer on `compare-case.html`.

## Diff Source of Truth

The `native-diff-ext` Chrome extension is the absolute source of truth for pixel diff. The analyzer script (`scripts/analyze-compare-case.mjs`) uses the same CDP screenshot capture method and the same diff algorithm (`cy/diff-algorithm.js`), producing identical results when run against the same viewport.

- Use the **analyzer script** as the primary scoring tool (automated, reproducible, CLI-driven)
- Use the **extension** for live interactive inspection in the browser
- Both use CDP `Page.captureScreenshot` with `DOM.getBoxModel` border-box clip
- When calibrating the skill, verify against the extension's live `#diff-panel canvas`

The workflow:

1. Run `node scripts/analyze-compare-case.mjs --case <name> --json` for structured data.
2. Use `--output-dir <dir>` when you need saved `html.png`, `svg.png`, `diff.png`, and `report.json`.
3. For live browser inspection, navigate to `http://localhost:8080/e2e/tools/compare-case.html?case=<name>` and use the extension's `#diff-panel canvas`.
4. Use Playwright page inspection for semantic attribution (element positions, font metrics, DOM structure).

## Offset Anchor

All reported offsets must use the **outermost frame's top-left corner** as the anchor.

- HTML anchor: the compare-case HTML frame root
- SVG anchor: the compare-case SVG root / outer frame root
- Do not report alternate offset systems
- Do not anchor offsets to participant boxes, label boxes, stereotype boxes, or local containers
- If a local-container-relative reading differs from the frame-anchor reading, prefer the frame-anchor reading in all reporting

## Browser Requirement

Use **Playwright browser tools only** for browser interaction in this workflow.

- Preferred tools: `browser_navigate`, `browser_snapshot`, `browser_evaluate`, `browser_take_screenshot`, `browser_click`, `browser_wait_for`
- Do not use Chrome DevTools browser tools for scoring, DOM inspection, screenshot capture, or residual validation
- Do not build your own pixel diff from HTML/SVG screenshots. For pixel comparison, use only the extension-rendered `#diff-panel canvas`

## Rules

- Do not use `html-to-image` for capture.
- Use browser-native screenshots only.
- Use Playwright for browser-native screenshots and page inspection.
- All offset calculations must be anchored to the outermost frame's top-left corner.
- When recalibrating the skill itself, verify against the extension's live `#diff-panel canvas`.
- Do not use Chrome DevTools browser tools for this workflow.
- Scope:
  - normal messages
  - self messages
  - returns
  - creation messages (e.g., `«payload»`, `new Order()`)
  - fragment conditions such as `[cond]`, `[else]`
  - fragment section labels such as `catch`, `finally`
  - participant label text and participant box geometry
  - participant icons (actor, database, ec2, lambda, azurefunction, sqs, sns, iam, boundary, control, entity)
  - participant stereotypes such as `«BFF»`, `«Interface»`
  - participant background colors (`#FFEBE6`, `#0747A6`, etc.) and computed text contrast
  - participant groups (dashed outline containers with title bar)
  - inline comments (`// text`) above messages and fragments, including styled comments (`// [red] text`)
  - residual `html-only` and `svg-only` diff clusters scoped back to nearby elements
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
- For participant stereotypes, include:
  - stereotype text presence (HTML vs SVG), e.g. `«BFF»`
  - stereotype position relative to participant label (above label, smaller font)
  - stereotype offset must be measured with per-letter glyph-box comparison relative to the outermost frame anchor
  - do not use participant-box-relative or other local-container-relative deltas in final reporting
  - do not mark a stereotype as clean from glyph boxes alone; also check the live `#diff-panel canvas` in the stereotype row
  - if glyph-box deltas are `0/0` but the panel still shows localized red/blue pixels overlapping the stereotype glyph union, report the stereotype as `ambiguous` or `paint-level residual`, not clean
  - stereotype text color matching participant background contrast
- For participant colors, include:
  - background fill color (hex value) on participant rect
  - text color contrast (dark text on light bg, white text on dark bg)
  - color application to both top and bottom participant boxes
- For participant groups, include:
  - group name text presence and position (centered title bar)
  - dashed outline rect enclosing grouped participants
  - group bounds: leftmost to rightmost participant with margin
  - group height extending to diagram bottom
- For inline comments, include:
  - comment text presence and position (above the associated statement)
  - comment Y offset from the message/fragment it belongs to
  - fragment-level comments (e.g. `// comment 4` before `if(...)`) positioned above fragment header
  - when all letters are `ambiguous` due to large positional offset (e.g. fragment comments at wrong X), the analyzer reports `box_dx` / `box_dy` from the bounding boxes instead of suppressing the measurement
  - styled comment color application (e.g. `// [red] text`)
- For participant boxes, use the analyzer script output directly:
  - Report `html_box`, `svg_box`, `dx`, `dy`, `dw`, `dh` from the script's `participant_boxes` section
  - The script already applies stroke correction (`strokedElementOuterRect`) — do not re-measure with `browser_evaluate`
- For residual scopes, include:
  - connected `html-only` and `svg-only` diff clusters from `#diff-panel canvas`
  - cluster `size`, `bbox`, and `centroid`
  - nearest scoped HTML and SVG targets at that position
  - summaries that explain which element a remaining positional diff most likely belongs to
  - live native diff panel confirmation before claiming a hotspot is real
  - the largest confirmed live-panel `html-only` and `svg-only` clusters with approximate positions
  - grouped summaries of where the panel's red and blue pixels are concentrated
- Do not report a residual hotspot as real if it is absent from the live `#diff-panel canvas`.
- Do not stop at totals like `HTML-only (44)` or `SVG-only (55)` when residuals matter; report where those pixels are.
- Each reported letter must be backed by:
  - direct HTML-vs-SVG browser layout positions
  - pixel-panel confirmation from `#diff-panel canvas`
- Participant stereotypes are first-class targets, not just part of `participant-box` or `participant-label`.
- If the evidence is weak or contradictory, keep the letter `ambiguous`.

## Known Analyzer Internals

### Arrow pairing by sequence number

The analyzer pairs arrows by sequence number (`text` field), not by label text (`pairText`). Calibrated on `repro-creation-return-arrow` (2026-03-24).

## Commands

Run from [../..](../..):

```bash
node scripts/analyze-compare-case.mjs --case async-2a
node scripts/analyze-compare-case.mjs --case async-2a --json
node scripts/analyze-compare-case.mjs --case async-2a --output-dir tmp/message-elements/async-2a
```

## References

- Selector and pairing details: [references/selectors-and-keys.md](references/selectors-and-keys.md)

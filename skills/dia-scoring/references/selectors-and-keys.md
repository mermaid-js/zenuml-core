# Selectors And Keys

The analyzer uses these roots:

- HTML root: `#html-output .frame`, fallback `#html-output .sequence-diagram`
- SVG root: `#svg-output > svg`

Offset anchor:

- All reported offsets use the outermost frame root's top-left corner
- HTML side: `#html-output .frame`, fallback `#html-output .sequence-diagram`
- SVG side: `#svg-output > svg`
- Do not emit final `dx` / `dy` values from participant-local or other nested-container anchors

HTML label extraction:

- Normal messages: iterate `.interaction`, skip `.return`, `.creation`, and self interactions, then read `.message .editable-span-base`
- Self messages: `.self-invocation .label .editable-span-base`
- Returns: `.interaction.return .message .editable-span-base`, fallback `.interaction.return .name`
- Fragment conditions: `.fragment .segment > .text-skin-fragment:not(.finally)`, using only visible child spans when conditional branches are stacked
- Fragment sections:
  - `.fragment.fragment-tcf .segment > .header.inline-block.bg-skin-frame.opacity-65`
  - `.fragment.fragment-tcf .segment > .header.finally`

SVG label extraction:

- Normal messages: `g.message:not(.self-call) > text.message-label`
- Self messages: `g.message.self-call > text.message-label`
- Returns: `g.return > text.return-label`
- Fragment conditions: `g.fragment > text.fragment-condition`
- Fragment condition / section groups: `g.fragment > g` containing `text.fragment-section-label`
  - texts starting with `[` are treated as `fragment-condition`
  - other texts are treated as `fragment-section`

Pairing key:

- Semantic grouping is by `kind + text`
- Duplicate labels are paired by top-to-bottom order within that group
- Output key is:
  - `kind`
  - `text`
  - `y_order`
- Fragment labels also include `owner=<fragment header>` in the human-readable summary when available

Per-letter scoring:

- Grapheme segmentation uses `Intl.Segmenter`, fallback `Array.from`
- Glyph boxes come from browser layout ranges, not whole-word centroids
- Numeric `dx` and `dy` are only emitted when direct layout evidence and diff-image evidence agree

Arrow extraction:

- HTML normal/return messages:
  - line: direct child `svg` line strip inside `.message`
  - head: direct child arrowhead `svg` inside `.message`
- HTML self messages:
  - loop: painted geometry inside `svg.arrow`
  - parts: outer loop path plus nested arrowhead path
- SVG normal messages:
  - line: `line.message-line`
  - head: `svg.arrow-head`
- SVG returns:
  - line: `line.return-line`
  - head: `polyline.return-arrow`
- SVG self messages:
  - loop: painted geometry inside the outer `svg` under `g.message.self-call`
  - parts: outer loop path plus nested arrowhead path

Arrow scoring:

- Arrows are keyed by sequence number when numbering is available, for example `arrow:1.2.3`
- Normal and return arrows are measured as one combined geometry item:
  - line + arrow head together
- Self arrows are measured as one loop geometry item
- Self arrows use the union of the painted loop path and arrowhead path, not the outer viewport box
- Arrow output is endpoint-based, not box-centroid-based
- For normal and return arrows, report:
  - `left_dx`
  - `right_dx`
  - `width_dx`
- For self arrows, also report:
  - `top_dy`
  - `bottom_dy`
  - `height_dy`
- Do not report `dy` for horizontal message arrows

HTML sequence number extraction:

- Normal messages: `.interaction:not(.return):not(.creation):not(.self-invocation):not(.self) > .message > .absolute.text-xs`
- Self messages: `.interaction.self-invocation > .message .absolute.text-xs`
- Returns: `.interaction.return > .message > .absolute.text-xs`
- Fragments: `.fragment > .header > .absolute.text-xs`

SVG sequence number extraction:

- Normal messages: `g.message:not(.self-call) > text.seq-number`
- Self messages: `g.message.self-call > text.seq-number`
- Returns: `g.return > text.seq-number`
- Fragments: `g.fragment > text.seq-number`

## Participant Icon Extraction

## Participant Header Extraction

HTML participant header extraction:

- Participant root: `.participant[data-participant-id]`
- Participant box: outer border box from the participant root element
- Participant stereotype: `label.interface`, when present
- Participant label: last `.name` descendant, measured by glyph boxes

SVG participant header extraction:

- Participant root: `g.participant[data-participant]`
- Skip `g.participant-bottom`
- Participant box element: `:scope > rect.participant-box`
- Participant box measurement must use the painted outer bounds of the stroked rect, not the inset rect geometry
- Participant stereotype:
  - prefer `:scope > text.stereotype-label`
  - fallback: top-most direct `text` child above `text.participant-label`
- Participant label: `:scope > text.participant-label`

Participant stereotype pairing and scoring:

- Pair by participant name
- Validate text equality, for example `«BFF»`
- Measure stereotype offset by per-letter glyph boxes relative to the outermost frame root, not by participant-local anchors or whole-word box centroids
- Report:
  - `letter_deltas`
  - concise aggregate only when the per-letter evidence agrees
- Do not mark the stereotype clean from glyph boxes alone
- Also check the live `#diff-panel canvas` over the union of the HTML and SVG stereotype glyph boxes
- If localized red or blue pixels persist in that stereotype region while glyph-box deltas are `0/0`, classify it as `ambiguous` or `paint-level residual`

Participant box pairing and scoring:

- Pair by participant name
- Report `html_box` and `svg_box` with `x`, `y`, `w`, `h`
- Box `x` / `y` values are frame-anchor-relative
- Report box deltas:
  - `dx`
  - `dy`
  - `dw`
  - `dh`

HTML icon extraction:

- Participant root: `.participant[data-participant-id]`
- Top-row participant only: keep the top-most entry for each participant id
- Icon host: first child inside the centered participant row when it is an async icon host
  - `[aria-description]`
  - or contains `svg`
  - or has `h-6` sizing class from `AsyncIcon`
- Icon box: union of painted SVG shapes when available, fallback to the host box
- Participant label: last `.name` descendant, measured by glyph boxes

SVG icon extraction:

- Participant root: `g.participant[data-participant]`
- Skip `g.participant-bottom`
- Icon element: `:scope > g[transform]`
- Icon box: union of painted shapes within that transformed group
- Participant label: `:scope > text.participant-label`

Icon pairing:

- Pair by participant name
- Only report participant icon rows for participants where at least one side has an icon
- Participant labels for icon-bearing participants are paired by participant name, not raw label text

Icon scoring:

- Absolute icon drift:
  - `icon_dx`
  - `icon_dy`
- Absolute icon drift is measured from the outermost frame anchor
- Relative icon drift against the participant label anchor:
  - `relative_dx`
  - `relative_dy`
- If there is no participant label on one side, use the participant box center as the anchor
- Report presence mismatch if one renderer has an icon and the other does not
- Diff confirmation is taken from `#diff-panel canvas`, scoped to the union of the HTML and SVG icon boxes

## Residual Scope Attribution

Residual scope extraction:

- Build connected clusters from the live `#diff-panel canvas` colors:
  - red = `html-only`
  - blue = `svg-only`
- Ignore green `match` and magenta `color diff` pixels for positional scoping
- Each cluster reports:
  - `size`
  - `bbox`
  - `centroid`
- These panel-derived clusters are the source of truth for residual hotspots.

Residual scope candidates:

- HTML side:
  - labels
  - numbers
  - arrows
  - participant stereotypes
  - participant labels
  - participant icons
  - participant boxes
  - diagram root fallback
- SVG side:
  - labels
  - numbers
  - arrows
  - participant stereotypes
  - participant labels
  - participant icons
  - participant boxes
  - `rect.frame-border-inner`, fallback `rect.frame-border` / `rect.frame-box`
  - diagram root fallback

Residual scope attribution:

- Pick the closest candidate to the cluster centroid on each side
- Prefer targets that contain the centroid
- Prefer more specific categories over large containers:
  - `participant-icon`
  - `participant-stereotype`
  - `label`, `number`, `participant-label`
  - `arrow`
  - `participant-box`
  - `frame-border`
  - `diagram-root`
- Use cluster/target overlap and centroid distance as tie-breakers

Residual scope output:

- `residual_scopes`: all attributed clusters
- `residual_scope_summary`: top 20 concise lines for terminal use
- `residual_scope_html_only_top`: top 10 `html-only` clusters
- `residual_scope_svg_only_top`: top 10 `svg-only` clusters
- When answering from the live panel, also report:
  - the largest red clusters from `#diff-panel canvas`
  - the largest blue clusters from `#diff-panel canvas`
  - approximate diagram-space positions or bounding boxes
  - attributed HTML and SVG targets for those clusters
  - a short grouped summary of where the red and blue pixels are concentrated

Live panel validation:

- Source of truth for residual hotspots is `#diff-panel canvas`
- Confirm the hotspot by reading the panel's actual red and blue pixels at that area
- If the panel shows no red or blue pixels there, do not report that hotspot as a real residual diff
- If the panel shows non-zero red or blue totals, do not stop at the totals alone; locate the dominant clusters and report them
- Do not build or rely on a separate screenshot-to-screenshot diff for pixel comparison when `#diff-panel canvas` is available on the page

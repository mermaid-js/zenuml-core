# Selectors And Keys

The analyzer uses these roots:

- HTML root: `#html-output .frame`, fallback `#html-output .sequence-diagram`
- SVG root: `#svg-output > svg`

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
- Participant label: last `.name` descendant, measured by glyph boxes

SVG participant header extraction:

- Participant root: `g.participant[data-participant]`
- Skip `g.participant-bottom`
- Participant box element: `:scope > rect.participant-box`
- Participant box measurement must use the painted outer bounds of the stroked rect, not the inset rect geometry
- Participant label: `:scope > text.participant-label`

Participant box pairing and scoring:

- Pair by participant name
- Report `html_box` and `svg_box` with `x`, `y`, `w`, `h`
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
- Relative icon drift against the participant label anchor:
  - `relative_dx`
  - `relative_dy`
- If there is no participant label on one side, use the participant box center as the anchor
- Report presence mismatch if one renderer has an icon and the other does not
- Diff confirmation is taken from the native diff slot covering the union of the HTML and SVG icon boxes

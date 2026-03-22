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

HTML icon extraction:

- Icons are async-loaded SVG components within participant boxes
- Container: `.bg-skin-participant` (the participant box)
- Icon element: `svg` child within the participant box (first child before text label)
- Icon types identified by component name or SVG content signature
- Supported types: actor (stick figure), database, sqs, sns, iam, boundary, control, entity

SVG icon extraction:

- Icons are inline SVG `<g>` elements within participant groups
- Container: `g.participant[data-participant="<name>"]`
- Icon element: `g` with `transform` attribute (positioned icon group) as first child
- Icon content: SVG paths within the icon group
- Icon size: 24×24px (standard for all icons)
- Position: Left of participant label text with 4px margin

Icon pairing:

- Icons are paired by participant name using `data-participant` attribute (SVG) and text content (HTML)
- Pairing key: `icon:<participant-name>`
- Compare icon presence (both renderers should have icon or both should not)

Icon scoring:

- Compare icon position relative to participant label center
- Compare icon visual appearance via diff image (paths should match within tolerance)
- Report position deltas: `icon_dx`, `icon_dy` (icon center offset between HTML and SVG)
- Report presence mismatch if one renderer has icon and the other doesn't
- Visual match confirmed when diff image shows <5% red/blue pixels in icon bounding box

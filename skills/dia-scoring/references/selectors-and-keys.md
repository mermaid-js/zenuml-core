# Selectors And Keys

The analyzer uses these roots:

- HTML root: `#html-output .frame`, fallback `#html-output .sequence-diagram`
- SVG root: `#svg-output > svg`

HTML label extraction:

- Normal messages: iterate `.interaction`, skip `.return`, `.creation`, and self interactions, then read `.message .editable-span-base`
- Self messages: `.self-invocation .label .editable-span-base`
- Returns: `.interaction.return .message .editable-span-base`, fallback `.interaction.return .name`

SVG label extraction:

- Normal messages: `g.message:not(.self-call) > text.message-label`
- Self messages: `g.message.self-call > text.message-label`
- Returns: `g.return > text.return-label`

Pairing key:

- Semantic grouping is by `kind + text`
- Duplicate labels are paired by top-to-bottom order within that group
- Output key is:
  - `kind`
  - `text`
  - `y_order`

Per-letter scoring:

- Grapheme segmentation uses `Intl.Segmenter`, fallback `Array.from`
- Glyph boxes come from browser layout ranges, not whole-word centroids
- Numeric `dx` and `dy` are only emitted when direct layout evidence and diff-image evidence agree

Arrow extraction:

- HTML normal/return messages:
  - line: direct child `svg` line strip inside `.message`
  - head: direct child arrowhead `svg` inside `.message`
- HTML self messages:
  - loop: `svg.arrow`
- SVG normal messages:
  - line: `line.message-line`
  - head: `svg.arrow-head`
- SVG returns:
  - line: `line.return-line`
  - head: `polyline.return-arrow`
- SVG self messages:
  - loop: outer `svg` under `g.message.self-call`

Arrow scoring:

- Arrows are keyed by sequence number when numbering is available, for example `arrow:1.2.3`
- Normal and return arrows are measured as one combined geometry item:
  - line + arrow head together
- Self arrows are measured as one loop geometry item
- Arrow output is endpoint-based, not box-centroid-based
- For normal and return arrows, report:
  - `left_dx`
  - `right_dx`
  - `width_dx`
- Do not report `dy` for horizontal message arrows

HTML sequence number extraction:

- Normal messages: `.interaction:not(.return):not(.creation):not(.self-invocation):not(.self) > .message > .absolute.text-xs`
- Self messages: `.interaction.self-invocation > .message .absolute.text-xs`
- Returns: `.interaction.return > .message > .absolute.text-xs`

SVG sequence number extraction:

- Normal messages: `g.message:not(.self-call) > text.seq-number`
- Self messages: `g.message.self-call > text.seq-number`
- Returns: `g.return > text.seq-number`

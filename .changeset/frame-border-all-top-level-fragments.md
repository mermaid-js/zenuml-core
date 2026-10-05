---
"@zenuml/core": patch
---

Keep every fragment inside the diagram frame when a diagram has several top-level fragments. The frame padding was sized for the first top-level fragment only, so a later fragment with more nesting overflowed the frame in the DOM renderer, and the SVG renderer placed shallower fragments too far left. Both renderers now size the frame for the deepest top-level fragment and place every fragment by its own nesting border, so DOM and SVG fragment edges and frame widths agree.

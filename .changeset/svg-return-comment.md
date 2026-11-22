---
"@zenuml/core": patch
---

In `renderToSvg`, a comment above a return message is now drawn on its own row above the return arrow, starting at the arrow's left end, the same as the DOM renderer. Before, it was drawn on the arrow's row at the sender and was cut off at the right edge of the diagram.

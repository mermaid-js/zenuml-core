---
"@zenuml/core": patch
---

Add `enableWritingAnimation`, an experimental `render()` option that is off by default. When it is on, the diagram does not draw a line while you type it until the line is complete enough to draw as intended, and after 1.2 seconds without a new render it draws the text as is. Diagram editing is off while a line is held, and `await render()` resolves only when the diagram shows the text you passed. There is no motion yet. Nothing changes for an embedder that does not pass the option.

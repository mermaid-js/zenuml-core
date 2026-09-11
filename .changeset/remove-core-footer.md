---
"@zenuml/core": minor
---

Remove the embedded diagram footer, including Tips/help, theme selection, numbering controls, zoom controls, and the ZenUML website link. Host applications now own these controls and attribution.

Add `enableNumbering?: boolean` to the render configuration. Explicit values override stored numbering preferences; omission preserves existing state, with numbering initially enabled. Theme rendering, `setTheme()`, and the existing `zoomIn()`/`zoomOut()` methods remain available.

---
"@zenuml/core": patch
---

HTML renderer: the dashed group outline no longer paints half a pixel below the diagram frame. Its bottom edge now runs into the frame's bottom border as one clean line, as in `renderToSvg()`.

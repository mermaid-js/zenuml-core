---
"@zenuml/core": patch
---

`renderToSvg()` now draws the dashed outline of an unnamed participant group (`group { A B }`), as the HTML renderer does, and draws two groups that share a name as two outlines instead of one.

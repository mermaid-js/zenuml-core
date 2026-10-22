---
"@zenuml/core": patch
---

Fix fragment widths in the HTML renderer when a diagram has several fragments. The width of a fragment no longer depends on the fragments measured before it, so a nested fragment's title or condition no longer overflows its parent fragment by one nesting level of border.

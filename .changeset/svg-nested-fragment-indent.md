---
"@zenuml/core": patch
---

Indent every level of nested fragments in SVG output. Fragments nested three or more levels deep, all starting at the same participant, now sit 10px inside their container on the left, as in the DOM renderer; before, only the first nesting level was indented.

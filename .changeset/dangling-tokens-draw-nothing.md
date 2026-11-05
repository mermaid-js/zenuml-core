---
"@zenuml/core": patch
---

A half-typed arrow, assignment or return no longer draws an element the text does not contain. A line with only `A->`, only `r =`, or only `@return` is skipped, so the HTML and SVG renderers agree and the next message keeps its number. An unclosed quote in a participant or method name no longer shows the raw quote.

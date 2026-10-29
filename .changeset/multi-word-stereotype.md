---
"@zenuml/core": minor
---

Accept multi-word stereotypes: `<<legacy system>> A` now parses (on both the ANTLR and Langium parsers) and renders the stereotype as `legacy system`, the same as `<<"legacy system">> A`. Previously the line was a syntax error that also dropped every participant of the diagram.

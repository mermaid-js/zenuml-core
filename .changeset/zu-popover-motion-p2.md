---
"@zenuml/core": patch
---

Editor chrome motion (P2 of ADR 0003): the participant style panel, its type and colour pickers, the message style panel and the gap insert menu now open with a 200 ms fade-and-scale and close with a 120 ms reverse, driven by the `--zu-dur-*` and `--zu-ease-out` tokens. Only `transform` and `opacity` animate, so the diagram never repaints for chrome motion. Under `prefers-reduced-motion: reduce` every duration is 0 and popovers appear and disappear at once. The insert-participant button's `transition-all` is now an explicit property list.

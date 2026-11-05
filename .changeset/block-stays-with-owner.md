---
"@zenuml/core": patch
---

Fix a spurious Section fragment for a `{` block that does not parse. An unclosed block, or a closed block with a syntax error in its body, now stays with its owner (`if`, `else`, `while`, `par`, a message), so the owner keeps its body and its numbering. A missing `}` before `else` keeps both branches in one `alt`. A `{` with no owner and no `}` renders no fragment and reports an error. Complete anonymous `{ ... }` blocks, `section(x) { ... }` and `frame(x) { ... }` are unchanged.

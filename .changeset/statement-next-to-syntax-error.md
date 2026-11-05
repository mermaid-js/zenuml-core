---
"@zenuml/core": patch
---

Keep a complete message as one statement when the next token is a syntax error. Before, a call such as `A.b()` at the end of an unclosed block, or before an extra closing bracket, rendered as three self-calls and lost its target.

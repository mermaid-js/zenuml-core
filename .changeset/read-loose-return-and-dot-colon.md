---
"@zenuml/core": patch
---

Read `A.b: x` as `A->b: x`, drop a `@return` that has no message so it no longer takes the next token, and keep the closing brace after a bare `@return`.

---
"@zenuml/core": patch
---

Read `A.b: x` as `A->b: x`, read `@return x` with no arrow as `return x` and drop a bare `@return`, so neither takes the next token, and keep the closing brace after a bare `@return`.

---
"@zenuml/core": minor
---

`return A->B: msg` on one line now draws an async return from `A` to `B`, the same as `@return A->B: msg`. A `return` with nothing after it on its line now ends there, so the next line is the next statement and no longer becomes the return value. `@return`, `@reply` and `A-->B` keep working.

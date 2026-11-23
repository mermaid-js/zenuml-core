---
"@zenuml/core": patch
---

`in` works as an ordinary name outside a loop condition: `X.read(in)` draws one call with the argument `in`, not an empty message and a separate `read(in)`. `forEach(x in xs)` is unchanged.

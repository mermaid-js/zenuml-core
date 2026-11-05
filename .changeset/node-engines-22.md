---
"@zenuml/core": minor
---

Raise the declared Node version from 20 or later to 22.12 or later. Node 20 reached end of life on 30 April 2026, and the CJS entry of `@zenuml/core/parser` needs `require(esm)`, which every Node version from 22.12 has on by default. Browser use does not change.

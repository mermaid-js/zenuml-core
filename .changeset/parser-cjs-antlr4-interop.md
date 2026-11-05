---
"@zenuml/core": patch
---

Fix `require("@zenuml/core/parser")`, which threw `Cannot read properties of undefined (reading 'ATNDeserializer')` at load. The CJS entry now reads the default export of the ESM-only `antlr4` package. It needs a Node version with `require(esm)` on by default (20.19 or later in the 20 line, 22.12 or later in the 22 line); older versions still throw `ERR_REQUIRE_ESM`. The ESM entry does not change.

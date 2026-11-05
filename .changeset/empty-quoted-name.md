---
"@zenuml/core": patch
---

An empty quoted name used as an arrow target, call target or starter no longer replaces the whole diagram with a rendering error. The arrow or call is drawn as if the target were missing, and an empty starter is ignored.

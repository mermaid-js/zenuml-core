---
"@zenuml/core": patch
---

Remove the inert logger module; it printed nothing at any level since its threshold was fixed at warn and no warn/error call existed.

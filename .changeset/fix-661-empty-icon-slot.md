---
"@zenuml/core": patch
---

Do not reserve an icon slot for a participant type that has no icon. A declaration such as `@Alice "Alice"` no longer pushes the name 28px to the right or adds extra width (#661).

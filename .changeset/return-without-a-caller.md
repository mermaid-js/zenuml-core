---
"@zenuml/core": minor
---

`return A: msg` on one line now draws an async return to `A` from the participant whose method it is in, the same as `@return A: msg`. Before, it drew an empty return and a separate solid message, and the editor read it as `return A`.

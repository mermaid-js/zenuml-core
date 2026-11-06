---
"@zenuml/core": patch
---

An arrow to an empty quoted name with no label, such as `B->""`, now keeps its source participant and draws no message, like `B->`, and the layout no longer logs a console warning for messages that have no target.

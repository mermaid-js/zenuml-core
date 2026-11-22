---
"@zenuml/core": patch
---

Keep later statements inside their block while `} else`, `} else if(`, `} catch` or `} finally` is still being typed without its `{`. The branch's existing `}` now closes the new branch instead of the enclosing block.

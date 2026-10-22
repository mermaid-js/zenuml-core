---
"@zenuml/core": patch
---

Changing a participant's style no longer throws an exception when the parser crashes on the original code. It now uses the same safeguard as renaming a participant: the change applies if the result parses cleanly, and otherwise reports "Could not apply the change". Ordinary syntax errors in the original code were already handled and behave as before.

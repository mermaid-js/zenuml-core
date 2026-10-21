---
"@zenuml/core": patch
---

An icon token alone, such as `if([check])` or `while([check])`, and an unquoted condition that contains a number, such as `if(retry 3 times)`, are now valid fragment conditions instead of breaking the diagram.

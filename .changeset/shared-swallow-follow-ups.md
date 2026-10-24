---
"@zenuml/core": patch
---

Share one `swallowFollowUps` helper between the interaction controller and the message reorder handle. The reorder handle now cleans up on capture-phase `pointerup` / `pointercancel`, so a handler that stops propagation can no longer leave its click listener installed.

---
"@zenuml/core": patch
---

Share one `swallowFollowUps` helper between the interaction controller and the message reorder handle, so the reorder handle's click swallow always cleans up on `pointerup`.

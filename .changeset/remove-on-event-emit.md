---
"@zenuml/core": patch
---

Remove the `onEventEmit` render option and the internal `EventBus`. Nothing has called `onEventEmit` since the embedded theme selector was removed, so the callback never fired; host applications that want usage analytics should track their own toolbar and viewport controls. Passing `onEventEmit` is now ignored, as it effectively already was.

---
"@zenuml/core": patch
---

Fix bugs surfaced by wiring a real `tsc -b` typecheck gate into CI: the theme selector's analytics call was missing its `store` argument (a `TrackEvent(store, label, action, category)` call was passed only `label, action, category`, so opening/closing the theme modal or switching themes threw at the tracking call site instead of completing); `OrderedParticipants` and `renderingReadyAtom` were reaching into `Participants`'s private internal map instead of its public accessors; and a participant-position cast in the lifeline renderer silently discarded a `Set` bug. Also adds `@types/bun` and `@types/pngjs` so `src/cli/*` and PNG-comparison tests typecheck.

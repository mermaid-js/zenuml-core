---
"@zenuml/core": minor
---

Remove the legacy vertical-layout mode and the `setVerticalMode()` method it existed for.

The mode was reachable only through `ZenUml.setVerticalMode("legacy")` — undeclared in `types/index.d.ts` and never called in this repo — or through a `VITE_VERTICAL_MODE` build variable. It did not work: in that branch `LifeLine` returned early with an event-bus cleanup before reaching the code that populates `lifelineReadyAtom`, so `renderingReadyAtom` never became true and the promise returned by `render()` never resolved.

Removed with it: the `verticalModeAtom` state, the DOM-measurement fallback that only the legacy branch called, the `participant_set_top` event (its only listener lived in that branch), and `scripts/snapshot-dual.js` plus its `snapshots:dual` script — the script exported `VERTICAL_MODE` while the store read `VITE_VERTICAL_MODE`, so it had always diffed the default mode against itself.

The default `"html"` path is untouched: vertical coordinates still come from `VerticalCoordinates`. Unit tests, the visual snapshot suite and the interaction suite all pass unchanged.

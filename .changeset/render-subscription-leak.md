---
"@zenuml/core": patch
---

Stop `render()` leaking a store subscription on every call.

`doRender` waits for the diagram to mount by subscribing to `renderingReadyAtom`, but discarded the unsubscribe function `store.sub` returns. Every code-changing render therefore added a listener that stayed alive for the lifetime of the `ZenUml` instance — one per keystroke in a live editor, each re-reading the atom on subsequent renders.

The wait now releases its subscription as soon as it resolves. It also moves to `src/store/waitForRenderingReady.ts`, so the behaviour can be tested against a real store: `ZenUml.doRender` cannot be driven to completion outside a browser, which is why the render test in `core.spec.ts` is skipped, and the leak had no coverage at all.

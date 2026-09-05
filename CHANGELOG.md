# @zenuml/core

## 4.3.0

### Minor Changes

- [#433](https://github.com/mermaid-js/zenuml-core/pull/433) [`b57a37d`](https://github.com/mermaid-js/zenuml-core/commit/b57a37da414972992a6bdbe78ed3644bab6c275f) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove the legacy vertical-layout mode and the `setVerticalMode()` method it existed for.

  The mode was reachable only through `ZenUml.setVerticalMode("legacy")` — undeclared in `types/index.d.ts` and never called in this repo — or through a `VITE_VERTICAL_MODE` build variable. It did not work: in that branch `LifeLine` returned early with an event-bus cleanup before reaching the code that populates `lifelineReadyAtom`, so `renderingReadyAtom` never became true and the promise returned by `render()` never resolved.

  Removed with it: the `verticalModeAtom` state, the DOM-measurement fallback that only the legacy branch called, the `participant_set_top` event (its only listener lived in that branch), and `scripts/snapshot-dual.js` plus its `snapshots:dual` script — the script exported `VERTICAL_MODE` while the store read `VITE_VERTICAL_MODE`, so it had always diffed the default mode against itself.

  The default `"html"` path is untouched: vertical coordinates still come from `VerticalCoordinates`. Unit tests, the visual snapshot suite and the interaction suite all pass unchanged.

- [#433](https://github.com/mermaid-js/zenuml-core/pull/433) [`b57a37d`](https://github.com/mermaid-js/zenuml-core/commit/b57a37da414972992a6bdbe78ed3644bab6c275f) Thanks [@MrCoder](https://github.com/MrCoder)! - Make `renderToSvg`'s `theme` option work. It was accepted, typed and plumbed through the CLI's `-t` flag, but discarded — every SVG rendered with one hard-coded palette.

  `renderToSvg` now builds its `<style>` block from a palette table (`src/svg/themes.ts`) transcribed from the theme classes in `src/assets/tailwind.css`, so the SVG output matches what the DOM renderer draws for the same theme. Supported names widen from `theme-default | theme-mermaid` to also include `theme-clean-light`, `theme-clean-dark` and `theme-neon` — the themes the in-app theme selector offers. An unknown or omitted name resolves to `theme-default`.

  `theme-default` output is byte-identical to the previous hard-coded block, pinned by a test, so existing SVG snapshots do not move. `theme-mermaid` intentionally shares that palette: the two CSS classes differ only in footer visibility, which the SVG output does not draw. A theme changes colours only — participant positions, diagram size and viewBox are unaffected.

### Patch Changes

- [#431](https://github.com/mermaid-js/zenuml-core/pull/431) [`ebe6cda`](https://github.com/mermaid-js/zenuml-core/commit/ebe6cda80157180cbd65af65cb3aa7ae625b6cc1) Thanks [@MrCoder](https://github.com/MrCoder)! - Move the IR contract's prose into its companion document and merge a duplicate parser type model; no runtime behavior changes.

- [#428](https://github.com/mermaid-js/zenuml-core/pull/428) [`49b6d6b`](https://github.com/mermaid-js/zenuml-core/commit/49b6d6bbe0c23ded48746025e88791c8f3e86641) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove three unused state-management exports; no rendering or public-API behavior changes.

- [#424](https://github.com/mermaid-js/zenuml-core/pull/424) [`27df352`](https://github.com/mermaid-js/zenuml-core/commit/27df35207aa75d9f7e9bbee7dda67f59977d16f8) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove the inert logger module; it printed nothing at any level since its threshold was fixed at warn and no warn/error call existed.

- [#438](https://github.com/mermaid-js/zenuml-core/pull/438) [`c6960a9`](https://github.com/mermaid-js/zenuml-core/commit/c6960a9e005955bb3daf463f58597ab3e4f8305d) Thanks [@MrCoder](https://github.com/MrCoder)! - Gate drag-to-reorder behind `enableMessageReorder` and `RenderMode.Dynamic`.

  Drag-to-reorder was the one editing surface in the rendering core with no
  opt-out: no `enable*` flag like every other editing feature, and no check
  against `RenderMode.Static`. A render-only host (SVG export, a static embed)
  could have its diagram silently rewritten by an accidental drag.

  Added `enableMessageReorder` (default `false`, matching every other editing
  flag) and gated the drag handlers on `mode === RenderMode.Dynamic` as well.
  The demo site and E2E fixtures now opt in explicitly, matching how they
  already opt into participant/message/divider insertion and style editing.

- [#430](https://github.com/mermaid-js/zenuml-core/pull/430) [`b7b3baf`](https://github.com/mermaid-js/zenuml-core/commit/b7b3bafc385e716f51d77e617b638a72d83ca3e1) Thanks [@MrCoder](https://github.com/MrCoder)! - Merge the sync and async self-message components into one; rendered output is unchanged.

- [#437](https://github.com/mermaid-js/zenuml-core/pull/437) [`cd4aa09`](https://github.com/mermaid-js/zenuml-core/commit/cd4aa090a94163e13b687876bb14db1bbb8da070) Thanks [@MrCoder](https://github.com/MrCoder)! - Make `import "@zenuml/core"` work outside a browser.

  Importing the package entry threw `ReferenceError: location is not defined` in Node, so the typed `renderToSvg` export it advertises was unreachable server-side. Two module-scope reads ran while the module was still being evaluated: the localStorage-backed atoms built their keys from `location.hostname` and read storage eagerly, and a participant component computed a debug flag from `localStorage` at import time.

  Both are now read on first use, and every read is guarded, so the entry also imports in a browser configured to block site data. Verified by importing the built `dist/zenuml.esm.mjs` in plain Node and rendering a diagram through `renderToSvg`.

  No API change. The bundled CLI was unaffected, since it imports internal paths rather than the entry.

- [#425](https://github.com/mermaid-js/zenuml-core/pull/425) [`65d85c3`](https://github.com/mermaid-js/zenuml-core/commit/65d85c3a413cce061ebd38b646a0774428c536b2) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove unused parser prototype methods and the write-only Parser.Errors array; parsing and rendering are unchanged.

- [#429](https://github.com/mermaid-js/zenuml-core/pull/429) [`2327d2c`](https://github.com/mermaid-js/zenuml-core/commit/2327d2cd3771bd82f099856974cefdd58feca467) Thanks [@MrCoder](https://github.com/MrCoder)! - Collapse duplicated parser prototype method bodies and fix a non-advancing ancestor walk; parsing results are unchanged.

- [#435](https://github.com/mermaid-js/zenuml-core/pull/435) [`c42646d`](https://github.com/mermaid-js/zenuml-core/commit/c42646ddcdb837dcfd32e67fb1be31e2710361df) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix `render()` never resolving when a diagram has no participants.

  The wait for the diagram to finish mounting resolved on a change notification from `renderingReadyAtom`, and that atom is `lifelinesReported === participantCount`. Rendering a document with no participants — a comment-only file, or DSL that parses to nothing — leaves it `true` for the whole wait, so no change is ever emitted and the returned promise stays pending forever. Reproducible by rendering two such documents in a row: an editor showing a diagram, then a comment, then another comment.

  The wait now checks readiness once after starting the render instead of relying only on notifications.

- [#434](https://github.com/mermaid-js/zenuml-core/pull/434) [`bb08577`](https://github.com/mermaid-js/zenuml-core/commit/bb08577d7685a2cb0f2c1268d4c1933dc7a07a41) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop `render()` leaking a store subscription on every call.

  `doRender` waits for the diagram to mount by subscribing to `renderingReadyAtom`, but discarded the unsubscribe function `store.sub` returns. Every code-changing render therefore added a listener that stayed alive for the lifetime of the `ZenUml` instance — one per keystroke in a live editor, each re-reading the atom on subsequent renders.

  The wait now releases its subscription as soon as it resolves. It also moves to `src/store/waitForRenderingReady.ts`, so the behaviour can be tested against a real store: `ZenUml.doRender` cannot be driven to completion outside a browser, which is why the render test in `core.spec.ts` is skipped, and the leak had no coverage at all.

- [#439](https://github.com/mermaid-js/zenuml-core/pull/439) [`9ccf74a`](https://github.com/mermaid-js/zenuml-core/commit/9ccf74acbb7bc7b331683fcdac495a491d077d30) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix three DSL-corruption bugs in the style-toggle panel (bold/italic/underline/strikethrough).

  The style toggle was inline string surgery in a React event handler with no
  unit or E2E coverage. Extracted to `toggleMessageStyle`/`parseStyleComment`
  in `src/utils/messageStyleToggle.ts`, and fixed three defects found while
  extracting it:

  - Toggling a style on an un-indented existing comment duplicated the `//`
    marker (`// [italic] // note` instead of `// [italic] note`) — a falsy-zero
    bug in an `index || fallback` expression treated a match at index 0 as no
    match.
  - Toggling off the last style left a dangling `// []` annotation instead of
    either removing the line (no note) or keeping the note as a plain comment.
  - A comment with an unclosed `[` (`// [todo unclosed`) was misread as a
    style list, because `indexOf`'s `-1` "not found" result is truthy.

- [#432](https://github.com/mermaid-js/zenuml-core/pull/432) [`95f3da3`](https://github.com/mermaid-js/zenuml-core/commit/95f3da37443dd4fa96b9c4e23c248e60641242d2) Thanks [@MrCoder](https://github.com/MrCoder)! - Make the SVG renderer call the shared anchor and width implementations instead of re-deriving them; rendered output is unchanged.

- [#426](https://github.com/mermaid-js/zenuml-core/pull/426) [`9980ba7`](https://github.com/mermaid-js/zenuml-core/commit/9980ba77701401a18ae317bcd269395dc6539938) Thanks [@MrCoder](https://github.com/MrCoder)! - Remove unused layout and SVG helpers, unreachable guards, and duplicate utilities; rendering output is unchanged.

- [#433](https://github.com/mermaid-js/zenuml-core/pull/433) [`b57a37d`](https://github.com/mermaid-js/zenuml-core/commit/b57a37da414972992a6bdbe78ed3644bab6c275f) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop the width cache from freezing a wrong measurement for the life of the process.

  `WidthProviderOnCanvas` and `measureTextWithFont` fall back to a character-count estimate when no canvas context is available, and both wrote that estimate to the persistent cache tier — the tier that deliberately survives the `clearCache()` call made before every render. A consumer that measured anything before installing a canvas (the CLI installs one at startup, an embedder may not) kept the estimate forever, with no way to invalidate it. The estimate is now cached for the current render only.

  Two related fixes: the canvas cache key now includes the font spec, so a future change to the measured font cannot return a width measured at the old one; and `setCanvasContext()` now invalidates cached widths when the context actually changes, since widths measured with a different backend are not comparable and the backend is not part of any key.

  Adds `clearPersistentCache()` alongside `clearCache()` and documents which tier each one drops.

## 4.2.1

### Patch Changes

- [#421](https://github.com/mermaid-js/zenuml-core/pull/421) [`6436b95`](https://github.com/mermaid-js/zenuml-core/commit/6436b95d0fc1c32f8ca355ef1a15d16d5bb3adec) Thanks [@MrCoder](https://github.com/MrCoder)! - Reduce the core maintenance surface by consolidating Markdown rendering, cloud icon loading, and single-block fragment rendering while preserving parser and diagram behavior. Markdown watch mode now reuses the same rendering path as one-shot mode.

## 4.2.0

### Minor Changes

- [#419](https://github.com/mermaid-js/zenuml-core/pull/419) [`78687b2`](https://github.com/mermaid-js/zenuml-core/commit/78687b2b1bd2cd9714c6d7f1701487cec08bffb0) Thanks [@MrCoder](https://github.com/MrCoder)! - Narrow the `@zenuml/core/parser` subpath to its documented public surface: `validate()` and `parse()` only. The built bundle previously also exported `RootContext`, `ProgContext`, `GroupContext`, `ParticipantContext`, `Participants`, `Depth`, and a default object — none of which were declared in `types/parser/index.d.ts`, so no typed consumer could reference them. These ANTLR-internal helpers are now kept in-repo (`src/parser/index.js`) and no longer leak into the package contract; the subpath entry is a thin `src/parser/public.ts`.

  Also corrected the subpath's type docs, which claimed it "does not touch any shared module state" — importing it applies ZenUML's ANTLR prototype augmentation to the shared `antlr4` package as a one-time, import-time side effect. This is now documented honestly.

### Patch Changes

- [#420](https://github.com/mermaid-js/zenuml-core/pull/420) [`a5967b7`](https://github.com/mermaid-js/zenuml-core/commit/a5967b7edd1b4bdc817b3a123313a8755ec733e8) Thanks [@MrCoder](https://github.com/MrCoder)! - Enforce the v1 IR contract (`src/parser/ir/contract.ts`) instead of just documenting it. `src/parser-langium/compat.ts` now binds its module surface to `ParserModule` with `satisfies`, so the CI typecheck gate fails if the Langium facade drifts from the contract (including the ProgContext/GroupContext/ParticipantContext facade classes and the ParticipantsCollection shape, checked transitively).

  Wiring this surfaced three real contract-vs-reality drifts, now reconciled (all internal, no consumer-facing behavior change):

  - `IrNode.stop` was `TokenView` but ANTLR (and the facade) give zero-token rules `stop === null` — corrected to `TokenView | null`.
  - The `Participant` class marked renderer-facing fields (`type`, `stereotype`, `color`, …) `private` while exposing them via `ToValue()`; made them public to match `ParticipantView` (compile-time only).
  - `ParticipantsCollection.GetPositions`/`GetAssigneePositions` claimed `IrPosition[]` but return `Set | undefined` (the consumer normalizes with `Array.from(… ?? [])`) — corrected the contract.

  Also corrected the contract header, which falsely claimed the facade classes `implements` these interfaces.

- [#417](https://github.com/mermaid-js/zenuml-core/pull/417) [`c99ff91`](https://github.com/mermaid-js/zenuml-core/commit/c99ff91bac5b4dd8d72417fb51bd0cda6c955b21) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop publishing sourcemaps in the npm package (`!dist/**/*.map` in `files`). Sourcemaps are still generated by the release build (available for error-tracking/CI), they're just no longer shipped to consumers — where they added ~13 MB (54% of the tarball) without affecting anyone's runtime bundle. Unpacked package size drops from ~25 MB to ~11 MB.

- [#415](https://github.com/mermaid-js/zenuml-core/pull/415) [`85a8e82`](https://github.com/mermaid-js/zenuml-core/commit/85a8e8271fd78b4225d203a4122c0bb96c77ade9) Thanks [@MrCoder](https://github.com/MrCoder)! - Stop publishing demo-site assets in the npm package. The library build was copying `public/` (vendored codemirror/highlightjs/tailwind, demo HTML, `CNAME.txt`, `favicon.ico`, and a proprietary `MS Sans Serif.ttf`) into `dist/`. Set `copyPublicDir: false` on `vite.config.lib.ts` to match the cli/parser/lsp build configs; the demo site build (`vite.config.ts`) is unaffected and still ships its public assets.

- [#416](https://github.com/mermaid-js/zenuml-core/pull/416) [`17ed0aa`](https://github.com/mermaid-js/zenuml-core/commit/17ed0aabc86c87e28aa76e8ac2f5d336d3752507) Thanks [@MrCoder](https://github.com/MrCoder)! - Fix bugs surfaced by wiring a real `tsc -b` typecheck gate into CI: the theme selector's analytics call was missing its `store` argument (a `TrackEvent(store, label, action, category)` call was passed only `label, action, category`, so opening/closing the theme modal or switching themes threw at the tracking call site instead of completing); `OrderedParticipants` and `renderingReadyAtom` were reaching into `Participants`'s private internal map instead of its public accessors; and a participant-position cast in the lifeline renderer silently discarded a `Set` bug. Also adds `@types/bun` and `@types/pngjs` so `src/cli/*` and PNG-comparison tests typecheck.

## 4.1.0

### Minor Changes

- [#410](https://github.com/mermaid-js/zenuml-core/pull/410) [`1802cbf`](https://github.com/mermaid-js/zenuml-core/commit/1802cbf615b3531d5154f09f6b743dc64de82bcf) Thanks [@MrCoder](https://github.com/MrCoder)! - Add a headless `@zenuml/core/parser` subpath exporting reentrant `validate(code)` and `parse(code)`.

  Unlike the default entry (a browser/DOM bundle that throws `location is not defined` in Node), this subpath imports cleanly server-side and is reentrant — each call uses its own error listener instead of the shared module-level `Errors`/`ErrorDetails`, so it is safe to call repeatedly or concurrently. `validate` returns `{ pass, errorDetails }`; `parse` additionally returns the error-recovered `rootContext` tree.

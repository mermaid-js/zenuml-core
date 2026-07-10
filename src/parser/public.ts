/**
 * Public entry for the `@zenuml/core/parser` subpath.
 *
 * Deliberately re-exports ONLY `validate()` and `parse()` — the surface the
 * published `types/parser/index.d.ts` declares. `./index` also exports several
 * ANTLR-internal helpers (`RootContext`, `ProgContext`, `Participants`, …) for
 * in-repo use, but those are implementation detail and must not leak into the
 * package's public contract.
 *
 * Importing this module (transitively via `./index`) applies ZenUML's ANTLR
 * prototype augmentation to the shared `antlr4` package as a one-time,
 * import-time side effect; the `validate`/`parse` calls themselves are reentrant.
 */
export { parse, validate } from "./index";

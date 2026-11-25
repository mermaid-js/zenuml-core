# MIGRATION STATUS — Dual-parser architecture (Stages 0–5 complete)

The Langium migration concluded with the **dual-parser architecture** (Stage 5b): ANTLR remains the production renderer parser, while `src/parser-langium/` is an active side-car powering the LSP server (completion, hover, and diagnostics) for editor autocomplete. See [14-dual-parser-architecture.md](14-dual-parser-architecture.md) for full architectural details.

## Where we are

| Stage | Status |
|---|---|
| Survey + risk map (docs 01–07) | ✅ committed `59c115c0` |
| Stage 0: golden harnesses + baselines + dead-code removal | ✅ committed `415cf5a9` (313 goldens; gate 1075/0) |
| Deps: langium 4.2.4 + chevrotain 12 + langium-cli | ✅ committed `32032035` |
| Stage 1: Chevrotain lexer parity | ✅ committed `a7043c26` (100/100 goldens, ~80× faster, token order pinned) |
| v1 IR contract (hybrid decision) | ✅ committed `e69ac2a2` (`src/parser/ir/contract.ts` + doc 09) |
| Stage 2: Langium grammar | ✅ committed `5f730131` (421 parity tests, 25 tolerance points, 2 G7 exclusions; full suite 1597/0) |
| Stage 3+4: facade + visitors | ✅ **COMPLETE.** Dual-run A/B 190 identical / 8 explained (G7) / 0 unexplained (`scripts/parity/dualrun-diff.mjs`, report 11). `instanceof` shim added (`src/parser-langium/instanceof-shim.ts`) so facade nodes satisfy `instanceof sequenceParser.<Kind>Context` (renderer + AncestorPath). Langium oracle `ZENUML_PARSER=langium bun test src/parser test/unit` = 1210 pass / 1 fail / 2 skip — the single fail is the documented `A.m(` G7 recovery exception (12-stage34-exceptions.md). Default ANTLR full suite unchanged: 1597/0 (1600). |
| Stage 5: cutover | ⏪ **ATTEMPTED then REVERTED.** Flipped default to Langium and got it fully green (unit 1601/0 both engines, `bun pw` 120/120). But rebasing onto `main` surfaced the perf finding below, so the cutover was rolled back. Historical record: 13-stage5-cutover.md. |
| ⚠️ Perf finding (post-rebase) | main's ANTLR perf commits (`d163803b` SLL two-stage, `db1038ad` lexer DFA) make the **new ANTLR ~12× faster cold than Langium** on large input; both memoize on repeat. Migration's parse-speed rationale is gone. |
| **Stage 5b: dual-parser architecture** | ✅ **COMPLETE — final state.** ANTLR ships in production (`src/parser/*` reverted to ANTLR-only; engine flag + instanceof shim deleted; ESM bundle back to baseline 460,986 B gz, **zero Chevrotain**). Langium kept as isolated build-time side-car (`src/parser-langium/`) for the LSP server. CI consistency gate `bun run parity:dualrun` wired into `cd.yml` (190 identical / 8 G7 / 0 unexplained). Full doc: [14-dual-parser-architecture.md](14-dual-parser-architecture.md). |
| Stage 6 decommission | ❌ **CANCELLED** — under the dual-parser model ANTLR is the production parser and stays. |
| Langium LSP server | ✅ **BUILT.** `src/parser-langium/lsp/` — validation (duplicate-participant warning + auto syntax diagnostics), participant-name completion, hover (participant/endpoint/creation/title). Node stdio server `dist/lsp/main.js` via `bun run build:lsp`; `bun run lsp` to run. 8 LSP tests (`langium/test`) + stdio boot smoke, both in `bun run test`; CI also runs `build:lsp`. Library bundle stays ANTLR-only (LSP never imported by it). Details in [14-dual-parser-architecture.md](14-dual-parser-architecture.md). |
| Next (optional) | VS Code extension packaging; richer LSP (go-to-def, semantic tokens, outline). |

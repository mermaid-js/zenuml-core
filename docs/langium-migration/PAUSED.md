# MIGRATION STATUS — Stages 0–5 complete, rebased onto `main` 2026-06-13

(Originally paused at the 10% weekly-usage threshold on 2026-06-12; resumed and
carried through Stage 5 cutover + a rebase onto current `main`.)

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
| **Stage 5b: dual-parser architecture** | ✅ **COMPLETE — final state.** ANTLR ships in production (`src/parser/*` reverted to ANTLR-only; engine flag + instanceof shim deleted; ESM bundle back to baseline 460,986 B gz, **zero Chevrotain**). Langium kept as isolated build-time side-car (`src/parser-langium/`) for the LSP server. CI consistency gate `bun run parity:dualrun` wired into `cd.yml` (190 identical / 8 G7 / 0 unexplained). Full doc: **14-dual-parser-architecture.md**. |
| Stage 6 decommission | ❌ **CANCELLED** — under the dual-parser model ANTLR is the production parser and stays. |
| Next: Langium LSP server | not started — build on the `src/parser-langium/` side-car (separate effort). |

## How to resume Stage 3+4

Re-invoke the Workflow tool with:
- scriptPath: `/Users/pengxiao/.claude/projects/-Users-pengxiao-workspaces-zenuml-mmd-zenuml-core--claude-worktrees-langium-migration/86eede3c-7a2f-45a0-a40a-5acf7b79abe0/workflows/scripts/langium-stage34-facade-wf_2a471e17-804.js`
- resumeFromRunId: `wf_2a471e17-804`

(If the session is gone, just relaunch the same script — round-2+ prompts read the on-disk state first, so a fresh run continues from the WIP. The oracle command is `ZENUML_PARSER=langium bun test src/parser test/unit`.)

Earlier run IDs for reference: understand `wf_e2fbd158-4da`, stage0 `wf_88680a76-75d`, stage1 `wf_56da19e6-7e7`, stage2 `wf_b30ac1d8-b1f`.

## Budget protocol (user-set)

Hard stop at 10% of weekly "All models" usage (check https://claude.ai/new#settings/usage). Weekly resets Thu ~11:00 PM local. Model split: fable for facade/grammar reasoning rounds, sonnet for gates/benches/doc work. The 29-min cron guard (job 8bfe1d65) was deleted at pause; recreate it on resume.

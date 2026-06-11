# MIGRATION PAUSED — weekly usage threshold (10%) reached 2026-06-12

## Where we are

| Stage | Status |
|---|---|
| Survey + risk map (docs 01–07) | ✅ committed `59c115c0` |
| Stage 0: golden harnesses + baselines + dead-code removal | ✅ committed `415cf5a9` (313 goldens; gate 1075/0) |
| Deps: langium 4.2.4 + chevrotain 12 + langium-cli | ✅ committed `32032035` |
| Stage 1: Chevrotain lexer parity | ✅ committed `a7043c26` (100/100 goldens, ~80× faster, token order pinned) |
| v1 IR contract (hybrid decision) | ✅ committed `e69ac2a2` (`src/parser/ir/contract.ts` + doc 09) |
| Stage 2: Langium grammar | ✅ committed `5f730131` (421 parity tests, 25 tolerance points, 2 G7 exclusions; full suite 1597/0) |
| **Stage 3+4: facade + visitors** | ⏸ **IN FLIGHT — WIP committed on pause.** Round 1 (fable) was mid-implementation. Facade skeleton exists (`src/parser-langium/facade/`, `compat.ts`, `engine-flag.ts`); `src/parser/{index.js,ToCollector.js,FrameBuilder.ts,MessageCollector.ts,ContextsFixture.ts}` modified for the engine flag + visitor rewiring. Default (ANTLR) suite verified green at pause: 1600 tests, 0 fail. Langium-flag spec status: unknown/incomplete. |
| Stage 5 cutover, Stage 6 decommission | not started |

## How to resume Stage 3+4

Re-invoke the Workflow tool with:
- scriptPath: `/Users/pengxiao/.claude/projects/-Users-pengxiao-workspaces-zenuml-mmd-zenuml-core--claude-worktrees-langium-migration/86eede3c-7a2f-45a0-a40a-5acf7b79abe0/workflows/scripts/langium-stage34-facade-wf_2a471e17-804.js`
- resumeFromRunId: `wf_2a471e17-804`

(If the session is gone, just relaunch the same script — round-2+ prompts read the on-disk state first, so a fresh run continues from the WIP. The oracle command is `ZENUML_PARSER=langium bun test src/parser test/unit`.)

Earlier run IDs for reference: understand `wf_e2fbd158-4da`, stage0 `wf_88680a76-75d`, stage1 `wf_56da19e6-7e7`, stage2 `wf_b30ac1d8-b1f`.

## Budget protocol (user-set)

Hard stop at 10% of weekly "All models" usage (check https://claude.ai/new#settings/usage). Weekly resets Thu ~11:00 PM local. Model split: fable for facade/grammar reasoning rounds, sonnet for gates/benches/doc work. The 29-min cron guard (job 8bfe1d65) was deleted at pause; recreate it on resume.

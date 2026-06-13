# 14 — Dual-parser architecture: ship ANTLR, side-car Langium for LSP

## Decision

After rebasing onto `main` showed that `main`'s own ANTLR perf work (two-stage
SLL parsing + lexer DFA caching + memoization) made the existing parser faster
than the Langium replacement (see 13-stage5-cutover.md), the full cutover was
**reverted**. The end state instead keeps **both** parsers with different jobs:

- **ANTLR is the production parser.** The published library (`@zenuml/core`) and
  the CLI parse with ANTLR — fast, and no bundle cost beyond today's baseline.
- **Langium is a build-time side-car** (`src/parser-langium/`) used to generate
  the **LSP server** (Langium's native strength) and as the reference for the
  CI consistency gate. It is **never imported by any production code path**, so
  it adds **zero bytes** to the shipped bundle.
- **CI enforces that the two parsers agree**, so they cannot drift as the DSL
  evolves.

This realises the value of the migration work (a declarative `.langium` grammar
+ modern LSP tooling) without the bundle cost or the perf regression a full
cutover would have introduced.

## What ships vs what is side-car

| Concern | Engine | Entry |
|---|---|---|
| Library render (`@zenuml/core`) | ANTLR | `src/parser/index.js` (ANTLR-only) |
| CLI | ANTLR | `src/cli/zenuml.ts` → `@/parser` |
| LSP server (planned) | Langium | `src/parser-langium/` (grammar + services) |
| CI consistency oracle | both | `scripts/parity/dualrun-diff.mjs` |

`src/parser/index.js` and the parser-layer modules (`MessageCollector`,
`ToCollector`, `FrameBuilder`, `ContextsFixture`) are ANTLR-only again — the
Stage-5 engine-flag wiring and the `instanceof` shim were removed, and
`src/parser-langium/engine-flag.ts` + `instanceof-shim.ts` deleted. Verified:
the library ESM bundle is **460,986 B gz (baseline 460,638; +348 B noise)** with
**zero Chevrotain** in the output.

## The consistency gate

Two layers, both run in `cd.yml`'s `test` job (gating publish/deploy):

1. **`bun run test`** — includes `test/unit/parity/*`, which checks each engine's
   lexer token stream, parse-tree shape, and text/comment output against the
   committed `__golden__` JSON (313 goldens). Catches drift of either engine
   away from the recorded ANTLR truth.
2. **`bun run parity:dualrun`** (`scripts/parity/dualrun-diff.mjs`) — parses all
   198 corpus cases with **both** live engines and diffs the trees through a
   shared facade-level API (kind, `start.start`, `stop.stop`,
   `getFormattedText()`, `getComment()`). Exits non-zero on any **undocumented**
   divergence. Current: **190 identical / 8 explained (G7 recovery) / 0
   unexplained**.

The 8 explained diffs are error-recovery-shape differences on grammar-invalid
input (ANTLR `DefaultErrorStrategy` vs Chevrotain single-token recovery),
classified by the committed goldens themselves carrying error nodes — see
07-risk-map.md §G7 and 12-stage34-exceptions.md.

### Scope of the guarantee (honest boundary)

The gate proves **structural + positional + text/comment parity** of the parse
trees. It does **not** currently compare the renderer-derived aggregates
(`Participants()`, `AllMessages()`, `Depth()`, `Owner()`/`Origin()`) across
engines — those were proven equal during Stage 3+4 (full legacy suite ran green
under the facade) but are not re-checked by the side-car gate, because the
legacy specs now run under ANTLR only (the engine flag that let them run under
Langium was removed for bundle isolation).

For the **LSP use case this is the right boundary**: an LSP consumes the AST
structure and token positions, not the renderer's `SignatureText`/`Owner`. If
stronger behavioural parity is wanted later, extend `dualrun-diff.mjs` to also
diff `Participants(tree)` / `AllMessages(tree)` per case — both engines expose
those (`@/parser` for ANTLR, `compat.ts` for Langium), no production re-coupling
needed.

## Maintenance contract

When the ZenUML DSL changes, **both grammars must change**: `src/g4/*.g4`
(ANTLR) and `src/parser-langium/zenuml.langium`. The CI gate fails if they
diverge, so a missed update on either side is caught before merge — the
discipline is "edit both, let CI prove they agree."

## LSP server (built)

The Langium side-car now drives a working LSP server — `src/parser-langium/lsp/`:

| File | Role |
|---|---|
| `zenuml-lsp-module.ts` | LSP services wiring — reuses the core parser overrides from `services.ts`, layers `langium/lsp` defaults + the providers below. `createZenUmlLspServices(context)`. |
| `zenuml-validator.ts` | Semantic validation (parser/lexer errors are automatic; adds a duplicate-participant warning). |
| `zenuml-completion.ts` | Completion — appends the document's participant names (collected live) to Langium's defaults. |
| `zenuml-hover.ts` | Hover for participants, message endpoints, creations, title. |
| `participants.ts` | Shared helper: collect participant names from a parsed document. |
| `main.ts` | Node server entry (`startLanguageServer` over stdio). |

Build/run: `bun run build:lsp` builds **both** transports:
- `dist/lsp/main.js` — Node stdio server (~104 KB; `bun run lsp` runs it from
  source). Wire `dist/lsp/main.js --stdio` as the server command in a desktop
  editor / Node-backed language client.
- `dist/lsp/zenuml-server.worker.js` — **browser Web Worker** bundle (~163 KB gz,
  self-contained, zero Node APIs) for a serverless, in-browser language server.

### Using it with CodeMirror (or Monaco) — browser, no backend

Yes. The server logic is editor-agnostic; only the transport differs. The
Langium parser is pure JS (Chevrotain), so the whole server runs in a Web Worker
— **no backend process needed**:

```ts
// in the web app that hosts the editor
import { ZenUmlCompletion, /* … */ } from "...";
const worker = new Worker(
  new URL("@zenuml/core/lsp-worker", import.meta.url),
  { type: "module" },
);
// bridge the worker to the editor with an LSP client:
//  - CodeMirror 6: @codemirror/lsp-client (official) or codemirror-languageserver
//                  (community), pointed at a Transport that wraps the worker's
//                  postMessage channel.
//  - Monaco: monaco-languageclient over the same worker.
```

The worker speaks standard LSP/JSON-RPC over `postMessage`; the CodeMirror LSP
client provides completion, hover, and diagnostics in the editor from it. Both
transports are smoke-verified to boot and advertise `completionProvider` +
`hoverProvider` (Node over stdio; worker over `postMessage`).

Alternative (if you prefer a Node backend): run `dist/lsp/main.js` and expose it
over a WebSocket with `vscode-ws-jsonrpc`, then point `codemirror-languageserver`
at that URL. The Web-Worker path is simpler for a static/serverless web app
(e.g. app.zenuml.com / the Cloudflare-hosted add-ons), which have no LSP backend.

The CodeMirror **client glue lives in the consuming web app**, not in this
parser repo (CodeMirror is intentionally not a dependency here) — this package
ships the server worker; the app wires it to its editor.

Tested end-to-end without an editor in `src/parser-langium/lsp/lsp.spec.ts`
(8 tests via Langium's `langium/test` harness: validation diagnostics,
participant-name completion, hover), plus a stdio boot smoke check confirming the
server advertises `completionProvider` + `hoverProvider`. These run in
`bun run test`; CI also builds the server (`build:lsp`) so it can't rot.

Note: for this grammar Langium's default completion contributes no keyword items
(ZenUML's fragment keywords are terminal tokens, not inline literals), so the
participant-name completion is the primary editor assist.

## Status / next steps

- ✅ Production reverted to ANTLR-only; bundle at baseline; side-car isolated.
- ✅ CI consistency gate wired (`parity:dualrun` + `build:lsp` in `cd.yml`).
- ✅ Langium LSP server built + tested (validation, completion, hover).
- ⏭️ Editor packaging: a VS Code extension (language client + `.zenuml`
  grammar/config) that launches `dist/lsp/main.js`.
- ⏭️ Richer LSP: go-to-definition / find-references across message endpoints,
  semantic tokens, document symbols (outline of participants + messages).
- ⏭️ Optional: behavioural dual-run (Participants/AllMessages) if the LSP grows
  to need renderer-equivalent semantics.
- The Stage-5 cutover doc (13) is retained as the historical record of why the
  cutover was attempted and then reverted.

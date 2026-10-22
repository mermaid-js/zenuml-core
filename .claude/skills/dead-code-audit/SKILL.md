---
name: dead-code-audit
description: Layered dead-code audit for mermaid-js/zenuml-core that goes past a linter scan. Use when asked to find dead code, unreachable code, unused files or exports, "not reachable" code, 死代码, or to explain why a public option/API no longer does anything. Covers statement-level checks, reachability from product entries, grep verification, git archaeology for intent, and premise-checked numbered options before any deletion.
---

# Dead Code Audit

A shallow audit runs one tool and lists its output. That answers "is there unreachable code?" with "no" and misses the code that is never called. This skill goes five layers deep, and each layer answers a question the previous one cannot.

## Hard rules

1. **Report nothing you have not grepped.** Tool output is a candidate list, not a finding.
2. **Explain before you propose deleting anything public.** A public option or type that does nothing needs its history first (layer 4).
3. **Check every option's premise against the current code before recommending it** (layer 5). Do not recommend "reconnect X to Y" until you have confirmed Y still exists.
4. **Do not delete during the audit.** Report findings and numbered options, then wait for a choice.

## Layer 1: statement-level unreachable code

Code after `return`/`throw`, constant-false branches, and similar.

```bash
bunx tsc --noEmit --allowUnreachableCode false
bunx eslint src --rule 'no-unreachable: error'
```

Zero hits is common, and it is a real result worth stating. It does not mean there is no dead code.

## Layer 2: reachability from product entries

Find files and exports that no product entry ever reaches. Tests do not count as callers.

- **knip** for unused files, exports and dependencies: `bunx knip --reporter compact` (install ad hoc if it is not in `package.json`; do not commit it unless asked).
- **esbuild metafile** to build the real import graph from each product entry, then diff against `src/**`:

```bash
bunx esbuild src/core.tsx src/cli/zenuml.ts src/parser-langium/lsp/main.ts src/parser-langium/lsp/worker.ts \
  --bundle --metafile=/tmp/meta.json --outdir=/tmp/out --format=esm --platform=node \
  --loader:.scss=empty --loader:.css=empty --log-level=error
```

Product entries in this repo (verify they are still current before using them): `src/core.tsx` (library, see `vite.config.lib.ts`), `src/cli/zenuml.ts` (the `zenuml` bin), `src/parser-langium/lsp/main.ts` and `worker.ts` (LSP), and the demo pages `index.html`, `embed.html`, `renderer.html` (see `vite.config.ts`). Any file in `src/` that is absent from every entry's `inputs` is a candidate.

## Layer 3: verify every candidate with grep

For each candidate, grep for the symbol and the file path (including dynamic `import()`, string references in configs, `.html` script tags and `scripts/`). Classify each one:

- **Dead:** no caller outside its own tests.
- **Test/script-only:** reached only from `test/` or `scripts/`. Decide whether that is intentional.
- **False positive:** keep, and say why.

Known false positives and intentional keeps in this repo:

- A `.d.ts` that types a sibling `.js` file (for example `src/parser/ToCollector.d.ts`).
- The Langium compat layer (`src/parser-langium/compat.ts`, `facade/`, `lexer/`), which only `test/unit/parity` and `scripts/parity` use. It is kept on purpose during the parser migration (see `docs/langium-migration/`), so it is not dead code.

## Layer 4: git archaeology for anything public

For a public option, exported type or documented feature that no longer does anything, find out what it was for and how it died before proposing a fix.

```bash
git fetch --unshallow 2>/dev/null || true   # cloud clones are shallow; history is needed here
git log --follow --format='%h %ad %s' --date=short -- <file>
git log -S '<symbol>' --format='%h %ad %s' --date=short
git show <sha> --stat
```

Answer three questions:

1. **Intent:** what problem the code solved, and who the consumer was (internal components or the host app).
2. **Death:** which commit removed the last caller, and whether that was deliberate (a redesign) or collateral (a refactor that forgot it).
3. **Impact:** whether anything external still relies on it, such as docs (`TUTORIAL.md`), `types/index.d.ts`, or a host product. Say clearly which parts are inference and which are in the repo.

Example from 2026-10: `onEventEmit` was still documented, but `TrackEvent` had no callers. The history showed it was analytics for the host app, and that its last callers went away when the core theme selector and toolbar were deleted (that UI moved to the host product). That changed the recommendation from "reconnect it" to "delete it with a changeset".

## Layer 5: premise-checked, numbered options

Before writing options, check each one's premise against the current code: the component, file or hook it depends on must still exist, and it must still be the right owner. Then present:

- A short direct answer first: statement-level result, then the reachability findings.
- Findings grouped by kind (public API, unreferenced files, test-only layers, stray exports), with the evidence for each.
- **Numbered options** so the person can reply with a digit, one marked as recommended with a one-line reason. Flag any option that changes the public API, since that needs a changeset (decide minor vs. major with the person).

If a premise turns out to be wrong after you have posted, retract the option openly (strike it through) and re-offer the choices.

## After a choice

Delete in one PR: code, its tests, types in `types/index.d.ts`, docs, and a changeset for public API changes. Run `bun run test` (not bare `bun test`) and `bunx tsc --noEmit` before pushing.

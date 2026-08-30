# Reduce Maintained Lines of Code

## Goal

Reduce source-controlled and maintained lines of code without removing supported ZenUML behavior, weakening parser parity, or making clean-clone builds unreliable.

## Scope and sequence

The work proceeds from low-risk deletions to deeper consolidation:

1. Delete production modules that have no production callers, together with tests that only exercise those disconnected modules. Preserve `emojiService` because the accepted emoji and icon-registry designs explicitly retain it as the registry adapter.
2. Replace the repeated cloud-icon loader entries with a generic lookup while preserving the existing single lazy chunk and unknown-icon fallback.
3. Move CLI Markdown rendering into one implementation used by normal and watch modes.
4. Consolidate the five single-block fragment renderers and their kind-only vertical-layout subclasses. Keep Alt, Try/Catch/Finally, and Ref separate because their behavior differs materially.
5. Replace the Langium-to-ANTLR compatibility facade with the smallest adapter needed by the dual-parser parity gate. Preserve the dual-parser architecture, the LSP, and all parity facts currently checked by CI.
6. Stop tracking generated parser and icon output only if generation can be made deterministic and mandatory for clean-clone build, test, and release commands. Otherwise retain generated output and report that repository-LOC-only change as rejected.

## Behavioral invariants

- HTML and SVG diagrams render unchanged.
- Parser exports and the production ANTLR parser remain unchanged.
- Langium LSP behavior remains unchanged.
- The dual-parser gate still compares kind, source range, formatted text, comments, and tree structure for the full corpus.
- CLI normal, Markdown, batch, PNG, and watch behavior remains unchanged.
- Cloud icons remain lazy-loaded as one chunk.
- Unrelated untracked files remain untouched.

## Verification

Each refactor receives focused tests before moving to the next. Final validation runs the repository's complete local pipeline, including formatting/lint checks, TypeScript typecheck, Bun tests, parser parity, builds, and Playwright coverage required by the branch validation workflow. A package-impacting refactor receives a patch changeset.

The branch is submitted only after local validation passes. GitHub Actions is monitored to green, and the PR is landed using the repository's prescribed merge strategy. Merging does not publish npm artifacts.

## Expected result

The maintained-code changes should remove roughly 4,000 lines, primarily by deleting the obsolete parser compatibility surface. Generated-output policy may remove a further 12,000 tracked lines, but only when it does not transfer hidden setup complexity to contributors or release automation.

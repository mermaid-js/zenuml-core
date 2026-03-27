---
name: validate-branch
description: Run local validation checks on the current branch before shipping. Use when the user says "validate", "check branch", "am I good", "run tests", "preflight", "is this ready", or wants to verify their branch passes all checks before pushing or creating a PR. Also use as a precondition check before invoking submit-branch or ship-branch.
---

# Validate Branch

Verify the current branch passes all local checks. This is the "am I good?" skill — run it anytime before shipping, or just to check your work.

## Why this order matters

Checks run fastest-first so you get feedback quickly. Lint catches syntax issues in seconds. Unit tests catch logic errors in a few seconds. Playwright E2E is slowest (~1-2 min) and catches integration regressions. No point waiting for E2E if lint fails.

## Steps

Run from the `zenuml-core` directory. Stop on first failure.

### 1. Lint

```bash
bun eslint
```

If lint fails, report the errors and stop. These are usually quick fixes.

### 2. Unit tests

```bash
bun run test
```

Do NOT use `bun test` — it picks up Playwright files and gives false failures. If tests fail, report the failing test names and stop.

### 3. Playwright E2E

```bash
bun pw
```

If snapshot tests fail, check whether the changes are intentional (rendering code changed) or unexpected. Report which snapshots failed.

## Output

Report one of:

- **PASS** — all 3 checks passed, branch is ready
- **FAIL** — which check failed, the error output, and a one-line suggestion

## Gotchas

- `bun run test` not `bun test` — critical difference, the latter runs E2E too
- Playwright needs browsers installed (`bun pw:install` if missing)
- If the dev server is running on port 8080, Playwright may conflict — check first
- HTML Playwright snapshot failures are a hard stop — never update HTML snapshots without understanding why they changed

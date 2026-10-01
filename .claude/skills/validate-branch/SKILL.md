---
name: validate-branch
description: Run local validation checks on the current branch before shipping. Use when the user says "validate", "check branch", "am I good", "run tests", "preflight", "is this ready", or wants to verify their branch passes all checks before pushing or creating a PR. Also use as a precondition check before invoking submit-branch or ship-branch.
---

# Validate Branch

Verify the current branch passes all local checks. This is the "am I good?" skill — run it anytime before shipping, or just to check your work.

## Why this order matters

Checks run fastest-first so you get feedback quickly. Lint catches syntax issues in seconds. Unit tests catch logic errors in a few seconds. Playwright E2E is slowest (~1-2 min) and catches integration regressions. No point waiting for E2E if lint fails.

## Steps

Run from the `zenuml-core` directory, in order. On a failure, diagnose it and make the smallest safe repair in the current branch, then rerun the failed check. Continue through the remaining checks only after it passes. After any code or fixture change, rerun the full sequence from lint so the final state passes every check. Repairing failures is part of validation; do not stop to ask for routine permission.

### 1. Lint

```bash
bun eslint
```

If lint fails, inspect the reported files and apply the minimal lint or code fix that preserves intended behavior. Rerun lint and proceed only when it passes.

### 2. Unit tests

```bash
bun run test
```

Do NOT use `bun test` — it picks up Playwright files and gives false failures. For unit failures, inspect the failing tests and implementation, identify the cause, and make a minimal behavior-preserving fix. Keep or add meaningful regression coverage; never delete, skip, weaken, or rewrite assertions merely to get a pass. Rerun unit tests and proceed only when they pass.

### 3. Playwright E2E

Before running Playwright, make sure port `14000` is either free or owned by a dev server started from **this repo**. `playwright.config.ts` uses `reuseExistingServer`, so an unrelated Vite server on `14000` will cause false results.

```bash
PORT="${PORT:-14000}"
THIS_REPO="$(pwd -P)"
LISTENER_PID="$(lsof -tiTCP:${PORT} -sTCP:LISTEN 2>/dev/null | head -n1 || true)"

if [ -n "$LISTENER_PID" ]; then
  LISTENER_CMD="$(ps -p "$LISTENER_PID" -o command=)"
  if [[ "$LISTENER_CMD" != *"$THIS_REPO"* ]]; then
    echo "Port ${PORT} is owned by another repo; killing PID ${LISTENER_PID}"
    kill "$LISTENER_PID"
  fi
fi
```

If you killed a different repo's server, do **not** start Vite manually. `bun pw` will launch the correct dev server from this folder via Playwright's `webServer` config.

```bash
bun pw
```

For E2E or snapshot failures, inspect the failure and compare it with the intended change. Repair regressions in code. Update a snapshot only when the rendered change is an expected consequence of the branch; never blindly refresh snapshots or use snapshot updates to hide a regression. Rerun Playwright and proceed only when it passes.

If a failure is caused by a genuine external blocker (for example, unavailable dependencies, missing browser installation, or an unrelated service), diagnose it and make the available environment repair when safe (for example, install the required Playwright browsers with `bun pw:install`). Do not disguise an unresolved failure as a pass. If it remains blocked, report the check, relevant error, repairs attempted, and what is needed to continue.

## Output

Report one of:

- **PASS** — all 3 checks passed on the final code; branch is ready
- **BLOCKED** — a check could not complete after diagnosis and safe repair attempts; name the check, summarize the error and attempts, and state what is needed to continue

## Gotchas

- `bun run test` not `bun test` — critical difference, the latter runs E2E too
- Playwright needs browsers installed (`bun pw:install` if missing)
- Before `bun pw`, verify any existing `14000` listener belongs to this repo; otherwise kill it and let Playwright start the right server
- HTML Playwright snapshot failures require understanding the rendered change before repair or snapshot update

---
name: babysit-pr
description: >
  Monitor a PR's CI pipeline and fix failures automatically. Use when the user says
  "babysit", "watch the pipeline", "monitor CI", "fix CI", "check PR status",
  or after pushing code when CI needs attention. Also use when the user asks to
  retry failed checks, update snapshots, or investigate pipeline failures.
---

# Babysit PR

Monitor a pull request's CI/CD pipeline. Classify failures, take corrective action, and retry. Stop after 3 attempts.

## PR Resolution

Resolve which PR to babysit, in priority order:

1. **Argument**: `$ARGUMENTS` — a PR number (e.g. `340`) or branch name
2. **Current branch**: `gh pr view --json number,headRefName` — use the current branch's open PR
3. **Latest PR**: `gh pr list --limit 1 --json number,headRefName`

Once resolved, print: **Babysitting PR #\<number\> (\<branch\>)**

## Monitor Loop (max 3 attempts)

### Step 1: Check CI status

```bash
gh pr checks <number>
```

If all checks pass, report success and stop.

### Step 2: Get failed run details

For each failed check, get the run ID and fetch logs:

```bash
gh run view <run-id> --log-failed
```

### Step 3: Classify the failure

| Log pattern | Classification |
|-------------|---------------|
| `toHaveScreenshot` or `svg-parity.spec.ts` failures | **E2E snapshot mismatch** |
| `bun run test` failures, assertion errors in unit tests | **Unit test failure** |
| `build:site` or `deploy-to-cloudflare` errors | **Build/deploy failure** |
| Network timeouts, OOM, transient GitHub errors | **Flaky** |

### Step 4: Take action

#### E2E snapshot mismatch

Snapshots generated locally (macOS) don't match Linux CI. Trigger the Linux snapshot update workflow:

```bash
# Usage: gh workflow run update-snapshots.yml --ref <branch>
# See .github/workflows/update-snapshots.yml for details
gh workflow run update-snapshots.yml --ref <branch>
```

Then poll until complete (30s intervals):

```bash
gh run list --workflow=update-snapshots.yml --branch=<branch> --limit=1 --json databaseId,status,conclusion
```

The workflow auto-commits updated snapshots and re-runs E2E. Wait for the follow-up E2E run to finish before counting as success or moving to the next attempt.

#### Unit test failure

1. Read the failed test output from the run logs
2. Identify the failing test and error message
3. Attempt a local fix — edit code, verify with `bun run test`
4. If fixed: commit and push (CI re-triggers automatically)
5. If not fixable after reasonable effort: report failure details and stop

#### Build/deploy failure

1. Read the build error from run logs
2. **Code issue** (TypeScript error, missing import): fix locally, commit, push
3. **Infrastructure** (Cloudflare credentials, esbuild target limits): report and skip — not fixable from code
4. **Known issue** — `top-level await` error in `deploy-to-cloudflare` for `compare-case.js`: this is a pre-existing esbuild target issue. Report it and continue monitoring other checks.

#### Flaky

Re-run only the failed jobs:

```bash
gh run rerun <run-id> --failed
```

Wait for completion, then re-check.

### Step 5: Wait and verify

After taking action, wait for CI to re-run. Go back to Step 1.

## Reporting

After each attempt, print a status line:

```
Attempt <N>/3: <classification> → <action taken> → <result>
```

On completion (success or 3 failures), print a summary:

```
## babysit-pr summary
PR: #<number> (<branch>)
Attempts: <N>
Result: PASS | FAIL
Actions taken:
  1. <action> → <outcome>
  2. ...
```

## Rules

- Never force-push or rewrite git history
- Never modify files unrelated to the failure
- If a fix requires changing test logic (not just snapshots), ask the user first
- Poll with 30s intervals — don't busy-wait
- If the same failure persists across 2 attempts with the same classification, try a different approach or escalate to the user

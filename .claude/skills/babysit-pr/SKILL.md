---
name: babysit-pr
description: Monitor and fix failing GitHub Actions CI checks on PRs for mermaid-js/zenuml-core. Use when the user says "babysit PR", "check PR status", "fix CI", "PR is failing", "watch this PR", "why is CI red", or when used with /loop to continuously monitor a PR. Also use when Playwright snapshot failures occur in CI, lint/format issues block merging, or unit tests fail on a PR. Triggers on any PR monitoring, CI failure diagnosis, or automated fix-and-retry workflow.
---

# Babysit PR

Monitor a GitHub Actions PR, diagnose failures, attempt fixes, and retry — up to 3 times total.

## Scope

This skill targets **mermaid-js/zenuml-core** only. All commands run from the zenuml-core directory.

## Step 1: Find the PR

Resolve which PR to babysit, in this priority order:

1. **Explicit PR number** — if the user provided one (e.g., `#341`), use it
2. **Current branch PR** — run `gh pr view --json number,title,headRefName,state,statusCheckRollup` from the zenuml-core directory
3. **Recently failed PR** — if no PR on current branch, find the most recent failed PR in the last 10 minutes:
   ```bash
   gh run list --repo mermaid-js/zenuml-core --status failure --limit 5 --json databaseId,headBranch,event,createdAt,conclusion,name
   ```
   Filter to runs created within the last 10 minutes. If multiple, pick the most recent.

If no PR is found, tell the user and stop.

## Step 2: Check CI Status

```bash
gh pr checks <PR_NUMBER> --repo mermaid-js/zenuml-core
```

**If all checks pass**: Report success and stop. Nothing to babysit.

**If checks are still running**: Report status and wait. Use `gh run watch <RUN_ID> --repo mermaid-js/zenuml-core` to wait for completion (with a 10-minute timeout). Then re-evaluate.

**If checks failed**: Proceed to Step 3.

## Step 3: Diagnose Failures

For each failed check, pull the logs:

```bash
gh run view <RUN_ID> --repo mermaid-js/zenuml-core --log-failed
```

Categorize the failure:

| Category | Indicators |
|----------|-----------|
| **Playwright snapshot mismatch** | `Error: A]snapshot.*doesn't match`, `Screenshot comparison failed`, pixel diff errors, `-linux.png` referenced |
| **Playwright test logic failure** | Assertion errors, timeouts, element not found — but NOT snapshot diffs |
| **Unit test failure** | Failures in `bun run test`, vitest output |
| **Lint/format failure** | ESLint errors, Prettier diffs |
| **Build failure** | Vite build errors, TypeScript compilation errors |
| **Merge conflict** | `CONFLICT`, `merge conflict`, cannot rebase cleanly |
| **Infra/flaky** | Network timeouts, runner issues, cache failures |

## Step 4: Attempt Fix

**Important**: Before fixing, make sure the local branch is up to date with the PR branch:
```bash
git fetch origin && git checkout <PR_BRANCH> && git pull origin <PR_BRANCH>
```

### Fix by Category

#### Playwright Snapshot Mismatch (Linux)

This is the most common CI-only failure because snapshots are platform-specific.

1. **Verify it's a snapshot diff** (not a logic error) by reading the failure log
2. **Check if the change is intentional** — look at recent commits on the branch. If they modified rendering code, SVG output, or CSS, snapshot updates are expected
3. **Trigger the Linux snapshot update workflow**:
   ```bash
   gh workflow run update-snapshots.yml --repo mermaid-js/zenuml-core --ref <PR_BRANCH>
   ```
4. **Wait for the workflow to complete**:
   ```bash
   # Find the run ID (most recent on that branch)
   gh run list --repo mermaid-js/zenuml-core --workflow update-snapshots.yml --branch <PR_BRANCH> --limit 1 --json databaseId,status
   # Watch it
   gh run watch <RUN_ID> --repo mermaid-js/zenuml-core
   ```
5. **Pull the auto-committed snapshots** locally:
   ```bash
   git pull origin <PR_BRANCH>
   ```
6. The update-snapshots workflow commits and verifies automatically. If it passes, CI should go green on next run.

#### Playwright Test Logic Failure

1. **Reproduce locally first**:
   ```bash
   bun pw --grep "<test name pattern>"
   ```
2. **Read the failing test** to understand what it expects
3. **Fix the code** (not the test, unless the test expectation is wrong)
4. **Verify locally**: `bun pw --grep "<test name pattern>"`
5. **Commit and push**

#### Unit Test Failure

1. **Reproduce locally**:
   ```bash
   bun run test --run
   ```
2. **Fix the code or test**
3. **Verify**: `bun run test --run`
4. **Commit and push**

#### Lint/Format Failure

1. **Auto-fix**:
   ```bash
   bun eslint
   bun prettier
   ```
2. **Verify no remaining issues**:
   ```bash
   bun eslint 2>&1 | tail -5
   ```
3. **Commit and push** the formatting fixes

#### Build Failure

1. **Reproduce locally**:
   ```bash
   bun build
   ```
2. **Read the error** — usually TypeScript errors or missing imports
3. **Fix, verify locally, commit and push**

#### Merge Conflict

1. **Report to user** — do NOT auto-resolve merge conflicts. Show what's conflicting and ask for guidance.

#### Infra/Flaky

1. **Re-run the failed job**:
   ```bash
   gh run rerun <RUN_ID> --repo mermaid-js/zenuml-core --failed
   ```
2. If it fails again with the same infra error, report to user.

## Step 5: Push and Monitor

After applying a fix:

1. **Run the full local test suite** before pushing (when the failure category allows local reproduction):
   ```bash
   bun run test --run   # unit tests
   bun pw               # playwright (local, macOS — won't catch Linux snapshot diffs)
   bun eslint           # lint
   ```
2. **Commit with a clear message**:
   ```bash
   git add <specific files>
   git commit -m "fix: <what was fixed> to pass CI"
   ```
3. **Push**:
   ```bash
   git push origin <PR_BRANCH>
   ```
4. **Wait for CI** — use `gh run watch` on the new run
5. **Evaluate result** — go back to Step 2

## Step 6: Retry Budget

Track attempts. Each "attempt" is one push-and-wait cycle (or one workflow trigger-and-wait for snapshot updates).

- **Maximum 3 attempts total**
- After each failed attempt, re-diagnose from scratch (Step 3) — the failure mode may have changed
- **If a test passes on retry without code changes**, flag it as potentially flaky:
  > "Test `<name>` passed on retry without changes — likely flaky. Consider investigating stability."
- **After 3 failed attempts**, stop and report:
  - What was tried
  - What the current failure is
  - Your best theory for root cause
  - Suggested next steps for the user

## Step 7: Summary Report

After babysitting completes (success or exhausted retries), produce a brief report:

```
## PR #<number> Babysit Report
- **Status**: [PASSED | FAILED after N attempts]
- **Failures found**: <list of categories>
- **Fixes applied**: <list of commits pushed>
- **Flaky tests**: <any tests that passed on retry without changes>
- **Manual attention needed**: <anything unresolved>
```

## Safety Rules

- **Never force-push** — always regular `git push`
- **Never resolve merge conflicts automatically** — report and ask
- **Never push while CI is still running** from a previous attempt — wait for it to finish first
- **Never modify the snapshot update workflow itself** — only trigger it
- **Always verify fixes locally** before pushing (except Linux snapshot updates which can only be verified in CI)
- **Check for in-progress CI** before pushing — avoid wasting CI minutes on runs that will be superseded

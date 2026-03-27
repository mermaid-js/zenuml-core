---
name: babysit-pr
description: Monitor and fix failing GitHub Actions CI checks on PRs for mermaid-js/zenuml-core. Use when the user says "babysit PR", "babysit-pr", "babysit-prs", "check PR status", "fix CI", "PR is failing", "watch this PR", "why is CI red", "CI failed", "checks failed", or wants to monitor a PR until it goes green. Also triggers on Playwright snapshot failures in CI, lint/format issues blocking merge, unit test failures on a PR, or any CI failure diagnosis and fix-retry workflow. This skill handles the full loop: diagnose, fix, push, wait for CI, retry — so you don't need /loop unless you want periodic polling after CI passes.
---

# Babysit PR

Diagnose failing CI on a PR, fix what you can, push, wait for CI, and repeat — up to 3 attempts. The goal is to get the PR to green without the user having to context-switch into CI debugging.

## Scope

This skill targets **mermaid-js/zenuml-core** only. All commands run from the zenuml-core directory.

## Example

User says: "babysit #341"

What happens:
1. Check PR #341's CI status — E2E workflow failed
2. Pull failure logs — Playwright snapshot mismatch on `sequence-basic-linux.png`
3. Recent commits modified SVG rendering, so snapshot update is expected
4. Trigger `update-snapshots.yml` workflow on the PR branch
5. Wait for workflow to complete — it auto-commits updated snapshots
6. Pull the new commits, wait for CI to re-run
7. All checks pass — report success

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

- **All checks pass**: Report success and stop.
- **Checks still running**: Wait using `gh run watch <RUN_ID> --repo mermaid-js/zenuml-core` (10-minute timeout). Then re-evaluate.
- **Checks failed**: Proceed to Step 3.

## Step 3: Diagnose Failures

Pull the failure logs:

```bash
gh run view <RUN_ID> --repo mermaid-js/zenuml-core --log-failed
```

Categorize the failure:

| Category | Indicators |
|----------|-----------|
| **Playwright snapshot mismatch** | `snapshot.*doesn't match`, `Screenshot comparison failed`, pixel diff errors, `-linux.png` referenced |
| **Playwright test logic failure** | Assertion errors, timeouts, element not found — but NOT snapshot diffs |
| **Unit test failure** | Failures in `bun run test`, vitest output |
| **Lint/format failure** | ESLint errors, Prettier diffs |
| **Build failure** | Vite build errors, TypeScript compilation errors |
| **Merge conflict** | `CONFLICT`, `merge conflict`, cannot rebase cleanly |
| **Infra/flaky** | Network timeouts, runner issues, cache failures |

## Step 4: Fix

Before fixing, sync the local branch:
```bash
git fetch origin && git checkout <PR_BRANCH> && git pull origin <PR_BRANCH>
```

### Playwright Snapshot Mismatch (Linux)

The most common CI-only failure — snapshots are platform-specific, so macOS snapshots won't match Linux CI. When rendering code, SVG output, or CSS changed in recent commits, snapshot updates are expected.

1. Verify it's a snapshot diff (not a logic error) by reading the failure log
2. Confirm the change is intentional — check recent commits on the branch
3. Trigger the Linux snapshot update workflow:
   ```bash
   gh workflow run update-snapshots.yml --repo mermaid-js/zenuml-core --ref <PR_BRANCH>
   ```
4. Wait for it:
   ```bash
   gh run list --repo mermaid-js/zenuml-core --workflow update-snapshots.yml --branch <PR_BRANCH> --limit 1 --json databaseId,status
   gh run watch <RUN_ID> --repo mermaid-js/zenuml-core
   ```
5. Pull the auto-committed snapshots: `git pull origin <PR_BRANCH>`
6. GitHub doesn't trigger CI from bot pushes (prevents infinite loops). Push an empty commit to trigger CI with the updated snapshots:
   ```bash
   git commit --allow-empty -m "ci: trigger CI after Linux snapshot update"
   git push origin <PR_BRANCH>
   ```
7. The workflow verifies snapshots pass before committing, so CI should go green on the triggered run.

### Playwright Test Logic Failure

1. Reproduce locally: `bun pw --grep "<test name pattern>"`
2. Read the failing test to understand expectations
3. Fix the code (not the test, unless the expectation is genuinely wrong)
4. Verify: `bun pw --grep "<test name pattern>"`
5. Commit and push

### Unit Test Failure

1. Reproduce: `bun run test --run`
2. Fix the code or test
3. Verify: `bun run test --run`
4. Commit and push

### Lint/Format Failure

1. Auto-fix: `bun eslint && bun prettier`
2. Verify: `bun eslint 2>&1 | tail -5`
3. Commit and push

### Build Failure

1. Reproduce: `bun build`
2. Fix TypeScript errors or missing imports
3. Verify, commit and push

### Merge Conflict

Report to user and ask for guidance. Merge conflicts involve intent decisions that shouldn't be automated — the user knows which side of the conflict represents the desired behavior.

### Infra/Flaky

1. Re-run the failed job: `gh run rerun <RUN_ID> --repo mermaid-js/zenuml-core --failed`
2. If it fails again with the same infra error, report to user.

## Step 5: Push and Monitor

After applying a fix:

1. Run the local test suite before pushing (when the failure allows local reproduction):
   ```bash
   bun run test --run   # unit tests
   bun pw               # playwright (macOS — won't catch Linux snapshot diffs)
   bun eslint           # lint
   ```
2. Commit with a descriptive message:
   ```bash
   git add <specific files>
   git commit -m "fix: <what was fixed> to pass CI"
   ```
3. Check that no CI run is in progress from a previous push — pushing while CI runs wastes CI minutes on a run that will be superseded.
4. Push: `git push origin <PR_BRANCH>`
5. Wait for CI: `gh run watch` on the new run
6. **Loop back to Step 2** — re-evaluate CI status

## Step 6: Retry Budget

Each "attempt" is one push-and-wait cycle (or one workflow trigger-and-wait for snapshot updates).

- **Maximum 3 attempts**
- Re-diagnose from scratch after each failure (Step 3) — the failure mode may have changed after your fix
- If a test passes on retry without code changes, flag it as flaky so the user can investigate stability later
- After 3 failed attempts, stop and report what was tried, the current failure, your best theory for root cause, and suggested next steps

## Step 7: Summary Report

After babysitting completes (success or exhausted retries):

```
## PR #<number> Babysit Report
- **Status**: PASSED | FAILED after N attempts
- **Failures found**: <list of categories>
- **Fixes applied**: <list of commits pushed>
- **Flaky tests**: <any tests that passed on retry without changes>
- **Manual attention needed**: <anything unresolved>
```

## Safety

- Use regular `git push` — force-pushing can overwrite collaborators' review commits
- Don't auto-resolve merge conflicts — they involve intent decisions only the user can make
- Wait for in-progress CI to finish before pushing — avoids wasting CI minutes and confusing the retry count
- Don't modify the snapshot update workflow — only trigger it
- Verify fixes locally before pushing (except Linux snapshot updates, which can only be verified in CI)

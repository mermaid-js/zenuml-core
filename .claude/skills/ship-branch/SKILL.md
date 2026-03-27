---
name: ship-branch
description: Ship the current branch from local validation through to npm release. Orchestrates validate-branch, submit-branch, babysit-pr, and land-pr in sequence. Use when the user says "ship", "ship it", "ship this branch", "ship to production", "release this", "get this to npm", or wants to go from local branch to published npm package in one command. Stops at the first failure with a clear report.
---

# Ship Branch

Orchestrate the full path from local branch to npm release. This skill composes four sub-skills in sequence, stopping at the first failure.

## Flow

```
validate-branch → FAIL → stop, report
     | PASS
submit-branch → FAIL → stop, report
     | PR ready
babysit-pr → EXHAUSTED → stop, "CI blocked"
     | GREEN
land-pr → BLOCKED → stop, report
     | MERGED
land-pr → PUBLISH FAIL → alert, stop
     | PUBLISHED
     done
```

## Steps

### Step 0: Rebase on remote main

Fetch and rebase onto `origin/main` to ensure the branch is up to date before validating.

```bash
git fetch origin main
git rebase origin/main
```

If the rebase has conflicts, stop immediately and report. The developer must resolve conflicts manually before shipping.


### Step 1: Validate locally

Invoke `/validate-branch`. If it reports FAIL, stop and show the failure. The developer needs to fix locally before shipping.

### Step 2: Submit as PR

Invoke `/submit-branch`. If it reports FAILED, stop and show what went wrong (dirty worktree, push conflict, etc.).

On success, note the PR number and URL.

### Step 3: Get CI green

Invoke `/babysit-pr` with the PR number from Step 2. If it exhausts all 3 retry attempts, stop and report "CI blocked" with the babysit report.

On success, the PR is green and ready to merge.

### Step 4: Land and verify release

Invoke `/land-pr` with the PR number. If merge is blocked (pending reviews, failed checks), stop and report.

If merge succeeds but npm publish fails, alert immediately with the failure details. Do NOT auto-rollback.

On full success, report the new npm version.

## Rules

- **Each step is a hard boundary.** No step reaches back to retry a previous step.
- **No auto-rollback.** Stop and report on any failure. The developer decides next steps.
- **Only this skill calls babysit-pr.** Sub-skills never cross-call each other.
- **Confirm before merge.** Since merge = npm release, pause and confirm with the user before Step 4 unless they explicitly said "ship it" (indicating full automation is intended).

## Output

Final report:

```
## Ship Report: <branch-name>
- Validation: PASS
- PR: #<number> (<url>)
- CI: GREEN (attempt <N>)
- Merge: SQUASHED into main (<sha>)
- npm: @zenuml/core@<version> published
```

Or on failure:

```
## Ship Report: <branch-name>
- Validation: PASS
- PR: #<number>
- CI: BLOCKED after 3 attempts
- Stopped at: babysit-pr
- Details: <failure summary>
```

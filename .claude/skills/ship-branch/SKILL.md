---
name: ship-branch
description: Ship the current branch from local validation through to MERGED on main. Orchestrates validate-branch, submit-branch, babysit-pr, and land-pr in sequence. Use when the user says "ship", "ship it", "ship this branch", "merge this", or wants to go from local branch to merged in one command. Stops at merge — the npm release is a separate step via /release-app. Stops at the first failure with a clear report.
---

# Ship Branch

Orchestrate the full path from local branch to **merged on main**. This skill composes sub-skills in sequence, stopping at the first failure.

**Merging does NOT publish to npm.** Merge to main triggers cd.yml's `draft-release` job, which prepares a draft GitHub Release. Promoting that draft to a published release (which runs `npm publish`) is a separate step — use **`/release-app`** after shipping.

## Flow

```
rebase on origin/main → CONFLICT → stop, report
     | CLEAN
validate-branch → FAIL → stop, report
     | PASS
submit-branch → FAIL → stop, report
     | PR ready
babysit-pr → EXHAUSTED → stop, "CI blocked"
     | GREEN
land-pr → BLOCKED → stop, report
     | MERGED (draft release prepared)
     done → suggest /release-app to publish to npm
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

### Step 4: Land (merge only)

Merging no longer publishes to npm, so this step is safe to automate. To preserve the land-pr skill's merge-strategy logic (which the orchestrator has skipped before), **spawn an Agent** for this step:

```
Spawn an Agent with this prompt:
"Use the Skill tool to invoke the land-pr skill, then follow it to land PR #<PR_NUMBER>
on mermaid-js/zenuml-core. Follow every step including the merge strategy evaluation.
Report back the merge SHA and the draft release version that was prepared, or the
reason it was blocked."
```

Replace `<PR_NUMBER>` with the actual PR number from Step 2.

Do NOT run `gh pr merge` directly from the main conversation — the land-pr skill contains merge strategy decision logic that must be evaluated by the Agent.

On success, report the merge SHA and the prepared draft version.

## Rules

- **Each step is a hard boundary.** No step reaches back to retry a previous step.
- **No auto-rollback.** Stop and report on any failure. The developer decides next steps.
- **Only this skill calls babysit-pr.** Sub-skills never cross-call each other.
- **Ship stops at merge.** This skill does NOT publish to npm. Publishing is `/release-app`. Do not promote the draft release here.

## Output

Final report:

```
## Ship Report: <branch-name>
- Validation: PASS
- PR: #<number> (<url>)
- CI: GREEN (attempt <N>)
- Merge: <SQUASHED|MERGED> into main (<sha>)
- Draft release: v<version> prepared (not yet published)
- Next: /release-app to publish @zenuml/core@<version> to npm
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

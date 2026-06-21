---
name: ship-branch
description: Ship the current branch from local validation through to MERGED on main. Orchestrates validate-branch, submit-branch, babysit-pr, and land-pr in sequence. Use when the user says "ship", "ship it", "ship this branch", "merge this", or wants to go from local branch to merged in one command. Merging does NOT publish to npm — releases are driven by Changesets; publish via /release-app. Stops at the first failure with a clear report.
---

# Ship Branch

Orchestrate the full path from local branch to **merged on main**. This skill composes sub-skills in sequence, stopping at the first failure.

**Merging does NOT publish to npm.** This repo uses [Changesets](https://github.com/changesets/changesets). A feature PR that affects the published package carries a `.changeset/*.md`; merging it just feeds the **"chore: version packages"** PR that the Changesets Action keeps updated. Publishing happens only when that version PR is merged — use **`/release-app`**.

## Flow

```
rebase on origin/main → CONFLICT → stop, report
     | CLEAN
ensure changeset (if change affects published package) → MISSING → add via `bun run changeset`
     | PRESENT or N/A
validate-branch → FAIL → stop, report
     | PASS
submit-branch → FAIL → stop, report
     | PR ready
babysit-pr → EXHAUSTED → stop, "CI blocked"
     | GREEN
land-pr → BLOCKED → stop, report
     | MERGED (version PR updated)
     done → suggest /release-app to publish to npm
```

## Steps

### Step 0: Rebase on remote main

```bash
git fetch origin main
git rebase origin/main
```

If the rebase has conflicts, stop immediately and report. Resolve manually before shipping.

### Step 1: Ensure a changeset (when the change affects the published package)

A fix/feature/breaking change to `@zenuml/core` needs a changeset so it gets a version bump and changelog entry:

```bash
bun run changeset status   # shows pending changesets + the next version
```

If the change is user-facing and there's no changeset, add one (`bun run changeset`, pick patch/minor/major) and commit it on the branch. Changes that don't affect the published package (CI, docs, tests, repo tooling) don't need one — note that and continue.

### Step 2: Validate locally

Invoke `/validate-branch`. If FAIL, stop and show the failure.

### Step 3: Submit as PR

Invoke `/submit-branch`. If FAILED, stop and show what went wrong. On success, note the PR number and URL.

### Step 4: Get CI green

Invoke `/babysit-pr` with the PR number. If it exhausts all 3 retry attempts, stop and report "CI blocked".

### Step 5: Land (merge only)

Merging no longer publishes, so this is safe to automate. To preserve the land-pr skill's merge-strategy logic (which the orchestrator has skipped before), **spawn an Agent**:

```
Spawn an Agent with this prompt:
"Use the Skill tool to invoke the land-pr skill, then follow it to land PR #<PR_NUMBER>
on mermaid-js/zenuml-core. Follow every step including the merge strategy evaluation.
Report back the merge SHA and whether a changeset shipped, or the reason it was blocked."
```

Do NOT run `gh pr merge` directly from the main conversation.

## Rules

- **Each step is a hard boundary.** No step retries a previous step.
- **No auto-rollback.** Stop and report on any failure.
- **Only this skill calls babysit-pr.**
- **Ship stops at merge.** This skill does NOT publish to npm. Publishing is `/release-app` (merge the "chore: version packages" PR). Do not merge the version PR here.

## Output

```
## Ship Report: <branch-name>
- Changeset: <added: patch|minor|major | n/a — no package impact>
- Validation: PASS
- PR: #<number> (<url>)
- CI: GREEN (attempt <N>)
- Merge: <SQUASHED|MERGED> into main (<sha>)
- Release: queued in the "chore: version packages" PR (not yet published)
- Next: /release-app to publish to npm
```

Or on failure:

```
## Ship Report: <branch-name>
- CI: BLOCKED after 3 attempts
- Stopped at: babysit-pr
- Details: <failure summary>
```

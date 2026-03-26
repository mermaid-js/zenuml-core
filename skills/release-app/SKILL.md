---
name: release-app
description: Validate, open, babysit, and merge a zenuml-core PR. Use when the user wants to release app changes from this repo by running `bun run test` and `bun pw`, creating a PR, handing CI babysitting to `babysit-pr`, merging to main when green, and monitoring post-merge GitHub Actions.
---

# Release App

Use this skill in the `zenuml-core` repo when the user wants the full release flow for an app change:

1. run `bun run test`
2. run `bun pw`
3. create a PR
4. invoke `$babysit-pr` on that PR to watch and fix CI until it is green
5. merge the PR to `main`
6. watch the post-merge GitHub Actions on `main` until they finish

This skill targets **mermaid-js/zenuml-core** only. Run all git and GitHub commands from the `zenuml-core` directory.

## Dependency

This skill depends on the repo-local `$babysit-pr` skill in `zenuml-core/skills/babysit-pr` for the CI monitoring and fix loop after the PR is opened.

- If `$babysit-pr` is unavailable, stop after creating the PR and report that the babysitting step could not be delegated.
- Do not silently skip the babysitting step.

## Preconditions

Before starting:

- confirm the repo remote is `mermaid-js/zenuml-core`
- ensure you are on a feature branch, not `main`
- ensure the working tree only contains the intended release changes
- ensure `gh auth status` is healthy before PR work

## Workflow

### Step 1: Validate locally

Run, in order:

```bash
bun run test
bun pw
```

Rules:

- If either command fails, stop and report the failure.
- Do not create or update a PR until both commands pass.

### Step 2: Commit and push

If there are uncommitted changes:

```bash
git status --short
git add <specific files>
git commit -m "<concise release message>"
```

Then push the current branch:

```bash
git push -u origin HEAD
```

Rules:

- Never force-push unless the user explicitly asks.
- Never commit unrelated dirty worktree files.

### Step 3: Create or reuse the PR

First check whether the current branch already has a PR:

```bash
gh pr view --repo mermaid-js/zenuml-core --json number,title,url,state,headRefName,baseRefName
```

If a PR already exists, reuse it.

If not, create one:

```bash
gh pr create --repo mermaid-js/zenuml-core --base main --head <branch> --fill
```

Capture:

- PR number
- PR URL
- branch name

### Step 4: Hand off to babysit-pr

Invoke the repo-local skill:

```text
$babysit-pr #<PR_NUMBER>
```

Do not merge the PR until `$babysit-pr` reports that required checks are green or already passing.

### Step 5: Merge to main

After the PR is green and mergeable, merge it:

```bash
gh pr merge <PR_NUMBER> --repo mermaid-js/zenuml-core --squash --delete-branch
```

If branch protection or merge queue blocks immediate merge, prefer:

```bash
gh pr merge <PR_NUMBER> --repo mermaid-js/zenuml-core --auto --squash --delete-branch
```

Rules:

- do not merge red PRs
- do not bypass protections
- if GitHub reports merge conflicts or a non-mergeable state, stop and report it

### Step 6: Monitor post-merge actions

After merge, watch the latest `push` run on `main`:

```bash
gh run list --repo mermaid-js/zenuml-core --branch main --event push --limit 5 --json databaseId,status,conclusion,workflowName,headSha,createdAt
gh run watch <RUN_ID> --repo mermaid-js/zenuml-core
```

Report the final state of the merged-main run:

- passed
- failed
- cancelled
- timed out / still running

## Summary Format

At the end, report:

```markdown
## Release App Report
- Branch: <branch>
- PR: #<number> <url>
- Local validation: passed | failed
- PR CI: passed | failed
- Merge: merged | auto-merge armed | blocked
- Main actions: passed | failed | still running
```

## Safety

- Never release directly from `main`.
- Never skip `bun run test` or `bun pw`.
- Never merge while PR checks are failing.
- Never skip the post-merge main-run watch.
- If any GitHub command needs user authentication or missing permissions block progress, stop and report the exact blocker.

---
name: commit-and-push
description: Safely stage, commit, and push the current branch in mermaid-js/zenuml-core. Use when the user wants the current work committed and pushed, asks to "commit and push", "create a commit", "push this branch", or wants a clean git handoff after code changes.
---

# Commit And Push

Use this skill in the `zenuml-core` repo when the user wants the current work packaged into a git commit and pushed to `origin`.

This skill is intentionally narrow:

1. inspect the current branch and worktree
2. stage only the intended files
3. create a concise commit
4. push the current branch safely

## Scope

This skill targets **mermaid-js/zenuml-core** only. Run git commands from the `zenuml-core` directory.

## Preconditions

Before staging anything:

- confirm `origin` points at `mermaid-js/zenuml-core`
- confirm the current branch is not `main`
- inspect `git status --short`
- inspect `git diff --stat` and the relevant file diffs when the worktree is not obviously limited to the requested change

If the branch is `main`, stop and tell the user. Create a new branch only if the user explicitly asked for that.

If there are unrelated dirty files, do not stage them. Either stage the intended files explicitly or stop and report that the worktree is mixed.

## Workflow

### Step 1: Inspect the repo state

Run:

```bash
git status --short
git branch --show-current
git remote -v
```

Use `git diff --stat` and targeted diffs when needed to verify what is being committed.

Rules:

- do not guess what should be committed from filenames alone
- if the tree is already clean, report that there is nothing to commit and do not create an empty commit unless the user explicitly asks

### Step 2: Stage only the intended changes

Prefer explicit staging:

```bash
git add <specific files>
```

Rules:

- never use `git add .` or `git add -A` when unrelated changes may exist
- avoid staging generated files unless they are required for the requested change
- review the staged set with `git diff --cached --stat` and, when needed, `git diff --cached`

### Step 3: Create the commit

Commit with a concise message that matches the change:

```bash
git commit -m "<clear message>"
```

Commit message guidance:

- prefer short imperative summaries
- match the repo's existing style when obvious
- mention the user-visible intent, not the mechanics

If `git commit` fails because nothing is staged, stop and report that there is nothing to commit.

### Step 4: Push the branch

Push the current branch to `origin`:

```bash
git push -u origin HEAD
```

If upstream already exists, a plain push is fine:

```bash
git push
```

Rules:

- never force-push unless the user explicitly asks
- do not push `main`
- if the push is rejected, inspect the reason and report it; only rebase, pull, or force-push if the user asked for that behavior

## Output

After completion, report:

```markdown
## Commit And Push Report
- Branch: <branch>
- Commit: <sha> <subject>
- Push: pushed | already up to date | failed
```

If the workflow stops early, explain the blocker precisely:

- clean tree / nothing to commit
- on `main`
- mixed unrelated changes
- push rejected
- authentication or network failure

## Safety

- Never commit unrelated files.
- Never force-push unless explicitly requested.
- Never push directly from `main`.
- Never rewrite the user's history unless explicitly requested.

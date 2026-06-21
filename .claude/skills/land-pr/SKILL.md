---
name: land-pr
description: Merge a green feature PR to main. Merging does NOT publish to npm — this repo uses Changesets, so merging just updates the "chore: version packages" PR. Publishing happens later via /release-app. Use when the user says "merge", "land", "land PR", "merge this", or when a PR has passed CI and is ready to merge. Verifies preconditions, picks a merge strategy, merges, and reports what was queued for release.
---

# Land PR

Merge a green feature PR to `main`. In this repo **merge ≠ release** ([Changesets](https://github.com/changesets/changesets)): merging a PR that carries a `.changeset/*.md` just adds it to the **"chore: version packages"** PR that the Changesets Action maintains. Nothing publishes until that version PR is merged (`/release-app`). Merging is therefore safe to automate.

## Preconditions

Verify ALL before merging:

1. **All CI checks green** — no pending or failed checks
2. **No pending reviews** — no requested changes outstanding
3. **Branch is up to date** — no merge conflicts with main
4. **PR is the right one** — confirm the number with the user if ambiguous

```bash
gh pr view <PR_NUMBER> --json state,mergeable,statusCheckRollup,reviewDecision
```

If any precondition fails, report which one and stop. Do not fix — that's `babysit-pr`'s job.

## Steps

### 1. Verify readiness

Run the precondition checks. If anything is not green, stop and report.

### 2. Decide merge strategy

```bash
git log main..HEAD --oneline
```

**Auto-squash if ANY:** only 1 commit; messages contain noise ("wip", "fixup", "fix lint", duplicates); >half the commits are the same message.

**Merge (preserve commits) if ALL:** 2+ commits with distinct, meaningful messages; each a self-contained step; logical progression.

Announce the decision and why. (When squashing, keep the `.changeset/*.md` file in the result — it must reach main to drive the release.)

### 3. Execute merge

```bash
gh pr merge <PR_NUMBER> --squash --auto   # or --merge --auto
```

`--auto` arms auto-merge; merges immediately if checks are already green.

### 4. Wait for merge

```bash
gh pr view <PR_NUMBER> --json state   # poll until MERGED; 5-min timeout
```

### 5. Report what was queued for release

After merge, the `release` job runs `changesets/action` on `main`. If the PR carried a changeset, the Action opens or updates the **"chore: version packages"** PR (it bumps versions + writes the changelog). It does NOT publish.

```bash
gh run list --repo mermaid-js/zenuml-core --branch main --limit 1 --json status,conclusion
gh pr list --repo mermaid-js/zenuml-core --search "chore: version packages in:title" --json number,title,state
```

If the PR had a changeset, confirm the version PR appeared/updated. If it had none (docs/CI/chore), confirm no version PR change is expected.

## Output

- **LANDED** — merged into main as `<squash|merge>`; release queued in the "chore: version packages" PR (#<n>). Next: `/release-app`.
- **LANDED (no release)** — merged; no changeset, so nothing queued for publish.
- **MERGE BLOCKED** — which precondition failed.

## Does NOT

- Publish to npm (use `/release-app` — merge the version PR)
- Fix CI (use `/babysit-pr`)
- Create PRs (use `/submit-branch`)
- Run local tests (use `/validate-branch`)

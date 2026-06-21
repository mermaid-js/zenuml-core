---
name: land-pr
description: Merge a green PR to main. Merging prepares a DRAFT release (it does NOT publish to npm) — publishing is a separate step via /release-app. Use when the user says "merge", "land", "land PR", "merge this", or when a PR has passed CI and is ready to merge. Verifies preconditions, picks a merge strategy, merges, and confirms the draft release was prepared.
---

# Land PR

Merge a green PR to `main`. In this repo, **merge ≠ release**: merging triggers cd.yml's `draft-release` job, which prepares a draft GitHub Release. No npm publish happens here — that's `/release-app`. Merging is therefore safe to automate.

## Preconditions

Before merging, verify ALL of these:

1. **All CI checks green** — no pending or failed checks
2. **No pending reviews** — no requested changes outstanding
3. **Branch is up to date** — no merge conflicts with main
4. **PR is the right one** — confirm PR number with the user if ambiguous

```bash
gh pr view <PR_NUMBER> --json state,mergeable,statusCheckRollup,reviewDecision
```

If any precondition fails, report which one and stop. Do not attempt to fix — that's `babysit-pr`'s job.

## Steps

### 1. Verify readiness

Run the precondition checks above. If anything is not green, stop and report.

### 2. Decide merge strategy

Inspect the branch's commit history to decide between squash and merge:

```bash
git log main..HEAD --oneline
```

**Auto-squash if ANY of these are true:**
- Only 1 commit on the branch
- Commit messages contain noise patterns: "wip", "fixup", "temp", "oops", "try again", "fix lint", "fix test", duplicate messages
- More than half the commits have the same or very similar messages

**Merge (preserve commits) if ALL of these are true:**
- 2+ commits with distinct, meaningful messages
- Each commit describes a self-contained step (not just iterations on the same change)
- Commits follow a logical progression (e.g., "add X" → "refactor Y" → "delete Z")

Announce the decision and why: "Squashing — 3 of 5 commits are fixups" or "Merging — 8 clean commits with distinct steps".

### 3. Execute merge

```bash
# If squash:
gh pr merge <PR_NUMBER> --squash --auto

# If merge:
gh pr merge <PR_NUMBER> --merge --auto
```

Using `--auto` arms auto-merge so GitHub merges when all checks pass. If checks are already green, it merges immediately.

### 4. Wait for merge

If auto-merge was armed, wait for it:

```bash
gh pr view <PR_NUMBER> --json state
```

Poll until state is `MERGED`. Timeout after 5 minutes — if not merged by then, report and stop.

### 5. Confirm the draft release was prepared

After merge, the `draft-release` job runs on `main`. Watch it and confirm a fresh draft appeared:

```bash
gh run list --repo mermaid-js/zenuml-core --branch main --limit 1 --json databaseId,status,conclusion
# after it completes:
gh release list --repo mermaid-js/zenuml-core --limit 10 --json tagName,isDraft,createdAt
```

There should be exactly one draft release `v<version>`. That version is the next npm release — published later via `/release-app`. If no draft appears, check the `draft-release` job logs.

## Output

Report one of:

- **LANDED** — merged into main as `<squash|merge>`; draft release `v<version>` prepared (not published). Next: `/release-app`.
- **MERGE BLOCKED** — which precondition failed.
- **DRAFT MISSING** — merged, but the draft-release job did not produce a draft (with the job error).

## Does NOT

- Publish to npm (use `/release-app`)
- Fix CI (use `/babysit-pr`)
- Create PRs (use `/submit-branch`)
- Run local tests (use `/validate-branch`)

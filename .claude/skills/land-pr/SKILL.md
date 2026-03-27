---
name: land-pr
description: Merge a green PR and verify the npm release succeeds. Use when the user says "merge", "land", "land PR", "merge this", "ship to npm", "merge and release", or when a PR has passed CI and is ready to merge. This is a high-stakes action — merging to main triggers an automatic npm publish, so this skill verifies everything before and after merge.
---

# Land PR

Merge a green PR to `main` and verify the npm release. In this repo, **merge = release** — every merge to main triggers automatic npm publish via GitHub Actions. Treat this as a production deployment, not a casual merge.

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

### 2. Squash merge

This repo uses squash merges. The merge commit message should summarize the PR.

```bash
gh pr merge <PR_NUMBER> --squash --auto
```

Using `--auto` arms auto-merge so GitHub merges when all checks pass. If checks are already green, it merges immediately.

### 3. Wait for merge

If auto-merge was armed, wait for it:

```bash
gh pr view <PR_NUMBER> --json state
```

Poll until state is `MERGED`. Timeout after 5 minutes — if not merged by then, report and stop.

### 4. Monitor npm publish

After merge, the `Build, Test, npm Publish, and Deploy` workflow runs on `main`. Watch it:

```bash
gh run list --repo mermaid-js/zenuml-core --branch main --limit 1 --json databaseId,status,conclusion
```

Wait for the run to complete:

```bash
gh run watch <RUN_ID> --repo mermaid-js/zenuml-core
```

### 5. Verify npm publish

Check that the new version appeared on npm:

```bash
npm view @zenuml/core version
```

Compare with the version before merge. If it didn't bump, check the `npm-publish` job logs for errors.

## Output

Report one of:

- **LANDED** — merged, published to npm as `@zenuml/core@<version>`
- **MERGE BLOCKED** — which precondition failed
- **PUBLISH FAILED** — merged but npm publish failed, with error details

## On publish failure

**Do NOT auto-rollback.** A failed npm publish after merge is a serious situation that needs human judgment. Report:

1. The merge commit SHA
2. The failing workflow run URL
3. The npm-publish job error output
4. Whether the version was partially published

The user decides whether to hotfix, revert, or investigate.

## Does NOT

- Fix CI (use `/babysit-pr`)
- Create PRs (use `/submit-branch`)
- Run local tests (use `/validate-branch`)

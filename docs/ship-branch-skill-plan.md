# Ship Branch Skills

## Overview

5 skills that compose into a branch-to-production pipeline for `mermaid-js/zenuml-core`.

Merge to main triggers npm publish automatically — every merge is a release.

## Skills

### `/validate-branch`

**Purpose**: Check if the current branch is locally good.

**Standalone use**: "Am I good?" — developer runs this before shipping or just to check.

**Steps**:
1. `bun eslint` — fastest, fail first
2. `bun run test` — unit tests
3. `bun pw` — Playwright E2E (slowest)

**Output**: pass or structured failure report.

**Does NOT**: push, commit, create PRs, fix anything.

### `/submit-branch`

**Purpose**: Publish the current branch as a PR.

**Precondition**: Clean or committable worktree. Fails on mixed/unrelated changes.

**Steps**:
1. Inspect worktree — fail if dirty with unrelated changes
2. Stage and commit scoped changes if needed
3. Push branch
4. Create PR if missing, reuse if exists
5. Return PR number and URL

**Output**: PR created/reused with URL.

**Does NOT**: fix CI, merge, validate locally.

### `/babysit-pr` (existing)

**Purpose**: Get PR CI to green.

**Input**: PR number or current branch PR.

**Steps**:
1. Check CI status
2. Diagnose failures (snapshot mismatch, test failure, lint, build, infra)
3. Apply safe fixes (update snapshots, fix lint, rerun flaky)
4. Push and wait — up to 3 attempts

**Output**: green PR, or concrete failure report after 3 attempts.

**Does NOT**: merge, create PRs, validate locally.

### `/land-pr`

**Purpose**: Merge a green PR and verify the npm release.

**Precondition**: All CI checks green, no pending reviews.

**Steps**:
1. Verify all checks green + mergeable
2. Squash merge (hardcoded for this repo)
3. Watch the post-merge npm-publish GitHub Action
4. Verify new version appears on npm

**Output**: merged + published, or failure report.

**On publish failure**: Alert immediately. Do NOT auto-rollback.

**Does NOT**: fix CI, create PRs, validate locally.

### `/ship-branch` (orchestrator)

**Purpose**: Full happy path from local branch to npm release.

**Flow**:
```
validate-branch → FAIL → stop, report
     ↓ PASS
submit-branch → FAIL → stop, report
     ↓ PR created
babysit-pr → EXHAUSTED → stop, report "CI blocked"
     ↓ GREEN
land-pr → MERGE BLOCKED → stop, report
     ↓ MERGED
land-pr → PUBLISH FAILED → alert, stop
     ↓ PUBLISHED
done ✓
```

**Rules**:
- Each arrow is a hard boundary — no skill reaches back to retry a previous step
- No auto-rollback — stop and report on any failure
- Only `ship-branch` decides when to call `babysit-pr`
- Sub-skills never cross-call each other

## Design Principles

1. **Each skill owns one state transition** — not just commands
2. **Each skill is independently invokable** — developers use them standalone
3. **Stop on failure, report clearly** — no auto-rollback (rollback is more dangerous than stopping)
4. **Merge = release** — `land-pr` treats merge as a production deployment, not a casual action
5. **`babysit-pr` is the only skill that fixes CI** — other skills report failures and stop

## State Machine

```
┌─────────────────┐
│ validate-branch  │──FAIL──→ STOP + report
└────────┬────────┘
         │ PASS
┌────────▼────────┐
│ submit-branch    │──FAIL──→ STOP + report
└────────┬────────┘
         │ PR ready
┌────────▼────────┐
│ babysit-pr       │──EXHAUSTED──→ STOP + "CI blocked"
└────────┬────────┘
         │ GREEN
┌────────▼────────┐
│ land-pr          │──BLOCKED──→ STOP + report
└────────┬────────┘
         │ MERGED
┌────────▼────────┐
│ land-pr (verify) │──PUBLISH FAIL──→ ALERT + STOP
└────────┬────────┘
         │ PUBLISHED
         ✓ done
```

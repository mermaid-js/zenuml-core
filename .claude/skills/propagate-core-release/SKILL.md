---
name: propagate-core-release
description: Propagate a published `@zenuml/core` release to downstream projects by updating each consumer on its own branch and opening or reusing draft PRs. Use when the user says "push core to downstreams", "update downstream projects", "propagate release", "open downstream PRs", "submit downstream drafts", or wants the newly published zenuml/core version rolled out across mermaid, mermaid live editor, web-sequence, the IntelliJ plugin, confluence-plugin-cloud, and diagramly.ai.
---

# Propagate Core Release

Update downstream consumers after `@zenuml/core` has already been published. This skill creates or reuses per-repo update branches and draft PRs, but does not merge anything.

## Scope

This skill is for the post-publish propagation step only.

It should:

1. identify the published `@zenuml/core` version to roll out
2. update each downstream repo to that version
3. create or reuse a branch in each downstream repo
4. push the branch
5. create or reuse a **draft** PR
6. summarize which repos succeeded, failed, or were skipped

It should not:

- publish `@zenuml/core`
- merge downstream PRs
- auto-fix unrelated downstream test failures beyond straightforward dependency-update fallout

## Downstream Repos

Read [references/downstreams.md](references/downstreams.md) before starting. It contains the canonical downstream repo list and repo slug assumptions.

## Preconditions

Before starting:

- confirm the target `@zenuml/core` version is already published
- confirm `gh auth status` is healthy for all target orgs
- confirm you have local checkout strategy for each downstream repo
- if the user did not specify the target version, discover the latest published one first

If the published version is ambiguous, stop and ask.

## Batch Strategy

Treat each downstream repo as an independent unit of work.

- Continue processing the remaining repos if one repo fails.
- Keep a per-repo status ledger as you go: `updated`, `already-updated`, `draft-pr-open`, `blocked`, `failed`.
- Prefer deterministic updates and small diffs.
- Reuse existing update branches or draft PRs when they already target the same core version.

## Branch Naming

Use a consistent branch name across downstream repos:

```text
chore/zenuml-core-v<version>
```

Example:

```text
chore/zenuml-core-v1.2.3
```

## Draft PR Rules

All PRs created by this skill must be draft PRs.

Use a consistent title pattern:

```text
chore: update @zenuml/core to v<version>
```

Use a concise body:

```markdown
## Summary
- update `@zenuml/core` to `v<version>`

## Notes
- automated downstream propagation after core publish
- draft PR for repo-specific verification
```

If a draft PR already exists for the same branch or same target version, reuse it and report it instead of creating a duplicate.

## Workflow

### Step 1: Resolve target version

Determine the `@zenuml/core` version to propagate.

- If the user supplied a version, use it.
- Otherwise, query npm or the release source of truth and resolve the latest published version.

Record:

- target version
- source used to resolve it

### Step 2: Process each downstream repo

For each repo in [references/downstreams.md](references/downstreams.md):

1. Ensure you have a local checkout or clone target.
2. Fetch latest default branch state.
3. Create or reuse `chore/zenuml-core-v<version>`.
4. Update the dependency or bundled artifact according to the repo's conventions.
5. Inspect the diff and keep it scoped to the propagation work.
6. Run lightweight repo-appropriate verification if it is cheap and obvious.
7. Commit with:

   ```text
   chore: update @zenuml/core to v<version>
   ```

8. Push the branch.
9. Create or reuse a **draft** PR.

### Step 3: Handle repo-specific blockers

If a repo fails, capture exactly why:

- dependency location unclear
- package manager / lockfile conflict
- update compiles locally but tests fail
- missing permissions
- repo missing locally and clone failed
- PR creation failed

Do not let one repo failure stop the rest of the batch.

### Step 4: Summarize the rollout

At the end, produce a per-repo summary with:

- repo
- branch
- PR URL or reused PR URL
- final status
- blocker if any

## Repo Update Guidance

Each downstream has specific update and verification commands documented in [references/downstreams.md](references/downstreams.md). Follow the table exactly — do not guess package managers or update commands.

For each repo:

1. Run the **Update Command** from the table
2. Run the **lockfile refresh** (`pnpm install` or `yarn install`) — always commit the updated lockfile
3. Run the **Verify Command** from the table — if it fails, report the failure and move on
4. Commit only the dependency change + lockfile — nothing else

Prefer the smallest change that updates the downstream safely:

- package dependency bumps
- lockfile refreshes
- vendored asset refreshes only when the repo actually vendors core output (e.g., `jetbrains-zenuml`)

Do not opportunistically clean up unrelated code while touching the downstream repo.

If a downstream repo needs custom update logic that is not obvious from the table or its files, stop on that repo and report the ambiguity.

## Safety

- Never merge downstream PRs from this skill.
- Never force-push unless the user explicitly asks.
- Never batch all downstream repos into one branch or one PR.
- Never hide per-repo failures behind a single "batch failed" message.
- Never update unrelated dependencies in the same PR.

## Output

Final report format:

```markdown
## Downstream Propagation Report
- Core version: v<version>
- Overall: <N> succeeded, <N> reused, <N> skipped, <N> failed

### Repo Results
- `<repo>`: draft PR opened | draft PR reused | already updated | failed
  branch: `<branch-name>`
  pr: <url or none>
  notes: <short reason or blocker>
```

---
name: propagate-core-release
description: Propagate a published `@zenuml/core` release by opening or reusing per-repo downstream issues with explicit rollout instructions. Use when the user says "push core to downstreams", "update downstream projects", "propagate release", "open downstream issues", "file rollout issues", or wants the newly published zenuml/core version handed off across mermaid, mermaid live editor, web-sequence, the IntelliJ plugin, confluence-plugin-cloud, and diagramly.ai.
---

# Propagate Core Release

Coordinate downstream consumers after `@zenuml/core` has already been published. This skill creates or reuses per-repo GitHub issues with clear implementation instructions for each downstream team. It does not edit downstream repos or open PRs on their behalf.

## Scope

This skill is for the post-publish propagation step only.

It should:

1. identify the published `@zenuml/core` version to roll out
2. inspect each downstream repo's update conventions from [references/downstreams.md](references/downstreams.md)
3. create or reuse one downstream issue per repo for that version
4. include explicit repo-specific instructions in each issue body
5. summarize which repos succeeded, failed, or were skipped

It should not:

- publish `@zenuml/core`
- update downstream code directly
- create downstream branches or PRs
- auto-fix unrelated downstream test failures or implementation details

Renderer integration rule:

- Only `mermaid-js/mermaid` and `mermaid-js/mermaid-live-editor` should be treated as SVG-renderer integration work for `@zenuml/core` API changes.
- All other downstreams remain HTML-renderer consumers. Do not migrate them to `renderToSvg` or other SVG-renderer APIs during propagation.

## Downstream Repos

Read [references/downstreams.md](references/downstreams.md) before starting. It contains the canonical downstream repo list, repo slug assumptions, and repo-specific update commands that must be copied into the issue instructions.

## Preconditions

Before starting:

- confirm the target `@zenuml/core` version is already published
- confirm `gh auth status` is healthy for all target orgs and repos where issues will be filed
- if the user did not specify the target version, discover the latest published one first

If the published version is ambiguous, stop and ask.

## Batch Strategy

Treat each downstream repo as an independent unit of work.

- Continue processing the remaining repos if one repo fails.
- Keep a per-repo status ledger as you go: `issue-opened`, `issue-reused`, `already-tracked`, `blocked`, `failed`.
- Prefer deterministic, reusable issue text.
- Check for same-version issues before creating anything new.
- Reuse an existing open issue when it already targets the same core version.
- If the same version already has a closed issue, treat it as `already-tracked` and report it instead of opening a duplicate unless the user explicitly asks to reopen or replace it.

## Issue Rules

Each downstream repo should get at most one open issue per core version.

Before creating a new issue, search that repo for issues matching the target version in the title or body. Prefer exact matches on `@zenuml/core v<version>`.

Use a consistent title pattern:

```text
chore: roll out @zenuml/core v<version>
```

Use a clear body with actionable instructions:

```markdown
## Summary
- `@zenuml/core` `v<version>` has been published
- this repo needs to adopt that release

## Required Work
1. Run: `<update-command>`
2. Run: `<lockfile-refresh-command>` and include the lockfile in the PR when applicable
3. Run: `<verify-command>` when applicable
4. Keep the diff scoped to the core upgrade and any required integration fix
5. Open a downstream PR that links back to this issue

## Repo-Specific Notes
- <repo-specific note 1>
- <repo-specific note 2>

## Acceptance Criteria
- repo is updated to `@zenuml/core` `v<version>` or the equivalent vendored build output
- lockfile is refreshed when the repo uses one
- verification command passes locally, or failure details are documented in the PR
- no unrelated dependency or renderer migrations are mixed into the change
```

If an issue already exists for the same target version, do not create a duplicate. Reuse the open one, or report the closed one as already tracked.

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

1. Read the repo row carefully and extract the update command, verification command, and notes.
2. Search for existing issues in that repo for the same core version, checking both open and closed issues.
3. If an open match exists, reuse it and record the URL.
4. If only a closed match exists, record it as `already-tracked` and do not create a duplicate unless the user explicitly asked for that.
5. Otherwise create a new issue using the standard title and a repo-specific body.
6. Make sure the issue body includes:
   - the target core version
   - the exact update command from the table
   - the lockfile refresh command when the repo uses pnpm or yarn
   - the exact verify command when one is defined
   - the renderer and API caveats from the repo notes
   - an explicit instruction to open a PR linked to the issue after the work is complete
   - a version marker that makes future deduplication easy, such as `Core version: v<version>`

### Step 3: Handle repo-specific blockers

If a repo fails, capture exactly why:

- missing issue creation permissions
- existing issue search is ambiguous
- existing closed issue should be reopened but the policy is unclear
- dependency location unclear
- package manager or package filter is unclear
- repo notes are insufficient to write a safe instruction
- issue creation failed

Do not let one repo failure stop the rest of the batch.

### Step 4: Summarize the rollout

At the end, produce a per-repo summary with:

- repo
- issue URL or matched prior issue URL
- final status
- blocker if any

## Repo Issue Guidance

Each downstream has specific update and verification commands documented in [references/downstreams.md](references/downstreams.md). Follow the table exactly when drafting instructions. Do not guess package managers, package filters, or update commands.

For each repo:

1. Include the **Update Command** from the table verbatim
2. Include the lockfile refresh step:
   - `pnpm install` for pnpm repos
   - `yarn install` for yarn repos
3. Include the **Verify Command** from the table verbatim when one exists
4. Tell the downstream team to keep the change scoped to the core upgrade and any required integration fix
5. Tell the downstream team to open a PR after verification and link it back to the issue

Special handling for renderer API changes:

- `mermaid-js/mermaid` is the direct `@zenuml/core` SVG-renderer integration. When core export APIs change, it may require code updates in `packages/mermaid-zenuml`, not just a dependency bump.
- `mermaid-js/mermaid-live-editor` is an indirect SVG-renderer consumer through `@mermaid-js/mermaid-zenuml`. Do not add `@zenuml/core` directly there just to follow a core release.
- `web-sequence`, `confluence-plugin-cloud`, `diagramly.ai`, and similar downstreams stay on the HTML-renderer path unless the user explicitly asks for a renderer migration.

Prefer the smallest downstream task description that updates the repo safely:

- package dependency bumps
- lockfile refreshes
- vendored asset refreshes only when the repo actually vendors core output, such as `jetbrains-zenuml`

Do not ask downstream teams to opportunistically clean up unrelated code while doing the upgrade.

If a downstream repo needs custom update logic that is not obvious from the table or its notes, stop on that repo and report the ambiguity instead of inventing instructions.

## Safety

- Never update downstream repos directly from this skill.
- Never merge downstream PRs from this skill.
- Never batch all downstream repos into one issue.
- Never file duplicate issues for the same repo and core version.
- Never hide per-repo failures behind a single "batch failed" message.
- Never ask downstream teams to update unrelated dependencies in the same PR.

## Output

Final report format:

```markdown
## Downstream Propagation Report
- Core version: `v<version>`
- Overall: <N> succeeded, <N> reused, <N> skipped, <N> failed

### Repo Results
- `<repo>`: issue opened | issue reused | already tracked | failed
  issue: <url or none>
  notes: <short reason or blocker>
```

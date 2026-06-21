---
name: release-app
description: Publish @zenuml/core to npm by merging the Changesets "chore: version packages" PR. That merge runs `changeset publish` (npm publish with provenance), tags the commit, and creates a GitHub Release. Use when the user says "release", "release app", "publish", "publish to npm", "cut a release", "ship to npm", "release-app", or wants to promote merged-but-unreleased changes to a real npm version. This is the publish half of the ship≠release model; merging feature PRs is /ship-branch.
---

# Release App (publish @zenuml/core to npm)

This repo releases via [Changesets](https://github.com/changesets/changesets). The Changesets Action maintains a **"chore: version packages"** PR that accumulates every merged changeset (bumping versions + writing the changelog). **Merging that version PR is the release** — it runs `changeset publish` → `npm publish --provenance`, tags `vX.Y.Z`, and creates a GitHub Release.

```
feature PRs (each with a changeset)  --/ship-branch-->  "chore: version packages" PR
"chore: version packages" PR  --merge (this skill)-->  npm publish + tag + GitHub Release
```

## Steps

### 1. Find the version PR

```bash
gh pr list --repo mermaid-js/zenuml-core --search "chore: version packages in:title" --state open \
  --json number,title,headRefName,url
```

- Exactly one open **"chore: version packages"** PR is expected (branch `changeset-release/main`).
- **None?** There are no pending changesets to release. Confirm with `bun run changeset status`; if empty, ship a change with a changeset first (`/ship-branch`). Do not hand-craft a tag or version.

### 2. Review the bump + changelog

```bash
gh pr view <PR_NUMBER> --repo mermaid-js/zenuml-core --json title,body
gh pr diff <PR_NUMBER> --repo mermaid-js/zenuml-core    # version bump + CHANGELOG entries
```

Confirm the resulting version and that the changelog reads correctly. Tighten changelog wording in the changeset/PR if needed.

### 3. Confirm — merging publishes to npm (irreversible)

State the version that will be published and the headline changes. Get explicit go-ahead unless the user already said "release it". npm publishes cannot be undone (only deprecated).

### 4. Verify the version PR is green, then merge it

```bash
gh pr view <PR_NUMBER> --repo mermaid-js/zenuml-core --json mergeable,statusCheckRollup
gh pr merge <PR_NUMBER> --repo mermaid-js/zenuml-core --squash
```

Merging triggers the `release` job, which runs `changeset publish`.

### 5. Watch the release job

```bash
gh run list --repo mermaid-js/zenuml-core --branch main --workflow cd.yml --limit 1 --json databaseId,status
gh run watch <RUN_ID> --repo mermaid-js/zenuml-core
```

### 6. Verify npm + GitHub Release

```bash
npm view @zenuml/core version          # should equal the published version
gh release view "v<version>" --repo mermaid-js/zenuml-core --json tagName,url
```

If npm didn't update, read the `release` job logs. (Note: `changeset publish` ships any package whose `package.json` version isn't yet on npm — keep `package.json` in sync so only changeset-driven versions publish.)

### 7. Propagate (optional)

Offer `/propagate-core-release` to open downstream rollout issues for the new version.

## Output

```
## Release Report
- Published: @zenuml/core@<version>
- Version PR: #<n> (merged)
- GitHub Release: <url>
- npm: https://www.npmjs.com/package/@zenuml/core/v/<version>
- Propagation: <run /propagate-core-release | skipped>
```

Or:

- **NO VERSION PR** — nothing pending to release; ship a change with a changeset first.
- **PUBLISH FAILED** — version PR merged but `npm publish` failed, with the job error. Do NOT auto-rollback.

## Does NOT

- Merge feature PRs (use `/ship-branch` or `/land-pr`)
- Hand-edit versions or tags (Changesets owns versioning)

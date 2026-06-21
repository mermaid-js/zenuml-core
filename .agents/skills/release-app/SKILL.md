---
name: release-app
description: Release @zenuml/core to npm by publishing the prepared draft GitHub Release. Promoting the draft triggers release.yml, which runs `npm publish --provenance`. Use when the user says "release", "release app", "publish", "publish to npm", "cut a release", "ship to npm", "release-app", or wants to promote a merged-but-unpublished change to a real npm version. This is the publish half of the ship≠release model; merging is /ship-branch.
---

# Release App (publish @zenuml/core to npm)

Publish the next `@zenuml/core` version by promoting the **draft GitHub Release**
that `/ship-branch` (merge → cd.yml `draft-release`) prepared. Publishing the
release triggers `.github/workflows/release.yml`, which sets the version from the
tag and runs `npm publish --provenance`.

```
draft release "v{X}"  --(this skill: publish)-->  release.yml  -->  npm publish {X}
```

## Preconditions

- npm OIDC trusted publishing must be configured for `.github/workflows/release.yml`
  on npmjs.com (see DEPLOYMENT.md). If it still points at `cd.yml`, the publish
  job fails OIDC verification — fix the npm trusted-publisher config first.

## Steps

### 1. Find the fresh draft release

```bash
gh release list --repo mermaid-js/zenuml-core --limit 20 --json tagName,name,isDraft,createdAt \
  | jq -r '.[] | select(.isDraft) | "\(.tagName)\t\(.createdAt)"'
```

- Exactly one draft `v<version>` is expected (the rolling draft kept fresh on every merge).
- **No draft?** Nothing has been merged since the last release, or the
  `draft-release` job failed. Ship something first (`/ship-branch`), or push to
  main to regenerate the draft. Do not hand-create a tag.
- Confirm the draft's target commit is the current `origin/main` HEAD:

```bash
gh release view <tag> --repo mermaid-js/zenuml-core --json targetCommitish,tagName,body
git rev-parse origin/main
```

If the draft is stale (target ≠ current main), a newer merge should have replaced
it — re-run after the latest `draft-release` job finishes.

### 2. Review / refine release notes

Show the draft's auto-generated notes. Tighten the headline changes if useful:

```bash
gh release edit <tag> --repo mermaid-js/zenuml-core --notes "<curated notes>"
```

### 3. Confirm — this is the irreversible npm publish

Publishing to npm cannot be undone (only deprecated). State the version and the
changes, and get explicit go-ahead unless the user already said "release it".

### 4. Publish the release

```bash
gh release edit <tag> --repo mermaid-js/zenuml-core --draft=false --latest
```

This creates the git tag `<tag>` and fires the `release: published` event.

### 5. Watch release.yml

```bash
gh run list --repo mermaid-js/zenuml-core --workflow release.yml --limit 1 --json databaseId,status
gh run watch <RUN_ID> --repo mermaid-js/zenuml-core
```

### 6. Verify npm

```bash
npm view @zenuml/core version
```

Confirm it equals `<version>` (tag without the leading `v`). If it didn't update,
read the `npm-publish` job logs (most likely the OIDC trusted-publisher config —
see Preconditions).

### 7. Propagate (optional)

Offer `/propagate-core-release` to open downstream rollout issues for the new version.

## Output

```
## Release Report
- Published: @zenuml/core@<version>
- Release: <release-url>
- npm: https://www.npmjs.com/package/@zenuml/core/v/<version>
- Propagation: <run /propagate-core-release | skipped>
```

Or:

- **NO DRAFT** — nothing to publish; ship a change first.
- **PUBLISH FAILED** — release published but `npm publish` failed, with the job
  error (commonly the OIDC trusted-publisher filename). Do NOT auto-rollback.

## Does NOT

- Merge PRs (use `/ship-branch` or `/land-pr`)
- Create the draft (that's cd.yml's `draft-release`, on merge to main)

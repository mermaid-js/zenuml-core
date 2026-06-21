# Contributing

## Releasing & versioning (Changesets)

`@zenuml/core` uses [Changesets](https://github.com/changesets/changesets) to
manage versions, changelogs, and npm publishing. Bump levels are declared per
pull request by the author — not inferred from commit messages.

### Adding a changeset to your PR

If your change affects the published package (a fix, feature, or breaking
change), add a changeset:

```bash
bun run changeset
```

This prompts you for the bump level and a summary, then writes a small markdown
file under `.changeset/`. Commit it with your PR. Pick the level using
[semver](https://semver.org/):

- **patch** — bug fixes and internal changes with no API impact
- **minor** — new, backward-compatible features
- **major** — breaking changes to the public API

Changes that don't affect the published package (CI, docs, tests, repo tooling)
don't need a changeset.

### How a release happens

1. PRs are merged to `main`, each carrying its own changeset(s).
2. The Changesets GitHub Action opens (and keeps updating) a **"chore: version
   packages"** PR that bumps `package.json` and writes `CHANGELOG.md` from the
   accumulated changesets.
3. Merging that PR publishes the new version to npm (with provenance via OIDC),
   tags the commit `vX.Y.Z`, and creates a GitHub Release.

So a release is two merges: your feature PR, then the version PR. Nothing
publishes until the version PR is merged, which lets several changes be batched
into a single release.

### Useful commands

- `bun run changeset` — add a changeset
- `bun run changeset status` — see pending changesets and the next version
- `bun run changeset:version` — apply changesets locally (normally done by CI)

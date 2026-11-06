# Downstream Repos

Canonical downstream targets for filing rollout issues after a published `@zenuml/core` release.

## Repo Table

| Repo | Local Path | Pkg Manager | Update Command | Verify Command | Notes |
|------|-----------|-------------|----------------|----------------|-------|
| `mermaid-js/mermaid` | `~/workspaces/zenuml/native-svg-renderer/mermaid` | pnpm | `pnpm --filter @mermaid-js/mermaid-zenuml update @zenuml/core` | `pnpm build` | Direct SVG-renderer integration. Only touch `packages/mermaid-zenuml`; export API changes may require source edits in addition to the version bump. |
| `mermaid-js/mermaid-live-editor` | clone if missing | pnpm | `pnpm update @mermaid-js/mermaid-zenuml` | `pnpm build` | Indirect SVG-renderer consumer via `@mermaid-js/mermaid-zenuml`. Do not add `@zenuml/core` directly here. |
| `ZenUml/web-sequence` | `~/workspaces/zenuml/web-sequence` | yarn | `yarn upgrade @zenuml/core` | `yarn build` | HTML-renderer consumer. Do not migrate to SVG-renderer APIs during routine propagation. |
| `ZenUml/conf-app` | `~/workspaces/zenuml/conf-app` | pnpm | `pnpm update @zenuml/core` | `pnpm build:full && pnpm test:unit` | The live Confluence app (replaced the archived `ZenUml/confluence-plugin-cloud`). HTML-renderer consumer via `src/components/Sequence.vue`; do not migrate to SVG-renderer APIs during routine propagation. Ask for a check in a real Confluence page (staging): Confluence pages can set a Content-Security-Policy. |
| `ZenUml/diagramly.ai` | `~/workspaces/diagramly/diagramly.ai` | pnpm | `pnpm update @zenuml/core --filter <pkg>` | `pnpm build` | HTML-renderer consumer. Do not migrate to SVG-renderer APIs during routine propagation. |
| `ZenUml/codemirror-extensions` | `~/workspaces/zenuml/codemirror-extensions` | pnpm | `pnpm update @zenuml/core` | `pnpm build` | CodeMirror language extensions for ZenUML DSL. HTML-renderer consumer. |
| `ZenUml/jetbrains-zenuml` | `~/workspaces/zenuml/jetbrains-zenuml` | — | See notes | — | **Not an npm consumer.** Vendors a built JS bundle. Update by copying the new `dist/` output from core's build. Skip if unsure and report. |

## Issue Authoring Guidance

When writing a downstream issue for an npm consumer, explicitly include the lockfile refresh step:

- **pnpm**: `pnpm install` (updates `pnpm-lock.yaml`)
- **yarn**: `yarn install` (updates `yarn.lock`)

Tell the downstream team to include the updated lockfile in the PR. A PR without an updated lockfile will usually fail CI.

## Local Checkout Usage

Local checkouts are optional for this skill. Use them only if you need extra context to clarify the issue body safely. Do not clone repos just to file the issue.

If you do need a checkout and the local path does not exist:

```bash
gh repo clone <repo-slug> <local-path>
```

## General Rules

- Each repo gets its own rollout issue.
- Reuse an existing open issue when it already targets the same core version.
- `mermaid-js/mermaid` and `mermaid-js/mermaid-live-editor` are under the `mermaid-js` GitHub org (not `ZenUml`).
- **Crossing a major version:** before using an Update Command, read the repo's current `@zenuml/core` range from its `package.json`. If the range is below the target's major version (for example `^3.x` while releasing `4.x`), a plain `update` stays on the old major. Append the target to the package name (`@zenuml/core@^<version>`, or `yarn upgrade @zenuml/core@^<version>`), and point the issue to the CHANGELOG entries of the new major version for breaking changes.
- **Archived repos:** if issue creation fails because a repo is archived, report it and check whether a successor repo replaced it; update this table instead of filing elsewhere silently.
- Only `mermaid-js/mermaid` and `mermaid-js/mermaid-live-editor` should receive SVG-renderer integration changes tied to core API/export changes.
- Treat all other downstreams as HTML-renderer consumers unless the user explicitly asks for a renderer migration.

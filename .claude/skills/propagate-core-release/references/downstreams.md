# Downstream Repos

Canonical downstream targets for propagating a published `@zenuml/core` release.

## Repo Table

| Repo | Local Path | Pkg Manager | Update Command | Verify Command | Notes |
|------|-----------|-------------|----------------|----------------|-------|
| `mermaid-js/mermaid` | `~/workspaces/zenuml/native-svg-renderer/mermaid` | pnpm | `pnpm --filter @mermaid-js/mermaid-zenuml update @zenuml/core` | `pnpm build` | Direct SVG-renderer integration. Only touch `packages/mermaid-zenuml`; export API changes may require source edits in addition to the version bump. |
| `mermaid-js/mermaid-live-editor` | clone if missing | pnpm | `pnpm update @mermaid-js/mermaid-zenuml` | `pnpm build` | Indirect SVG-renderer consumer via `@mermaid-js/mermaid-zenuml`. Do not add `@zenuml/core` directly here. |
| `ZenUml/web-sequence` | `~/workspaces/zenuml/web-sequence` | yarn | `yarn upgrade @zenuml/core` | `yarn build` | HTML-renderer consumer. Do not migrate to SVG-renderer APIs during routine propagation. |
| `ZenUml/confluence-plugin-cloud` | `~/workspaces/zenuml/confluence-plugin-cloud` | pnpm | `pnpm update @zenuml/core` | `pnpm build:full` | HTML-renderer consumer. Do not migrate to SVG-renderer APIs during routine propagation. |
| `ZenUml/diagramly.ai` | `~/workspaces/diagramly/diagramly.ai` | pnpm | `pnpm update @zenuml/core --filter <pkg>` | `pnpm build` | HTML-renderer consumer. Do not migrate to SVG-renderer APIs during routine propagation. |
| `ZenUml/codemirror-extensions` | `~/workspaces/zenuml/codemirror-extensions` | pnpm | `pnpm update @zenuml/core` | `pnpm build` | CodeMirror language extensions for ZenUML DSL. HTML-renderer consumer. |
| `ZenUml/jetbrains-zenuml` | `~/workspaces/zenuml/jetbrains-zenuml` | — | See notes | — | **Not an npm consumer.** Vendors a built JS bundle. Update by copying the new `dist/` output from core's build. Skip if unsure and report. |

## Lockfile Handling

After every dependency update, regenerate the lockfile:

- **pnpm**: `pnpm install` (updates `pnpm-lock.yaml`)
- **yarn**: `yarn install` (updates `yarn.lock`)

Always commit the lockfile alongside the `package.json` change. A PR without an updated lockfile will fail CI.

## Clone Strategy

If a local path does not exist:

```bash
gh repo clone <repo-slug> <local-path>
```

Then proceed with fetch + branch creation as usual.

## General Rules

- Each repo gets its own update branch and its own draft PR.
- Reuse existing propagation branches or draft PRs when they already target the same core version.
- `mermaid-js/mermaid` and `mermaid-js/mermaid-live-editor` are under the `mermaid-js` GitHub org (not `ZenUml`).
- Only `mermaid-js/mermaid` and `mermaid-js/mermaid-live-editor` should receive SVG-renderer integration changes tied to core API/export changes.
- Treat all other downstreams as HTML-renderer consumers unless the user explicitly asks for a renderer migration.

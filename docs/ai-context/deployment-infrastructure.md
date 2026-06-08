# Deployment & Infrastructure

## CI/CD Pipeline

CI/CD runs on GitHub Actions. Workflows are in `.github/workflows/`.

### On push to `main`

```
test → npm publish (@zenuml/core)
     → Playwright E2E tests
     → build site → deploy to GitHub Pages
```

### npm publish

The library is published as `@zenuml/core`. Publishing happens automatically on merge to `main` when tests pass.

### GitHub Pages

The demo site (`bun build:site`) is deployed to the `gh-pages` branch automatically.

## Cloudflare Pages

For preview deployments and staging, Cloudflare Pages is used. See `DEPLOYMENT.md` for setup steps.

### Local tunnel (collaborators only)

To expose a local dev server:

1. Start dev server: `bun dev` (port 14000)
2. Use a Cloudflare tunnel subdomain (e.g., `air.zenuml.com`) assigned by the team
3. Run the tunnel command provided — traffic proxies to `localhost:14000`

Ngrok is an alternative for personal use (no custom domain).

## Docker

A `Dockerfile` is included for containerized development:

```bash
docker build -t zenuml-core .
docker run -p 8080:8080 zenuml-core
# → http://localhost:8080
```

## Build Artifacts

| Artifact | Command | Output path |
|---|---|---|
| ESM library | `bun build` | `dist/zenuml.esm.mjs` |
| UMD library | `bun build` | `dist/zenuml.js` |
| CSS bundle | `bun build` | `dist/style.css` |
| Demo site | `bun build:site` | `dist/` (HTML + assets) |

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_WIDTH_PROVIDER` | Set to `canvas` to use canvas-based text measurement instead of DOM |

## Monitoring

No dedicated observability tooling is configured in this repo. Errors surface through the browser console and parser's `SeqErrorListener`.

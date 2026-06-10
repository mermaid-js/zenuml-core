# ZenUML Web Renderer Deployment

This document describes how the ZenUML demo site / web renderer is deployed to
**Cloudflare Workers** (using Workers Static Assets, not Cloudflare Pages).

## Deployment Strategy

- **Production**: pushes to `main` deploy the `zenuml-web-renderer` worker
- **Staging**: pushes to any other branch deploy the `zenuml-web-renderer-staging` worker

Both environments are defined in `wrangler.toml` and serve the static `dist/`
output produced by `bun run build:site`.

## GitHub Actions Workflow

Deployment is automated in `.github/workflows/cd.yml` (job `deploy-to-cloudflare`):

1. **Triggers**: every push and pull request (except docs/markdown-only changes)
2. **Gates**: the deploy job runs only after the unit tests (`test`) and the
   Playwright suite (`e2e`, via `.github/workflows/e2e.yml`) pass
3. **Build**: `bun install` then `bun run build:site`
4. **Deploy**: `cloudflare/wrangler-action` runs `wrangler deploy --env production`
   on `main`, or `wrangler deploy --env staging` on other branches
5. On pull requests, a comment with the staging URL is posted to the PR

## Required Configuration

These GitHub Actions **variables** (Settings → Secrets and variables → Actions → Variables)
must be set on the repository:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers permissions
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID

## Manual Deployment

```bash
# Local dev against the worker
bun run worker:dev

# Deploy to staging
bun run worker:deploy:staging

# Deploy to production
bun run worker:deploy
```

## Project Structure

- `index.html`, `embed.html`, `renderer.html`: site entry points (see `vite.config.ts`)
- `dist/`: build output directory (created by `bun run build:site`)
- `wrangler.toml`: Cloudflare Workers configuration (production + staging envs)

## URLs

- **Production**: `https://zenuml-web-renderer.<account-subdomain>.workers.dev`
- **Staging**: `https://zenuml-web-renderer-staging.<account-subdomain>.workers.dev`

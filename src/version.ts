/**
 * The package version, injected at build time. `package.json` holds the real
 * version: Changesets bumps it in the "version packages" PR, and the release
 * workflow publishes that commit and tags it. The Vite `define` for
 * `process.env.VITE_VERSION` (see `vite.shared.ts`) copies it in; builds that
 * do not define it (CLI, parser, LSP) get "".
 */
export const VERSION = process.env.VITE_VERSION || "";

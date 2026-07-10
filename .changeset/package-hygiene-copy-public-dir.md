---
"@zenuml/core": patch
---

Stop publishing demo-site assets in the npm package. The library build was copying `public/` (vendored codemirror/highlightjs/tailwind, demo HTML, `CNAME.txt`, `favicon.ico`, and a proprietary `MS Sans Serif.ttf`) into `dist/`. Set `copyPublicDir: false` on `vite.config.lib.ts` to match the cli/parser/lsp build configs; the demo site build (`vite.config.ts`) is unaffected and still ships its public assets.

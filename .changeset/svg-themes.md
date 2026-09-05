---
"@zenuml/core": minor
---

Make `renderToSvg`'s `theme` option work. It was accepted, typed and plumbed through the CLI's `-t` flag, but discarded — every SVG rendered with one hard-coded palette.

`renderToSvg` now builds its `<style>` block from a palette table (`src/svg/themes.ts`) transcribed from the theme classes in `src/assets/tailwind.css`, so the SVG output matches what the DOM renderer draws for the same theme. Supported names widen from `theme-default | theme-mermaid` to also include `theme-clean-light`, `theme-clean-dark` and `theme-neon` — the themes the in-app theme selector offers. An unknown or omitted name resolves to `theme-default`.

`theme-default` output is byte-identical to the previous hard-coded block, pinned by a test, so existing SVG snapshots do not move. `theme-mermaid` intentionally shares that palette: the two CSS classes differ only in footer visibility, which the SVG output does not draw. A theme changes colours only — participant positions, diagram size and viewBox are unaffected.

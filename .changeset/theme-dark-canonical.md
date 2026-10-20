---
"@zenuml/core": minor
---

Add `theme-dark`, the one dark theme, derived from the measured `theme-default` and the dark surfaces of Atlassian, GitHub and VS Code, and verified against APCA floors (text Lc 75, 12px text 90, lines 45, fills 30) by a contrast audit that now gates CI (`scripts/audit-theme-contrast.mjs`, ADR 0004).

`theme-clean-dark` and `theme-darcula` are now aliases of `theme-dark` in both the DOM and SVG renderers; the names stay until a later major release. The unused `src/themes/theme-dark.css` (whose `:root` variables leaked into host pages) is removed. `renderToSvg` accepts `theme-dark` and `theme-darcula`; the SVG palettes for `theme-clean-light`, `theme-neon` and `theme-mermaid` now carry the values the DOM renderer actually resolves (title, lifeline, fragment border/separator, comment and arrow colours), checked by a parity test. `getPng()` fills the area beside the diagram with the theme's canvas colour instead of white.

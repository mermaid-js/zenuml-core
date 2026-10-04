---
"@zenuml/core": minor
---

Render diagrams in IBM Plex Sans. The typeface is bundled with the library and embedded in exported SVGs, so `I`, `l` and `1` are distinct in code-like labels and the layout no longer depends on the fonts installed on the reader's machine. Callers of `renderToSvg` in a browser should `await ensureDiagramFontsLoaded()` first; `ZenUml.render` does this itself.

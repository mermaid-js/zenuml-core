---
"@zenuml/core": minor
---

Let consumers supply diagram font URLs, for pages whose Content-Security-Policy refuses `data:` fonts (issue #460).

- New `setDiagramFontUrl(url, family?)` (also `ZenUml.setDiagramFontUrl`): load IBM Plex Sans from a URL instead of the embedded `data:` URI. Changing the URL retries the load; `null` restores the default.
- The package now ships `@zenuml/core/fonts/IBMPlexSans-Regular-Latin1.woff2` (byte-identical to the embedded font) and its SIL OFL licence.
- New `getDiagramFontFaceCss()`: the embedded `@font-face` rule, for html-to-image's `fontEmbedCSS` when rasterising the DOM.
- If the embedded font is refused and the host page registers an "IBM Plex Sans" face itself later, cached text widths are dropped so the next render re-measures with it.
- theme-neon's MS Sans Serif no longer points at `/fonts/MS Sans Serif.ttf`, which does not exist in consumer apps. The file ships as `@zenuml/core/fonts/MS-Sans-Serif.ttf` (CC BY-SA 3.0 notice included) and loads after `setDiagramFontUrl(url, "MS Sans Serif")`.
- `ensureDiagramFontsLoaded` is now declared in the published types.

---
"@zenuml/core": patch
---

Render diagrams when the page blocks the embedded font. On a page whose Content-Security-Policy does not allow `data:` fonts, 4.4.0 rejected `render()` and drew nothing. The font loader now carries on with the fallback fonts (Helvetica, Verdana), and `ensureDiagramFontsLoaded()` never rejects.

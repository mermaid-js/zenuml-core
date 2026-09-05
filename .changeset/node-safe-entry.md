---
"@zenuml/core": patch
---

Make `import "@zenuml/core"` work outside a browser.

Importing the package entry threw `ReferenceError: location is not defined` in Node, so the typed `renderToSvg` export it advertises was unreachable server-side. Two module-scope reads ran while the module was still being evaluated: the localStorage-backed atoms built their keys from `location.hostname` and read storage eagerly, and a participant component computed a debug flag from `localStorage` at import time.

Both are now read on first use, and every read is guarded, so the entry also imports in a browser configured to block site data. Verified by importing the built `dist/zenuml.esm.mjs` in plain Node and rendering a diagram through `renderToSvg`.

No API change. The bundled CLI was unaffected, since it imports internal paths rather than the entry.

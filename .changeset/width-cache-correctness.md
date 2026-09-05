---
"@zenuml/core": patch
---

Stop the width cache from freezing a wrong measurement for the life of the process.

`WidthProviderOnCanvas` and `measureTextWithFont` fall back to a character-count estimate when no canvas context is available, and both wrote that estimate to the persistent cache tier — the tier that deliberately survives the `clearCache()` call made before every render. A consumer that measured anything before installing a canvas (the CLI installs one at startup, an embedder may not) kept the estimate forever, with no way to invalidate it. The estimate is now cached for the current render only.

Two related fixes: the canvas cache key now includes the font spec, so a future change to the measured font cannot return a width measured at the old one; and `setCanvasContext()` now invalidates cached widths when the context actually changes, since widths measured with a different backend are not comparable and the backend is not part of any key.

Adds `clearPersistentCache()` alongside `clearCache()` and documents which tier each one drops.

---
"@zenuml/core": patch
---

A diagram rendered without a theme now uses the default theme. Before, the first `render(code, {})` on a new instance switched the diagram to a theme named "default", which no stylesheet defines, so it lost the default theme's colours. The theme `"theme-default"` is now the only fallback.

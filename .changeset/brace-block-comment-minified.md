---
"@zenuml/core": patch
---

Fix `getComment()` on a brace block in the published bundles. It read the comment before the opening brace, not the closing brace, because the check compared a class name that the bundles minify. Rendered diagrams do not change: only code that walks the parse tree from `@zenuml/core/parser` and calls `getComment()` on a brace block sees the difference.

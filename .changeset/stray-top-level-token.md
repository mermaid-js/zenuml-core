---
"@zenuml/core": patch
---

Keep the statements after a stray top-level token. A token the parser cannot place at the top level, such as an extra closing brace or the first character of a comment being typed, no longer drops the rest of the diagram. An unclosed `@Starter(` no longer blanks the diagram. `parse()` and `validate()` still report these tokens as errors.

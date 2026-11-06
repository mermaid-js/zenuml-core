---
"@zenuml/core": patch
---

The Langium parser, which powers editor autocomplete, now keeps the statements after a stray top-level token such as `/`, `=`, `else` or an extra `}` or `)`.

---
"@zenuml/core": patch
---

Statements, fragment sections and header participants and groups now keep their React identity while the text around them changes (ADR 0009, gate G7). Inserting a statement in the middle no longer re-renders the statements after it into their neighbours' DOM nodes. Rendering is unchanged.

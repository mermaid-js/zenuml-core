---
"@zenuml/core": patch
---

Fix three DSL-corruption bugs in the style-toggle panel (bold/italic/underline/strikethrough).

The style toggle was inline string surgery in a React event handler with no
unit or E2E coverage. Extracted to `toggleMessageStyle`/`parseStyleComment`
in `src/utils/messageStyleToggle.ts`, and fixed three defects found while
extracting it:

- Toggling a style on an un-indented existing comment duplicated the `//`
  marker (`// [italic] // note` instead of `// [italic] note`) — a falsy-zero
  bug in an `index || fallback` expression treated a match at index 0 as no
  match.
- Toggling off the last style left a dangling `// []` annotation instead of
  either removing the line (no note) or keeping the note as a plain comment.
- A comment with an unclosed `[` (`// [todo unclosed`) was misread as a
  style list, because `indexOf`'s `-1` "not found" result is truthy.

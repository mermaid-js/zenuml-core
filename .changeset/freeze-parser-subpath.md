---
"@zenuml/core": minor
---

Narrow the `@zenuml/core/parser` subpath to its documented public surface: `validate()` and `parse()` only. The built bundle previously also exported `RootContext`, `ProgContext`, `GroupContext`, `ParticipantContext`, `Participants`, `Depth`, and a default object — none of which were declared in `types/parser/index.d.ts`, so no typed consumer could reference them. These ANTLR-internal helpers are now kept in-repo (`src/parser/index.js`) and no longer leak into the package contract; the subpath entry is a thin `src/parser/public.ts`.

Also corrected the subpath's type docs, which claimed it "does not touch any shared module state" — importing it applies ZenUML's ANTLR prototype augmentation to the shared `antlr4` package as a one-time, import-time side effect. This is now documented honestly.

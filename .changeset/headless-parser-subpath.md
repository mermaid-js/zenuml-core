---
"@zenuml/core": minor
---

Add a headless `@zenuml/core/parser` subpath exporting reentrant `validate(code)` and `parse(code)`.

Unlike the default entry (a browser/DOM bundle that throws `location is not defined` in Node), this subpath imports cleanly server-side and is reentrant — each call uses its own error listener instead of the shared module-level `Errors`/`ErrorDetails`, so it is safe to call repeatedly or concurrently. `validate` returns `{ pass, errorDetails }`; `parse` additionally returns the error-recovered `rootContext` tree.

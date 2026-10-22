---
"@zenuml/core": minor
---

Comments now render their markdown as React elements instead of injecting sanitised HTML. Raw HTML in a comment (for example a `<b>` tag) shows as plain text instead of being interpreted, links keep only `http`, `https` and `mailto` targets, and the `dompurify` dependency is gone. Paragraphs, line breaks, inline code, REST endpoint code spans, fenced code blocks with syntax highlighting, bold and italic render as before.

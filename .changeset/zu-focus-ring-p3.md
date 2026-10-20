---
"@zenuml/core": patch
---

Every control in the editing chrome now shows one focus ring: a 1 px page-colour gap, a 1 px slate ring and a soft glow, on keyboard focus only. It replaces the mixed sky and slate rings and the browser default outline, and the inline name and title editor uses the same ring. Hosts can set `data-reduce-motion="true"` on an ancestor of the diagram (for example `<html>`, `<body>` or the host container) to zero the chrome durations, the same as `prefers-reduced-motion: reduce`. On the `.zenuml` root alone it reaches only the controls inside the diagram, because the popovers render in their own portal roots.

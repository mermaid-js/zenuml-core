---
"@zenuml/core": patch
---

Lifelines no longer use the participant name as their HTML id, so a diagram no longer contains repeated ids or ids that clash with the host page. Names with spaces or leading digits no longer produce invalid ids. To select a lifeline, use the `data-lifeline-id` attribute, for example `[data-lifeline-id="Order Service"]`.

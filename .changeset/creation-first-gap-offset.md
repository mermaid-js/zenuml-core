---
"@zenuml/core": patch
---

Fix created participants in the HTML renderer when message or divider insertion is enabled: the «create» arrow now meets the created participant's box at its vertical centre, and the activation bar starts at the box bottom instead of floating 12px below it. Regression since 4.6.1.

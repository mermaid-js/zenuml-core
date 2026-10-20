---
"@zenuml/core": patch
---

Participant editor: the name row now stays inside the viewport for the first participant (its width was measured before the row had layout, so the clamp used 0 and the row hung off the left edge), and clicking another participant switches the editor in place instead of closing it on the press and reopening it on the click, which flashed the mask and the row.

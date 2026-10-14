---
"@zenuml/core": patch
---

While the participant editor is open, or while a message is being created or reordered by drag, other diagram controls no longer react. Gap handles, the divider menu, occurrence create-drag, message reorder handles and fragment/occurrence collapse buttons stay inactive; a press on them only closes the participant editor. While a label is in edit mode, a press on a collapse button now only ends the edit; press again to collapse. Collapse keeps working in static (mermaid) rendering.

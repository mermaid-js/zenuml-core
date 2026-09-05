---
"@zenuml/core": patch
---

Gate drag-to-reorder behind `enableMessageReorder` and `RenderMode.Dynamic`.

Drag-to-reorder was the one editing surface in the rendering core with no
opt-out: no `enable*` flag like every other editing feature, and no check
against `RenderMode.Static`. A render-only host (SVG export, a static embed)
could have its diagram silently rewritten by an accidental drag.

Added `enableMessageReorder` (default `false`, matching every other editing
flag) and gated the drag handlers on `mode === RenderMode.Dynamic` as well.
The demo site and E2E fixtures now opt in explicitly, matching how they
already opt into participant/message/divider insertion and style editing.

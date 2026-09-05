---
"@zenuml/core": patch
---

Fix `render()` never resolving when a diagram has no participants.

The wait for the diagram to finish mounting resolved on a change notification from `renderingReadyAtom`, and that atom is `lifelinesReported === participantCount`. Rendering a document with no participants — a comment-only file, or DSL that parses to nothing — leaves it `true` for the whole wait, so no change is ever emitted and the returned promise stays pending forever. Reproducible by rendering two such documents in a row: an editor showing a diagram, then a comment, then another comment.

The wait now checks readiness once after starting the render instead of relying only on notifications.

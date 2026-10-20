---
"@zenuml/core": patch
---

Editor chrome tokens (P1 of ADR 0003): the `--zu-*` design tokens are declared once on `.zenuml`, and the participant style panel, type and colour pickers, message style panel and gap menu take their corner radii, shadows and control heights from them. Panel corners and shadows change slightly; diagram rendering is unchanged. A new `bun run check:tokens` gate keeps every token sourced and keeps one-off radius and shadow values out of the chrome files.

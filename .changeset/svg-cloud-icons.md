---
"@zenuml/core": minor
---

Draw cloud participant icons (e.g. `@VPC`, `@RDS`, and the other icons the HTML renderer shows) in `renderToSvg()`. It used to draw only 11 built-in icons and left other participants without an icon. Add `ensureDiagramIconsLoaded(code)`: await it before `renderToSvg(code)` to load the icons the diagram uses (the CLI does this itself).

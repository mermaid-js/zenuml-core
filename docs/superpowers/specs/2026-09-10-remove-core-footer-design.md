# Remove Core Footer Design

## Goal

Make `@zenuml/core` render diagrams without an embedded footer toolbar while
preserving the rendering capabilities that host applications need.

## Decisions

- Remove the complete footer UI: Tips, theme selection, numbering toggle,
  zoom controls, percentage display, and the `ZenUML.com` link.
- Remove the Tips entry point and the now-unreachable Tips UI from the frame.
- Keep theme rendering, the `theme` render option, and `setTheme()`.
- Keep `zoomIn()` and `zoomOut()` for compatibility. Hosts should implement
  viewport-level zoom outside the diagram frame.
- Keep message numbering enabled by default.
- Add `enableNumbering?: boolean` to the public render configuration so hosts
  can explicitly hide numbering. An explicit value overrides persisted state;
  omission preserves the current default/persisted behavior.
- Do not add DSL syntax in this change.
- Host products own help UI, viewport controls, and attribution/growth links.

## Compatibility

Existing diagrams continue to show numbering by default. Existing theme and
imperative zoom APIs remain available. The only intentional visual removal is
the embedded footer and its controls.

## Verification

Automated tests must prove that the DOM renderer has no footer and that
`enableNumbering: false` hides message numbers without changing the default.
Run unit tests, type checking, and a browser check of the DOM preview.

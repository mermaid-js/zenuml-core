# Document surface and semantic colours

The document owns its canvas, frame and diagram colours. A host can use the resolved canvas base to paint the space around the document without copying a theme constant.

```ts
import ZenUml, { renderToSvg } from "@zenuml/core";

const palette = {
  canvasBg: "#343f4b",
  frameBg: "#424f5e",
  frameBorder: "#516071",
  titleText: "#eef2f6",
  participantBg: "#343f4b",
  participantText: "#eef2f6",
  messageArrow: "#b8c3cf",
  messageText: "#eef2f6",
  lifeline: "#b8c3cf",
  occurrenceBg: "#424f5e",
  fragmentHeaderBg: "#424f5e",
  fragmentHeaderText: "#eef2f6",
  commentText: "#b8c3cf",
  dividerBg: "#424f5e",
  dividerText: "#eef2f6",
};

const diagram = new ZenUml(element, false, { theme: "theme-dark", palette });
await diagram.render(code, { theme: "theme-dark", palette });
host.style.backgroundColor = diagram.getSurface().backgroundColor;

const vector = renderToSvg(code, { theme: "theme-dark", palette });
host.style.backgroundColor = vector.surface.backgroundColor;
```

The constructor's third argument applies the initial theme and palette before its first visible React commit. The second argument remains the existing `naked` flag. `render()` resolves after the requested tree commits and its lifelines report readiness. When a render is superseded, its promise settles after the latest request commits. A caller can discard old results by comparing its own request identifier before applying `getSurface()` to another UI.

`getSurface()` synchronously reads the current computed canvas colour. Call it again after changing author CSS; no render is required for a CSS-only update. For an authored translucent canvas colour, the method resolves it over the opaque theme or palette backing. Gradients and images remain decorative layers and are not represented by `backgroundColor`. The host should treat this field as the solid base, not a description of all pixels. A light theme under dark host chrome remains an opaque light document.

Palette keys are semantic roles. Omitted keys keep the selected theme's values. An explicitly coloured participant keeps its authored box fill, with black or white label and monochrome icon colour derived from that fill. Brand icon artwork keeps its own colours. Custom CSS can override painted properties; CSS declarations with `!important` can override palette variables set on the canvas and sequence diagram. Passing `palette: undefined` explicitly in a later `render()` clears the previous palette; omitting the property preserves it.

`getPng()` and `getSvg()` export the intrinsic `.bg-skin-canvas` bounds, including its padding ring. Both paint the resolved opaque base across those bounds, including rounded corners and gutters. `renderToSvg()` paints a full-size background rect inside its `viewBox` and returns the same base in `surface`. Rasterising that native SVG uses its defined opaque bounds. Empty native diagrams have zero bounds.

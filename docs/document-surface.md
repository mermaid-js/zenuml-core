# Document surface and semantic colours

Core leaves the outer canvas transparent by default. The host paints the area around the diagram, including the HTML canvas padding and rounded frame corners. The frame remains a painted document panel; participants, activations, fragment masks, notes, text, and icons retain their own theme or authored colours. A dark diagram on a light page is still a dark panel.

```ts
import ZenUml, { renderToSvg } from "@zenuml/core";

host.style.backgroundColor = "#202833";
const palette = {
  frameBg: "#424f5e",
  frameBorder: "#516071",
  participantBg: "#343f4b",
  participantText: "#eef2f6",
  messageArrow: "#b8c3cf",
};

const diagram = new ZenUml(element, false, { theme: "theme-dark", palette });
await diagram.render(code, { theme: "theme-dark", palette });

const portablePng = await diagram.getPng(); // Transparent outside the frame.
const onThisHostPng = await diagram.getPng({ backingColor: "#202833" });
const onThisHostSvg = await diagram.getSvg({ backingColor: "#202833" });
const nativeSvg = renderToSvg(code, {
  theme: "theme-dark",
  palette,
  backingColor: "#202833",
});
```

The optional `backingColor` must be an opaque named, hex, or RGB CSS colour. It is painted once beneath the authored canvas and frame. Omitting it preserves transparency. `getPng()`, `getSvg()`, and `renderToSvg()` follow the same rule; `getSvg()` returns an SVG data URL, while native `renderToSvg()` returns SVG markup. PNG and SVG export bounds remain the diagram's intrinsic bounds, including the HTML canvas padding. JPEG cannot carry alpha; the DiagramFrame JPEG action uses white when no backing is supplied.

The constructor's third argument applies the initial theme and palette before its first visible React commit. The second argument remains the existing `naked` flag. `render()` resolves after the requested tree commits and its lifelines report readiness. Superseded render promises settle after the latest request commits.

`getSurface()` and `renderToSvg().surface` report the **raw outer-canvas paint**, which is `transparent` by default. `getSurface()` reads current computed CSS on every call, so a CSS-only change needs no render. These fields do not report the host background or a flattened export. An author can explicitly paint the outer canvas with `palette.canvasBg` or custom CSS; a translucent authored colour retains its alpha and composites over the host on screen or over an explicit export backing. Gradients and images remain CSS decoration and cannot be described by `backgroundColor` alone.

Palette keys are semantic roles. Omitted keys keep the selected theme's values. An explicitly coloured participant keeps its authored box fill, with black or white label and monochrome icon colour derived from that fill; brand icon artwork keeps its own colours. Custom CSS can override painted properties. Passing `palette: undefined` explicitly in a later `render()` clears the previous palette; omitting the property preserves it.

For iframe embeds, the host must provide its backing to the iframe's page as well as the area outside it, because CSS backgrounds do not inherit across iframe boundaries. The naked mode has no painted frame; its text contrast therefore depends on the host backing and chosen theme or palette.

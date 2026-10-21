# Theme surfaces

Hosts can provide a six-colour palette when rendering a diagram. The host owns the viewport around the diagram; ZenUML owns the colours inside the document. Use the returned canvas colour for the host container or iframe backdrop so the page and diagram meet cleanly.

```ts
const palette = {
  canvas: "#303944",
  content: "#343F4B",
  pocket: "#424F5E",
  border: "#516071",
  text: "#EEF2F6",
  secondaryText: "#B8C3CF",
};

await diagram.render(code, { palette });
const { backgroundColor } = diagram.getCanvasSurface();
hostElement.style.backgroundColor = backgroundColor;
```

`Config.palette` and native `RenderOptions.palette` use the same `DiagramPalette` shape. Each value must be an opaque six-digit hex color in `#RRGGBB` form. The palette roles are `canvas` for the diagram canvas, `content` and `pocket` for filled regions, `border` for the subtle outer frame, and `text` and `secondaryText` for primary and secondary labels and essential strokes. Existing named themes remain available. A custom palette applies to that render; omitting it on a later render restores the current named theme. The theme name itself stays selected when omitted, or pass `theme: "theme-default"` to select the default theme explicitly.

`render()` resolves after the latest requested render has committed. If calls are coalesced, every pending call resolves with that latest committed render; intermediate requests may not render. Await it before reading the canvas surface, including when changing only the palette or rendering an empty diagram. The first mount is also deferred until the first `render()` call, so pass the initial configuration there.

`getCanvasSurface()` returns a synchronous snapshot of the computed canvas colour. Read it again after applying a stylesheet change or when the system theme changes. For an alpha-translucent CSS canvas, the returned `backgroundColor` composites that color over white as an opaque export fallback. The live preview still composites over its actual surroundings, so use an opaque CSS canvas when the host and diagram must meet seamlessly. `getPng()` and `getSvg()` normalize a translucent canvas on an offscreen export copy; they do not change the live diagram. If the host follows a system theme, resolve `matchMedia` to a concrete palette and pass that palette to ZenUML.

Native SVG rendering uses the supplied palette because it cannot read arbitrary CSS from the host document. The native result includes `surface.backgroundColor`; use it for the surrounding host surface as well. This is the effective opaque canvas color: the custom palette color when supplied, otherwise the selected named theme's canvas color, with white as a fallback. `getPng()` and `getSvg()` wait for the active render before exporting. A custom palette colors the renderer-owned diagram surfaces. DSL-authored participant fill colors are preserved, and their label and icon foreground uses the same brightness heuristic as HTML to choose black or white; that heuristic is not a formal contrast guarantee. Icons that carry their own brand colors keep those colors.

Choose custom colors that work for your users and context. ZenUML does not claim a full APCA contrast guarantee for arbitrary palettes. Border is a decorative role and should not carry essential arrow or label meaning.

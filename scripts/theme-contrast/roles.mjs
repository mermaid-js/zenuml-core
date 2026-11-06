// Colour roles of a rendered sequence diagram and the APCA floors each must meet.
//
// A role is a DOM selector plus a measurement kind:
//   text  — foreground text; Lc of the composited `color` against the sampled
//           background. Floor 75, or 90 when the font is 12px or smaller.
//   line  — a 1px rule or stroke; Lc of the composited line colour against the
//           background next to it. Floor 45.
//   fill  — a filled surface; Lc of the rendered fill against the background
//           around it. Floor 30. Fills that only group content (participant box,
//           canvas) are reported but not gated: their edge is carried by a line.
//
// The floors are the acceptance rule for every theme (ADR 0004).

export const FLOORS = Object.freeze({
  text: 75,
  smallText: 90, // font-size <= 12px
  smallTextPx: 12,
  line: 45,
  fill: 30,
});

/**
 * Editor chrome inside the diagram (ADR 0002 affordances): not part of the
 * theme surface, themed later (deferred issue "chrome dark tokens").
 */
export const CHROME_SELECTOR = ".hide-export, .message-reorder-handle, .title .text-gray-400, [data-placeholder]";

/**
 * Text roles are matched against the nearest ancestor of every text node, first
 * match wins. `gate: false` marks roles that are reported only.
 */
export const TEXT_ROLES = [
  { role: "fragment-number", selector: ".fragment:not(.fragment-ref) > .header .fragment-number" },
  { role: "number", selector: ".message-number, .fragment-number" },
  { role: "guard-keyword", selector: ".guard-keyword" },
  { role: "http-method", selector: ".http-method-get, .http-method-post, .http-method-delete" },
  { role: "comment", selector: ".comments" },
  { role: "divider-text", selector: ".divider .name" },
  { role: "fragment-condition", selector: ".guard-row .condition" },
  { role: "fragment-label", selector: ".fragment > .header" },
  { role: "fragment-section", selector: ".segment > .header" },
  { role: "group-title", selector: ".lifeline-group-container .text-skin-lifeline-group-name" },
  { role: "participant", selector: ".participant" },
  { role: "message", selector: ".message .name, .message" },
  { role: "title", selector: ".frame > div > .header" },
  { role: "text-other", selector: "*" },
];

/**
 * Line roles: an element and which of its edges carries the line, or `svg`
 * when the element itself is an SVG stroke. `colorProp` names the computed
 * property that holds the nominal colour.
 */
export const LINE_ROLES = [
  { role: "frame-border", selector: ".frame", edge: "left", colorProp: "border-left-color" },
  { role: "header-rule", selector: ".frame > div > .header", edge: "bottom", colorProp: "border-bottom-color" },
  { role: "participant-border", selector: ".participant", edge: "left", colorProp: "border-left-color" },
  { role: "lifeline", selector: ".lifeline .line", edge: "column", colorProp: "background-image" },
  { role: "message-line", selector: ".message > svg line", edge: "svg", colorProp: "stroke" },
  { role: "arrow-head", selector: ".message > svg path", edge: "svg", colorProp: "stroke" },
  { role: "self-arrow", selector: ".self-invocation svg.arrow polyline, .self-invocation svg.arrow path", edge: "svg", colorProp: "stroke" },
  { role: "occurrence-border", selector: ".occurrence", edge: "left", colorProp: "border-left-color" },
  { role: "fragment-border", selector: ".fragment:not(.fragment-ref)", edge: "left", colorProp: "border-left-color" },
  { role: "fragment-header-rule", selector: ".fragment > .header > .name", edge: "bottom", colorProp: "border-bottom-color" },
  { role: "separator", selector: ".segment.border-t", edge: "top", colorProp: "border-top-color" },
  { role: "group-outline", selector: "[data-group-overlay] rect", edge: "svg", colorProp: "stroke" },
  { role: "divider-line", selector: ".divider .left, .divider .right", edge: "top", colorProp: "border-top-color" },
];

export const FILL_ROLES = [
  { role: "occurrence", selector: ".occurrence", gate: true },
  { role: "fragment-header", selector: ".fragment:not(.fragment-ref) > .header", gate: true },
  { role: "number-badge", selector: ".message-number, .fragment-number", gate: true },
  { role: "divider-box", selector: ".divider .name", gate: true },
  { role: "comment-code", selector: ".comments code", gate: true },
  { role: "participant-fill", selector: ".participant", gate: false },
  { role: "canvas", selector: ".zenuml > div[class*='bg-skin-canvas']", gate: false },
];

/** Floor for one measured item. */
export function floorFor(item) {
  if (item.kind === "text") {
    return item.fontSize <= FLOORS.smallTextPx ? FLOORS.smallText : FLOORS.text;
  }
  if (item.kind === "line") return FLOORS.line;
  return FLOORS.fill;
}

/**
 * The surfaces each role is drawn on. An item whose sampled background is a
 * different diagram surface is an overlap (a short label over an occurrence
 * bar, a lifeline crossing a fragment header): a layout fact that exists in
 * every theme, reported but not gated. A background that is no diagram
 * surface at all (the host page, an author colour) is gated as usual.
 */
export const SURFACE_KEYS = ["frame", "occurrence", "header", "dividerBox"];
export function designedSurfaces(item) {
  if (item.kind === "fill") return ["frame"];
  if (item.kind === "line") {
    if (item.role === "fragment-header-rule") return ["header"];
    // The lifeline runs through occurrence bars by design and a bar's border
    // can sit on another bar; every other rule is drawn on the frame and
    // merely crosses bars.
    if (item.role === "lifeline" || item.role === "occurrence-border") return ["frame", "occurrence"];
    return ["frame"];
  }
  if (item.role === "fragment-label" || item.role === "fragment-number") return ["header"];
  if (item.role === "divider-text") return ["dividerBox"];
  // Generic SVG roles (the SVG renderer and the benchmark): text sits on the
  // frame or in a labelled box, never by design on an occurrence bar.
  if (item.role === "svg-text") return ["frame", "header", "dividerBox"];
  if (item.role === "svg-line" || item.role === "svg-fill") return ["frame", "occurrence", "header", "dividerBox"];
  return ["frame"];
}

/**
 * SVG-specific constants for geometry building.
 * These compensate for differences between HTML CSS layout and native SVG rendering.
 */
import {
  PARTICIPANT_TOP_SPACE_FOR_GROUP as _HTML_PARTICIPANT_TOP,
} from "@/positioning/Constants";

/**
 * SVG-specific participant top offset.
 * The HTML renderer's .life-line-layer has .pt-2 (8px) CSS padding that pushes
 * participants down. SVG has no such padding, so we add 8px to match the effective
 * HTML position and keep messages close to participant boxes.
 */
export const PARTICIPANT_TOP_SPACE = _HTML_PARTICIPANT_TOP + 8;

/**
 * Internal padding inside the HTML participant box that the positioning engine
 * does not account for. The engine's labelWidth is pure text width, but the HTML
 * box adds: 2×2px border + 2×2px padding + 2×4px inner text padding (px-1) = 16px.
 *
 * Assignee participants (e.g. "b:Type") render TWO EditableSpan components
 * in HTML, each with 4px left + 4px right padding (from EditableSpan.css
 * `.editable-span-base { padding: 0 4px }`). The extra span adds 8px.
 */
export const PARTICIPANT_BOX_PADDING = 16;
// HTML assignee participants render "assignee" ":" "label" as separate spans.
// The SVG measures the full "assignee:label" string, which is narrower than the
// sum of the individual HTML spans. Use 14px padding to match HTML's box width.
export const PARTICIPANT_BOX_PADDING_ASSIGNEE = 16;
export const PARTICIPANT_ICON_ROW_WIDTH = 28; // 24px icon + 4px right margin

/** Visual height of participant box, matching HTML renderer's h-10 (40px) */
export const PARTICIPANT_VISUAL_HEIGHT = 40;
/** Max visual width of participant box, matching HTML CSS max-width: 250px (SeqDiagram.css) */
export const PARTICIPANT_MAX_WIDTH = 250;

/**
 * Pass through X coordinate without rounding — sub-pixel precision improves
 * parity with the HTML renderer.
 */
export function snapX(x: number): number {
  return x;
}

/**
 * Convert React CSSProperties to SVG-compatible style record.
 * Maps CSS property names to SVG equivalents (e.g., `color` → `fill` for text).
 * Returns undefined if the style is empty.
 */
export function cssToSvgStyle(css: import("react").CSSProperties): Record<string, string> | undefined {
  const result: Record<string, string> = {};
  let hasKeys = false;
  for (const [key, value] of Object.entries(css)) {
    if (value == null) continue;
    hasKeys = true;
    // SVG text uses `fill` for color, not CSS `color`
    if (key === "color") {
      result["fill"] = String(value);
    } else {
      // Convert camelCase to kebab-case for SVG style attribute
      const svgKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      result[svgKey] = String(value);
    }
  }
  return hasKeys ? result : undefined;
}

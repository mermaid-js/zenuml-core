/**
 * Convert React CSSProperties to SVG-compatible style record.
 * Maps CSS property names to SVG equivalents (e.g., `color` → `fill` for text).
 * Returns undefined if the style is empty.
 *
 * Accepts a generic record type to avoid coupling the SVG layer to React's
 * CSSProperties type — callers can pass any { [key: string]: unknown } object.
 */
export function cssToSvgStyle(css: Record<string, unknown>): Record<string, string> | undefined {
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

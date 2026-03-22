/**
 * Shared SVG serialization utilities.
 * Centralizes XML escaping and style-to-attribute conversion
 * used across all SVG component renderers.
 */

/** Escape a string for safe inclusion in XML/SVG content and attributes. */
export function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert a Record<string, string> style map to an inline SVG style attribute value. */
export function styleToAttr(style: Record<string, string>): string {
  return Object.entries(style)
    .map(([k, v]) => `${escXml(k)}: ${escXml(v)}`)
    .join("; ");
}

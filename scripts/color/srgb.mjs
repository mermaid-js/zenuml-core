// sRGB parsing, formatting and compositing helpers shared by the colour maths.

/**
 * Parse a CSS colour into [r, g, b, a] with r,g,b in 0..255 and a in 0..1.
 * Accepts #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() (comma or space
 * syntax), and an [r, g, b] / [r, g, b, a] array (returned as is).
 */
export function parseColorAlpha(input) {
  if (Array.isArray(input)) {
    return [input[0], input[1], input[2], input.length > 3 ? input[3] : 1];
  }
  const s = String(input).trim().toLowerCase();
  if (s === "transparent") return [0, 0, 0, 0];
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    if (h.length !== 6 && h.length !== 8) throw new Error(`bad hex colour: ${input}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const m = s.match(/^rgba?\(\s*([^)]+)\)$/);
  if (m) {
    const parts = m[1].split(/[\s,\/]+/).filter(Boolean);
    const num = (v) => (v.endsWith("%") ? (parseFloat(v) * 255) / 100 : parseFloat(v));
    const a =
      parts.length > 3
        ? parts[3].endsWith("%")
          ? parseFloat(parts[3]) / 100
          : parseFloat(parts[3])
        : 1;
    return [num(parts[0]), num(parts[1]), num(parts[2]), a];
  }
  throw new Error(`unsupported colour syntax: ${input}`);
}

/** Opaque [r, g, b]; throws if the colour has alpha < 1 (composite it first). */
export function parseColor(input) {
  const [r, g, b, a] = parseColorAlpha(input);
  if (a < 1) throw new Error(`colour is not opaque (alpha ${a}): ${input}`);
  return [r, g, b];
}

/** Source-over compositing in gamma sRGB, the way browsers blend by default. */
export function composite(fg, bg) {
  const [fr, fg_, fb, fa] = parseColorAlpha(fg);
  const [br, bg_, bb, ba] = parseColorAlpha(bg);
  if (ba < 1) throw new Error("background must be opaque");
  return [
    fr * fa + br * (1 - fa),
    fg_ * fa + bg_ * (1 - fa),
    fb * fa + bb * (1 - fa),
  ];
}

export function toHex(rgb) {
  const [r, g, b] = rgb;
  const h = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** sRGB transfer function (IEC 61966-2-1), channel 0..1 to linear 0..1. */
export function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

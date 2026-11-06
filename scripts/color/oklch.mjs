// OKLab / OKLCH conversions (Björn Ottosson, 2020), sRGB in and out.
// https://bottosson.github.io/posts/oklab/

import { linearToSrgb, parseColor, srgbToLinear, toHex } from "./srgb.mjs";

/** sRGB colour -> { L, a, b } (L in 0..1). */
export function srgbToOklab(input) {
  const [r8, g8, b8] = parseColor(input);
  const r = srgbToLinear(r8 / 255);
  const g = srgbToLinear(g8 / 255);
  const b = srgbToLinear(b8 / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** { L, a, b } -> linear RGB (may be out of gamut). */
function oklabToLinearRgb({ L, a, b }) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** { L, a, b } -> "#rrggbb" (clipped to the sRGB gamut). */
export function oklabToHex(lab) {
  const [r, g, b] = oklabToLinearRgb(lab).map((c) =>
    Math.max(0, Math.min(1, linearToSrgb(Math.max(0, Math.min(1, c))))),
  );
  return toHex([r * 255, g * 255, b * 255]);
}

/** True when the OKLab colour converts to sRGB without clipping. */
export function inSrgbGamut(lab, eps = 1e-6) {
  return oklabToLinearRgb(lab).every((c) => c >= -eps && c <= 1 + eps);
}

/** sRGB colour -> { L, C, h } with h in degrees 0..360. */
export function srgbToOklch(input) {
  const { L, a, b } = srgbToOklab(input);
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h: C < 1e-9 ? 0 : h };
}

export function oklchToOklab({ L, C, h }) {
  const rad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

export function oklchToHex(lch) {
  return oklabToHex(oklchToOklab(lch));
}

/** Format for reports: "oklch(62.8% 0.258 29.2)". */
export function formatOklch({ L, C, h }) {
  return `oklch(${(L * 100).toFixed(1)}% ${C.toFixed(3)} ${h.toFixed(1)})`;
}

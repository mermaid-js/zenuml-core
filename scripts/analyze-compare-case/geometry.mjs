/*
 * What this file does:
 * Provides the shared math helpers used across the analyzer.
 *
 * High-level flow:
 * - Normalizes offsets and rounding for stable report output.
 * - Computes rectangle relationships such as union, overlap, and centers.
 * - Centralizes these primitives so extraction, scoring, and residual attribution
 *   all use the same geometry rules.
 *
 * Example input:
 * `unionRect([{ x: 10, y: 20, w: 5, h: 5 }, { x: 14, y: 18, w: 6, h: 10 }])`
 *
 * Example output:
 * `{ x: 10, y: 18, w: 10, h: 12 }`
 */
export function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeOffset(value) {
  const rounded = round(value);
  return Math.abs(rounded) < 0.05 ? 0 : rounded;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function segmentGraphemes(text) {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)).map(
      (part) => ({ grapheme: part.segment, index: part.index }),
    );
  }

  const chars = Array.from(text);
  let offset = 0;
  return chars.map((grapheme) => {
    const part = { grapheme, index: offset };
    offset += grapheme.length;
    return part;
  });
}

export function keyForLabel(label) {
  return `${label.kind}\u0000${label.pairText ?? label.text}\u0000${label.textOrder}`;
}

export function rectRight(rect) {
  return rect.x + rect.w;
}

export function rectBottom(rect) {
  return rect.y + rect.h;
}

export function area(rect) {
  return Math.max(0, rect.w) * Math.max(0, rect.h);
}

export function unionRect(rects) {
  if (!rects || rects.length === 0) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.w));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.h));
  return { x: left, y: top, w: right - left, h: bottom - top };
}

export function arrowEndpointsFromBox(box) {
  return {
    left_x: box.x,
    right_x: box.x + box.w,
    width: box.w,
  };
}

export function intersectionArea(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(rectRight(a), rectRight(b));
  const bottom = Math.min(rectBottom(a), rectBottom(b));
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

export function rectCenter(rect) {
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  };
}

export function iou(a, b) {
  const inter = intersectionArea(a, b);
  const union = area(a) + area(b) - inter;
  return union <= 0 ? 0 : inter / union;
}

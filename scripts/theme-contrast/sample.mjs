// Pixel sampling on a decoded full-page screenshot, and the Lc computation for
// one walked item. Coordinates from the walker are CSS px; the PNG is CSS px
// times the device pixel ratio.

import { apcaContrast, apcaLuminance } from "../color/apca.mjs";
import { composite, parseColorAlpha, toHex } from "../color/srgb.mjs";
import { designedSurfaces } from "./roles.mjs";

/** Which known surface a sampled background is (within 8 per channel), if any. */
function classifyBackground(bgHex, surfaces) {
  if (!surfaces) return null;
  const [r, g, b] = parseColorAlpha(bgHex);
  for (const [name, hex] of Object.entries(surfaces)) {
    if (!hex) continue;
    const [sr, sg, sb] = parseColorAlpha(hex);
    if (Math.abs(r - sr) <= 8 && Math.abs(g - sg) <= 8 && Math.abs(b - sb) <= 8) return name;
  }
  return null;
}

/** Colour histogram of a pixel list, most frequent first: [{ px, n }]. */
function histogram(pixels) {
  const counts = new Map();
  for (const p of pixels) {
    if (!p) continue;
    const k = (p[0] << 16) | (p[1] << 8) | p[2];
    const e = counts.get(k);
    if (e) e.n++;
    else counts.set(k, { px: p, n: 1 });
  }
  return [...counts.values()].sort((a, b) => b.n - a.n);
}

export class Screenshot {
  constructor(png, dpr) {
    this.png = png;
    this.dpr = dpr;
    this.w = png.width;
    this.h = png.height;
  }

  /** Opaque pixel at device coordinates, or null when off-image. */
  px(x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
    const i = (y * this.w + x) * 4;
    const d = this.png.data;
    return [d[i], d[i + 1], d[i + 2]];
  }

  /** Every pixel in a CSS-px rectangle (clipped to the image). */
  pixels(rect) {
    const s = this.dpr;
    const x0 = Math.max(0, Math.floor(rect.x * s));
    const y0 = Math.max(0, Math.floor(rect.y * s));
    const x1 = Math.min(this.w, Math.ceil((rect.x + rect.w) * s));
    const y1 = Math.min(this.h, Math.ceil((rect.y + rect.h) * s));
    const out = [];
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) out.push(this.px(x, y));
    return out;
  }
}

/** Most frequent exact colour in a pixel list. */
export function mode(pixels) {
  const counts = new Map();
  let best = null;
  let bestN = 0;
  for (const p of pixels) {
    if (!p) continue;
    const k = (p[0] << 16) | (p[1] << 8) | p[2];
    const n = (counts.get(k) || 0) + 1;
    counts.set(k, n);
    if (n > bestN) { bestN = n; best = p; }
  }
  return best;
}

/** Pixel whose luminance is farthest from `bg` (the most visible mark). */
export function extreme(pixels, bg) {
  const yb = apcaLuminance(bg);
  let best = null;
  let bestD = -1;
  for (const p of pixels) {
    if (!p) continue;
    const d = Math.abs(apcaLuminance(p) - yb);
    if (d > bestD) { bestD = d; best = p; }
  }
  return best;
}

function grow(rect, by) {
  return { x: rect.x - by, y: rect.y - by, w: rect.w + 2 * by, h: rect.h + 2 * by };
}

/** Pixels in a ring `from`..`to` px outside the rect. */
function ring(shot, rect, from, to) {
  const outer = shot.pixels(grow(rect, to));
  const innerRect = grow(rect, from);
  const s = shot.dpr;
  const ix0 = Math.floor(innerRect.x * s), iy0 = Math.floor(innerRect.y * s);
  const ix1 = Math.ceil((innerRect.x + innerRect.w) * s), iy1 = Math.ceil((innerRect.y + innerRect.h) * s);
  // Recompute with coordinates so we can exclude the inner block.
  const out = [];
  const g = grow(rect, to);
  const x0 = Math.max(0, Math.floor(g.x * s)), y0 = Math.max(0, Math.floor(g.y * s));
  const x1 = Math.min(shot.w, Math.ceil((g.x + g.w) * s)), y1 = Math.min(shot.h, Math.ceil((g.y + g.h) * s));
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    if (x >= ix0 && x < ix1 && y >= iy0 && y < iy1) continue;
    out.push(shot.px(x, y));
  }
  return out.length ? out : outer;
}

/** The rect covering the line of a walked item (edge of its box, or its SVG box). */
function lineRect(item) {
  const r = item.rect;
  const w = Math.max(1, item.strokeWidth || 1);
  switch (item.edge) {
    case "left": return { x: r.x, y: r.y + 2, w, h: Math.max(1, r.h - 4) };
    case "top": return { x: r.x + 2, y: r.y, w: Math.max(1, r.w - 4), h: w };
    case "bottom": return { x: r.x + 2, y: r.y + r.h - w, w: Math.max(1, r.w - 4), h: w };
    case "row": return { x: r.x, y: r.y, w: r.w, h: Math.max(1, r.h) };
    case "column": return { x: r.x, y: r.y, w: Math.max(1, r.w), h: r.h };
    default: return r; // svg: the element box
  }
}

/**
 * Background candidates next to a line: the mode of a 3px band on each side,
 * 2..5px away, taken only where the line is actually painted (its pixel is
 * the line's own colour within an antialiasing tolerance). A dash gap, a
 * covering occurrence bar or another element crossing the line is not the
 * line. When fewer than a fifth of the positions are painted (a border hidden
 * under a lifeline), every position counts instead.
 * Returns { a, b }: the side before and after the line.
 */
function lineBackgrounds(shot, item, lr, nominal) {
  if (item.edge === "svg") {
    // Arrow heads and dashed outlines: use a ring around the whole box.
    const pixels = ring(shot, lr, 1, 3);
    const m = mode(pixels);
    const h = histogram(pixels);
    return { a: m, b: m, histA: h, histB: h, paintedFraction: 1 };
  }
  const s = shot.dpr;
  const horizontal = lr.w >= lr.h;
  // 12 per channel: a crisp 1px rule, a dash or a border is exact; a surface
  // that merely covers the line (the SVG draws header bands over lifelines)
  // differs by more and must not count as the line.
  const near = (p) => p && nominal && Math.max(Math.abs(p[0] - nominal[0]), Math.abs(p[1] - nominal[1]), Math.abs(p[2] - nominal[2])) <= 12;
  const band = [Math.round(2 * s), Math.round(5 * s)];
  const vis = { a: [], b: [] };
  const all = { a: [], b: [] };
  let painted = 0;
  let total = 0;
  const take = (fnA, fnB, isPainted) => {
    total++;
    if (isPainted) painted++;
    for (let g = band[0]; g <= band[1]; g++) {
      const pa = fnA(g);
      const pb = fnB(g);
      all.a.push(pa);
      all.b.push(pb);
      if (isPainted) { vis.a.push(pa); vis.b.push(pb); }
    }
  };
  if (horizontal) {
    const y0 = Math.floor(lr.y * s);
    const y1 = Math.ceil((lr.y + lr.h) * s) - 1;
    for (let x = Math.floor(lr.x * s); x < Math.ceil((lr.x + lr.w) * s); x++) {
      take((g) => shot.px(x, y0 - g), (g) => shot.px(x, y1 + g), near(shot.px(x, y0)) || near(shot.px(x, y1)));
    }
  } else {
    const x0 = Math.floor(lr.x * s);
    const x1 = Math.ceil((lr.x + lr.w) * s) - 1;
    for (let y = Math.floor(lr.y * s); y < Math.ceil((lr.y + lr.h) * s); y++) {
      take((g) => shot.px(x0 - g, y), (g) => shot.px(x1 + g, y), near(shot.px(x0, y)) || near(shot.px(x1, y)));
    }
  }
  const use = total && painted / total >= 0.2 ? vis : all;
  return {
    a: mode(use.a) || mode(all.a),
    b: mode(use.b) || mode(all.b),
    histA: histogram(use.a.length ? use.a : all.a),
    histB: histogram(use.b.length ? use.b : all.b),
    paintedFraction: total ? painted / total : 0,
  };
}

/**
 * Measure one walked item. Returns the item extended with
 *   bg          sampled background (hex)
 *   fg          nominal colour composited over bg (hex)
 *   lc          APCA Lc of fg on bg (signed)
 *   renderedFg  the most visible pixel of the mark (hex), and renderedLc
 */
export function measure(shot, item, surfaces = null) {
  if (item.kind === "meta") return item;
  const nominal = parseColorAlpha(item.color);
  const alpha = nominal[3] * (item.opacity ?? 1);
  const designed = designedSurfaces(item);

  if (item.kind === "text") {
    const bgPixels = ring(shot, item.rect, 0, 2).concat(shot.pixels(item.rect));
    const bg = mode(bgPixels);
    if (!bg) return { ...item, error: "no background pixels" };
    const fg = composite([nominal[0], nominal[1], nominal[2], alpha], bg);
    const rendered = extreme(shot.pixels(item.rect), bg);
    const surface = classifyBackground(toHex(bg), surfaces);
    return { ...finish(item, fg, bg, rendered), bgSurface: surface, overlap: !!surface && !designed.includes(surface) };
  }

  if (item.kind === "line") {
    const lr = lineRect(item);
    // The painted colour is the nominal colour over whatever is behind it;
    // for an opaque line that is the nominal colour itself.
    const guess = alpha >= 0.999 ? [nominal[0], nominal[1], nominal[2]] : null;
    const sides = lineBackgrounds(shot, item, lr, guess);
    // The outer frame borders opaque document paper: its stable, designed
    // surface is the frame interior (side B). Its outside is host-owned and
    // may be any colour after the outer canvas became transparent. Other
    // box left/top edges are measured against their outside (side A).
    // A bottom edge (the rule under a fragment header) and
    // a free rule (divider, lifeline) sit between two surfaces and are seen
    // against whichever they stand out from more. Along a free rule the
    // background changes (frame, then an occurrence bar, then a header chip):
    // every colour that covers at least 4px of the line is evaluated, the
    // ones on a designed surface gate, the others are overlaps.
    const hists = item.role === "frame-border" && (item.edge === "left" || item.edge === "top")
      ? [sides.histB]
      : item.edge === "left" || item.edge === "top"
        ? [sides.histA]
        : [sides.histA, sides.histB];
    const minPx = Math.max(4, 4 * shot.dpr);
    const key = (px) => (px[0] << 16) | (px[1] << 8) | px[2];
    const onBothSides = (px) =>
      hists.length === 2 && hists.every((h) => h.some((e) => key(e.px) === key(px) && e.n >= minPx));
    const evaluated = [];
    for (const hist of hists) {
      for (let i = 0; i < hist.length; i++) {
        const { px, n } = hist[i];
        const bgHex = toHex(px);
        const surface = classifyBackground(bgHex, surfaces);
        // The dominant colour always counts. Other colours count only when
        // they are a diagram surface the line runs across for a stretch
        // (frame, bar, header chip); an arrow or a neighbouring lifeline
        // touching the edge is not the line's background.
        if (i > 0 && (!surface || n < minPx)) continue;
        const fg = composite([nominal[0], nominal[1], nominal[2], alpha], px);
        // A free rule "overlaps" a foreign surface only where it runs through
        // it (the surface shows on both sides); the far side of an edge or a
        // surface the rule merely borders is an alternative background, not
        // an overlap.
        const foreign = !!surface && !designed.includes(surface);
        const crosses = hists.length === 1 ? foreign : foreign && onBothSides(px);
        evaluated.push({ bg: px, bgHex, fg, lc: apcaContrast(fg, px), n, surface, designed: !foreign, crosses });
      }
    }
    if (!evaluated.length) return { ...item, error: "no background pixels" };
    // Gate on the worst designed background; a two-sided rule only needs one
    // side (the better one), so take max over sides, min over colours.
    const gatedPool = evaluated.filter((e) => e.designed);
    const pool = gatedPool.length ? gatedPool : evaluated;
    let chosen;
    if (hists.length === 1) chosen = pool.reduce((w, e) => (Math.abs(e.lc) < Math.abs(w.lc) ? e : w));
    else chosen = pool.reduce((w, e) => (Math.abs(e.lc) > Math.abs(w.lc) ? e : w));
    const overlaps = evaluated.filter((e) => e.crosses).map((e) => ({ bg: e.bgHex, surface: e.surface, lc: +e.lc.toFixed(1), px: e.n }));
    const rendered = extreme(shot.pixels(lr), chosen.bg);
    return {
      ...finish(item, chosen.fg, chosen.bg, rendered),
      bgSurface: chosen.surface,
      overlap: !gatedPool.length && !!chosen.surface,
      overlaps,
      paintedFraction: +sides.paintedFraction.toFixed(2),
    };
  }

  // fill: the fill is what is actually painted inside; the background is the
  // ring 2..4px outside the box, ignoring pixels of the fill's own colour (a
  // nested occurrence bar sits half over its parent: the surface is seen
  // against the frame on its other side, not against itself).
  const inside = mode(shot.pixels(grow(item.rect, -2)));
  const ringPixels = ring(shot, item.rect, 2, 4);
  const sameAsFill = (p) => inside && p && p[0] === inside[0] && p[1] === inside[1] && p[2] === inside[2];
  const bg = mode(ringPixels.filter((p) => !sameAsFill(p))) || mode(ringPixels);
  if (!bg) return { ...item, error: "no background pixels" };
  const fgNominal = composite([nominal[0], nominal[1], nominal[2], alpha], bg);
  const out = finish(item, inside || fgNominal, bg, inside);
  out.nominalFg = toHex(fgNominal);
  out.nominalLc = apcaContrast(fgNominal, bg);
  const surface = classifyBackground(toHex(bg), surfaces);
  out.bgSurface = surface;
  out.overlap = !!surface && !designed.includes(surface);
  return out;
}

function finish(item, fg, bg, rendered) {
  const lc = apcaContrast(fg, bg);
  return {
    ...item,
    bg: toHex(bg),
    fg: toHex(fg),
    lc,
    absLc: Math.abs(lc),
    renderedFg: rendered ? toHex(rendered) : null,
    renderedLc: rendered ? apcaContrast(rendered, bg) : null,
  };
}

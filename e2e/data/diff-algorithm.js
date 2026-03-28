/*
 * Shared pixel-diff algorithm used by:
 * - compare-case.html (via window.diffFromImages)
 * - native-diff-ext/content.js (extension)
 * - analyze-compare-case.mjs (CLI, via window.diffFromImages on the page)
 *
 * Single source of truth for parameters and pixel classification.
 */

// Default parameters — callers may override via `opts`
export const DEFAULTS = {
  LUMA_THRESHOLD: 240,
  CHANNEL_TOLERANCE: 12,
  POSITION_TOLERANCE: 0,
};

// Diff output colors (RGBA)
export const COLORS = {
  background: [240, 240, 240, 255],
  match:      [0, 100, 0, 255],
  htmlOnly:   [255, 0, 0, 255],
  svgOnly:    [0, 0, 255, 255],
  colorDiff:  [255, 0, 255, 255],
};

function luma(r, g, b) {
  return 0.3 * r + 0.59 * g + 0.11 * b;
}

function getPixel(data, stride, x, y) {
  const i = (y * stride + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
}

/**
 * Run pixel diff on two same-sized RGBA pixel arrays.
 *
 * @param {Uint8ClampedArray} data1 - HTML screenshot pixel data
 * @param {Uint8ClampedArray} data2 - SVG screenshot pixel data
 * @param {number} w - width of both images (use max if sizes differ)
 * @param {number} h - height of both images
 * @param {number} stride1 - row stride for data1 (usually same as w)
 * @param {number} stride2 - row stride for data2
 * @param {object} [opts] - optional parameter overrides
 * @returns {{ diff: Uint8ClampedArray, stats: object }}
 */
export function pixelDiff(data1, data2, w, h, stride1, stride2, opts) {
  const LUMA_THRESHOLD = opts?.LUMA_THRESHOLD ?? DEFAULTS.LUMA_THRESHOLD;
  const CHANNEL_TOLERANCE = opts?.CHANNEL_TOLERANCE ?? DEFAULTS.CHANNEL_TOLERANCE;
  const POSITION_TOLERANCE = opts?.POSITION_TOLERANCE ?? DEFAULTS.POSITION_TOLERANCE;

  const diff = new Uint8ClampedArray(w * h * 4);
  let total = 0, matched = 0, htmlOnly = 0, svgOnly = 0, colorDiff = 0;

  function pixelsClose(a, b) {
    return Math.abs(a[0] - b[0]) <= CHANNEL_TOLERANCE &&
           Math.abs(a[1] - b[1]) <= CHANNEL_TOLERANCE &&
           Math.abs(a[2] - b[2]) <= CHANNEL_TOLERANCE;
  }

  function hasNearbyMatch(srcData, srcStride, dstData, dstStride, x, y) {
    const p1 = getPixel(srcData, srcStride, x, y);
    for (let dy = -POSITION_TOLERANCE; dy <= POSITION_TOLERANCE; dy++) {
      for (let dx = -POSITION_TOLERANCE; dx <= POSITION_TOLERANCE; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const p2 = getPixel(dstData, dstStride, nx, ny);
        if (luma(...p2) < LUMA_THRESHOLD && pixelsClose(p1, p2)) return true;
      }
    }
    return false;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pA = getPixel(data1, stride1, x, y);
      const pB = getPixel(data2, stride2, x, y);
      const isA = luma(...pA) < LUMA_THRESHOLD;
      const isB = luma(...pB) < LUMA_THRESHOLD;
      const di = (y * w + x) * 4;

      if (!isA && !isB) {
        diff[di] = COLORS.background[0];
        diff[di + 1] = COLORS.background[1];
        diff[di + 2] = COLORS.background[2];
        diff[di + 3] = COLORS.background[3];
        continue;
      }

      total++;
      const matchAB = hasNearbyMatch(data1, stride1, data2, stride2, x, y);
      const matchBA = hasNearbyMatch(data2, stride2, data1, stride1, x, y);

      let color;
      if (isA && isB) {
        if (matchAB || matchBA) {
          matched++;
          color = COLORS.match;
        } else {
          colorDiff++;
          color = COLORS.colorDiff;
        }
      } else if (isA) {
        if (matchAB) {
          matched++;
          color = COLORS.match;
        } else {
          htmlOnly++;
          color = COLORS.htmlOnly;
        }
      } else {
        if (matchBA) {
          matched++;
          color = COLORS.match;
        } else {
          svgOnly++;
          color = COLORS.svgOnly;
        }
      }

      diff[di] = color[0];
      diff[di + 1] = color[1];
      diff[di + 2] = color[2];
      diff[di + 3] = color[3];
    }
  }

  const posMatched = matched + colorDiff;
  const pixelPct = total > 0 ? parseFloat((matched / total * 100).toFixed(1)) : 0.0;
  const posPct = total > 0 ? parseFloat((posMatched / total * 100).toFixed(1)) : 0.0;

  return {
    diff,
    stats: { matched, posMatched, total, htmlOnly, svgOnly, colorDiff, pixelPct, posPct },
  };
}

/**
 * Load an image from a data URL into an ImageData-compatible object.
 * Works in any browser context (page or extension content script).
 */
export function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/**
 * Draw an image onto a white-filled canvas and return its pixel data.
 */
export function getImageData(img, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, w, h).data;
}

/**
 * High-level: load two data-URL images, run diff, render to a canvas.
 * Returns { canvas, stats, badgeHtml }.
 */
export async function diffImages(htmlDataUrl, svgDataUrl, opts) {
  const [htmlImg, svgImg] = await Promise.all([
    loadImage(htmlDataUrl),
    loadImage(svgDataUrl),
  ]);

  const w = Math.max(htmlImg.width, svgImg.width);
  const h = Math.max(htmlImg.height, svgImg.height);

  const data1 = getImageData(htmlImg, w, h);
  const data2 = getImageData(svgImg, w, h);

  const { diff, stats } = pixelDiff(data1, data2, w, h, w, w, opts);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(w, h);
  imageData.data.set(diff);
  ctx.putImageData(imageData, 0, 0);

  const badgeHtml =
    `<b>${stats.pixelPct}%</b> native pixel match / <b>${stats.posPct}%</b> pos-only (${stats.matched}/${stats.total} px) ` +
    `<span style="color:#006400">\u25a0</span> match ` +
    `<span style="color:#ff0000">\u25a0</span> HTML-only (${stats.htmlOnly}) ` +
    `<span style="color:#0000ff">\u25a0</span> SVG-only (${stats.svgOnly}) ` +
    `<span style="color:#ff00ff">\u25a0</span> color diff (${stats.colorDiff})`;

  return { canvas, stats, badgeHtml };
}

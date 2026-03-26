/*
 * What this file does:
 * Builds the analyzer's local pixel diff from native HTML and SVG screenshots.
 *
 * High-level flow:
 * - Flattens captured PNGs onto white so alpha does not skew comparison.
 * - Compares HTML and SVG pixels with configurable channel and position tolerance.
 * - Classifies pixels into match, html-only, svg-only, and color-diff buckets.
 * - Exposes slot-level diff summaries used later by letter and icon scoring.
 *
 * Note:
 * This module only produces the analyzer-side diff. It is not the live diff-panel
 * source of truth used by the current dia-scoring policy.
 *
 * Example input:
 * Two flattened images of the HTML and SVG roots plus options like
 * `{ lumaThreshold: 240, channelTolerance: 12, positionTolerance: 0 }`
 *
 * Example output:
 * `{ width, height, diffData, classData, stats: { matched, htmlOnly, svgOnly, colorDiff, pixelPct } }`
 */
import { PNG } from "pngjs";

import { clamp, round } from "./geometry.mjs";

function rgbaToLuma(r, g, b) {
  return 0.3 * r + 0.59 * g + 0.11 * b;
}

export function flattenToWhite(png) {
  const data = new Uint8ClampedArray(png.width * png.height * 4);
  for (let i = 0; i < png.data.length; i += 4) {
    const alpha = png.data[i + 3] / 255;
    data[i] = Math.round(png.data[i] * alpha + 255 * (1 - alpha));
    data[i + 1] = Math.round(png.data[i + 1] * alpha + 255 * (1 - alpha));
    data[i + 2] = Math.round(png.data[i + 2] * alpha + 255 * (1 - alpha));
    data[i + 3] = 255;
  }
  return { width: png.width, height: png.height, data };
}

function padImage(image, width, height) {
  const data = new Uint8ClampedArray(width * height * 4);
  data.fill(255);
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const srcIndex = (y * image.width + x) * 4;
      const dstIndex = (y * width + x) * 4;
      data[dstIndex] = image.data[srcIndex];
      data[dstIndex + 1] = image.data[srcIndex + 1];
      data[dstIndex + 2] = image.data[srcIndex + 2];
      data[dstIndex + 3] = 255;
    }
  }
  return data;
}

function pixelsClose(a, b, tolerance) {
  return (
    Math.abs(a[0] - b[0]) <= tolerance &&
    Math.abs(a[1] - b[1]) <= tolerance &&
    Math.abs(a[2] - b[2]) <= tolerance
  );
}

function getPixel(data, width, x, y) {
  const index = (y * width + x) * 4;
  return [data[index], data[index + 1], data[index + 2]];
}

function hasNearbyMatch(srcData, srcWidth, dstData, dstWidth, x, y, width, height, options) {
  const pixel = getPixel(srcData, srcWidth, x, y);
  for (let dy = -options.positionTolerance; dy <= options.positionTolerance; dy++) {
    for (let dx = -options.positionTolerance; dx <= options.positionTolerance; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        continue;
      }
      const other = getPixel(dstData, dstWidth, nx, ny);
      if (rgbaToLuma(other[0], other[1], other[2]) < options.lumaThreshold && pixelsClose(pixel, other, options.channelTolerance)) {
        return true;
      }
    }
  }
  return false;
}

export function computeNativeDiff(htmlImage, svgImage, options) {
  const width = Math.max(htmlImage.width, svgImage.width);
  const height = Math.max(htmlImage.height, svgImage.height);
  const htmlData = padImage(htmlImage, width, height);
  const svgData = padImage(svgImage, width, height);
  const diffData = new Uint8ClampedArray(width * height * 4);
  const classData = new Uint8Array(width * height);

  let total = 0;
  let matched = 0;
  let htmlOnly = 0;
  let svgOnly = 0;
  let colorDiff = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const a = [htmlData[index], htmlData[index + 1], htmlData[index + 2]];
      const b = [svgData[index], svgData[index + 1], svgData[index + 2]];
      const isHtmlContent = rgbaToLuma(a[0], a[1], a[2]) < options.lumaThreshold;
      const isSvgContent = rgbaToLuma(b[0], b[1], b[2]) < options.lumaThreshold;

      if (!isHtmlContent && !isSvgContent) {
        diffData[index] = 240;
        diffData[index + 1] = 240;
        diffData[index + 2] = 240;
        diffData[index + 3] = 255;
        continue;
      }

      total++;
      const matchHtml = hasNearbyMatch(htmlData, width, svgData, width, x, y, width, height, options);
      const matchSvg = hasNearbyMatch(svgData, width, htmlData, width, x, y, width, height, options);

      if (isHtmlContent && isSvgContent) {
        if (matchHtml || matchSvg) {
          matched++;
          classData[y * width + x] = 1;
          diffData[index] = 0;
          diffData[index + 1] = 100;
          diffData[index + 2] = 0;
        } else {
          colorDiff++;
          classData[y * width + x] = 4;
          diffData[index] = 255;
          diffData[index + 1] = 0;
          diffData[index + 2] = 255;
        }
      } else if (isHtmlContent) {
        if (matchHtml) {
          matched++;
          classData[y * width + x] = 1;
          diffData[index] = 0;
          diffData[index + 1] = 100;
          diffData[index + 2] = 0;
        } else {
          htmlOnly++;
          classData[y * width + x] = 2;
          diffData[index] = 255;
          diffData[index + 1] = 0;
          diffData[index + 2] = 0;
        }
      } else if (matchSvg) {
        matched++;
        classData[y * width + x] = 1;
        diffData[index] = 0;
        diffData[index + 1] = 100;
        diffData[index + 2] = 0;
      } else {
        svgOnly++;
        classData[y * width + x] = 3;
        diffData[index] = 0;
        diffData[index + 1] = 0;
        diffData[index + 2] = 255;
      }
      diffData[index + 3] = 255;
    }
  }

  return {
    width,
    height,
    diffData,
    classData,
    stats: {
      matched,
      total,
      htmlOnly,
      svgOnly,
      colorDiff,
      pixelPct: total > 0 ? round((matched / total) * 100, 2) : 100,
    },
  };
}

export function buildPngBuffer(width, height, data) {
  const png = new PNG({ width, height });
  png.data = Buffer.from(data);
  return PNG.sync.write(png);
}

export function analyzeDiffSlot(diffImage, slot) {
  const x1 = clamp(Math.floor(slot.x), 0, diffImage.width);
  const y1 = clamp(Math.floor(slot.y), 0, diffImage.height);
  const x2 = clamp(Math.ceil(slot.x + slot.w), 0, diffImage.width);
  const y2 = clamp(Math.ceil(slot.y + slot.h), 0, diffImage.height);

  let redCount = 0;
  let blueCount = 0;
  let redSumX = 0;
  let redSumY = 0;
  let blueSumX = 0;
  let blueSumY = 0;

  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      const cls = diffImage.classData[y * diffImage.width + x];
      if (cls === 2) {
        redCount++;
        redSumX += x + 0.5;
        redSumY += y + 0.5;
      } else if (cls === 3) {
        blueCount++;
        blueSumX += x + 0.5;
        blueSumY += y + 0.5;
      }
    }
  }

  return {
    redCount,
    blueCount,
    redCentroid: redCount > 0 ? { x: redSumX / redCount, y: redSumY / redCount } : null,
    blueCentroid: blueCount > 0 ? { x: blueSumX / blueCount, y: blueSumY / blueCount } : null,
  };
}

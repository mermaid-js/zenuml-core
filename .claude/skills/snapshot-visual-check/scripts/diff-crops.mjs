#!/usr/bin/env node
// Locate pixel-diff clusters between two PNGs and write magnified
// expected | actual | diff crops for each cluster, so a reviewer can see
// exactly what changed before accepting a new snapshot baseline.
//
// Usage:
//   node diff-crops.mjs <expected.png> <actual.png> <out-dir> [--threshold 0.1] [--pad 12] [--scale 4]
//
// Prints JSON: image sizes, total diff pixels, and one entry per cluster with
// its bounding box and the crop file written for it.
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";

const args = process.argv.slice(2);
const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args[i + 1]) : fallback;
};
const [expectedPath, actualPath, outDir] = positional;
if (!expectedPath || !actualPath || !outDir) {
  console.error("Usage: node diff-crops.mjs <expected.png> <actual.png> <out-dir> [--threshold 0.1] [--pad 12] [--scale 4]");
  process.exit(2);
}
const threshold = opt("threshold", 0.1);
const pad = opt("pad", 12);
const scale = opt("scale", 4);
const CELL = 8; // cluster grid cell in px; diff pixels in touching cells form one cluster

fs.mkdirSync(outDir, { recursive: true });
const expected = PNG.sync.read(fs.readFileSync(expectedPath));
const actual = PNG.sync.read(fs.readFileSync(actualPath));

const width = Math.max(expected.width, actual.width);
const height = Math.max(expected.height, actual.height);
const sizeChanged = expected.width !== actual.width || expected.height !== actual.height;

// Pad both images onto a common canvas so a size change still diffs.
const toCanvas = (img) => {
  const out = new PNG({ width, height });
  out.data.fill(0);
  PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
  return out;
};
const a = toCanvas(expected);
const b = toCanvas(actual);
const diff = new PNG({ width, height });
const diffPixels = pixelmatch(a.data, b.data, diff.data, width, height, { threshold });
fs.writeFileSync(path.join(outDir, "diff-full.png"), PNG.sync.write(diff));

// Mark grid cells that contain at least one differing pixel.
const cols = Math.ceil(width / CELL);
const rows = Math.ceil(height / CELL);
const hot = new Uint8Array(cols * rows);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    // pixelmatch paints differing pixels red (255, 0, 0).
    if (diff.data[i] === 255 && diff.data[i + 1] === 0 && diff.data[i + 2] === 0) {
      hot[Math.floor(y / CELL) * cols + Math.floor(x / CELL)] = 1;
    }
  }
}

// Flood-fill touching hot cells (8-neighbour) into clusters.
const seen = new Uint8Array(cols * rows);
const clusters = [];
for (let start = 0; start < hot.length; start++) {
  if (!hot[start] || seen[start]) continue;
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1, cells = 0;
  const stack = [start];
  seen[start] = 1;
  while (stack.length) {
    const c = stack.pop();
    const cx = c % cols, cy = Math.floor(c / cols);
    cells++;
    x0 = Math.min(x0, cx); y0 = Math.min(y0, cy); x1 = Math.max(x1, cx); y1 = Math.max(y1, cy);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        const n = ny * cols + nx;
        if (hot[n] && !seen[n]) { seen[n] = 1; stack.push(n); }
      }
    }
  }
  clusters.push({
    x: x0 * CELL, y: y0 * CELL,
    width: Math.min(width, (x1 + 1) * CELL) - x0 * CELL,
    height: Math.min(height, (y1 + 1) * CELL) - y0 * CELL,
    cells,
  });
}
clusters.sort((p, q) => q.cells - p.cells);

// Write one magnified expected | actual | diff strip per cluster (largest 12).
const report = [];
for (const [index, c] of clusters.slice(0, 12).entries()) {
  const left = Math.max(0, c.x - pad);
  const top = Math.max(0, c.y - pad);
  const w = Math.min(width - left, c.width + pad * 2);
  const h = Math.min(height - top, c.height + pad * 2);
  const crop = (png) =>
    sharp(PNG.sync.write(png))
      .extract({ left, top, width: w, height: h })
      .resize(w * scale, h * scale, { kernel: "nearest" })
      .png()
      .toBuffer();
  const [ce, ca, cd] = await Promise.all([crop(a), crop(b), crop(diff)]);
  const gap = 8;
  const file = path.join(outDir, `cluster-${index + 1}.png`);
  await sharp({
    create: { width: w * scale * 3 + gap * 2, height: h * scale, channels: 4, background: "#ff00ff" },
  })
    .composite([
      { input: ce, left: 0, top: 0 },
      { input: ca, left: w * scale + gap, top: 0 },
      { input: cd, left: (w * scale + gap) * 2, top: 0 },
    ])
    .png()
    .toFile(file);
  report.push({ cluster: index + 1, box: { x: c.x, y: c.y, width: c.width, height: c.height }, file });
}

console.log(JSON.stringify({
  expected: { path: expectedPath, width: expected.width, height: expected.height },
  actual: { path: actualPath, width: actual.width, height: actual.height },
  sizeChanged,
  diffPixels,
  clusterCount: clusters.length,
  clusters: report,
  note: "Each cluster file is expected | actual | diff, magenta separators, magnified.",
}, null, 2));

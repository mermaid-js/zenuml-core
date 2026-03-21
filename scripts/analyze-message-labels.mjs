#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const DEFAULTS = {
  caseName: "async-2a",
  baseUrl: "http://localhost:8080",
  lumaThreshold: 240,
  channelTolerance: 12,
  positionTolerance: 0,
  viewport: { width: 1600, height: 2200 },
};

function parseArgs(argv) {
  const args = { ...DEFAULTS, jsonOnly: false, summaryOnly: false, outputDir: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if ((arg === "--case" || arg === "-c") && next) {
      args.caseName = next;
      i++;
      continue;
    }
    if ((arg === "--base-url" || arg === "-b") && next) {
      args.baseUrl = next;
      i++;
      continue;
    }
    if (arg === "--json") {
      args.jsonOnly = true;
      continue;
    }
    if (arg === "--summary-only") {
      args.summaryOnly = true;
      continue;
    }
    if (arg === "--output-dir" && next) {
      args.outputDir = next;
      i++;
      continue;
    }
    if (arg === "--luma" && next) {
      args.lumaThreshold = Number(next);
      i++;
      continue;
    }
    if (arg === "--ctol" && next) {
      args.channelTolerance = Number(next);
      i++;
      continue;
    }
    if (arg === "--ptol" && next) {
      args.positionTolerance = Number(next);
      i++;
      continue;
    }
    if (!arg.startsWith("-") && args.caseName === DEFAULTS.caseName) {
      args.caseName = arg;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeOffset(value) {
  const rounded = round(value);
  return Math.abs(rounded) < 0.05 ? 0 : rounded;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function segmentGraphemes(text) {
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

function keyForLabel(label) {
  return `${label.kind}\u0000${label.text}\u0000${label.textOrder}`;
}

function rectRight(rect) {
  return rect.x + rect.w;
}

function rectBottom(rect) {
  return rect.y + rect.h;
}

function area(rect) {
  return Math.max(0, rect.w) * Math.max(0, rect.h);
}

function intersectionArea(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(rectRight(a), rectRight(b));
  const bottom = Math.min(rectBottom(a), rectBottom(b));
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function iou(a, b) {
  const inter = intersectionArea(a, b);
  const union = area(a) + area(b) - inter;
  return union <= 0 ? 0 : inter / union;
}

function rgbaToLuma(r, g, b) {
  return 0.3 * r + 0.59 * g + 0.11 * b;
}

function flattenToWhite(png) {
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

function computeNativeDiff(htmlImage, svgImage, options) {
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
      } else {
        if (matchSvg) {
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

function buildPngBuffer(width, height, data) {
  const png = new PNG({ width, height });
  png.data = Buffer.from(data);
  return PNG.sync.write(png);
}

function analyzeDiffSlot(diffImage, slot) {
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

function enrichOrdering(labels) {
  const byKind = new Map();
  const byText = new Map();
  const ordered = [...labels].sort((a, b) => (a.box.y - b.box.y) || (a.box.x - b.box.x));

  for (const label of ordered) {
    const kindCount = byKind.get(label.kind) || 0;
    byKind.set(label.kind, kindCount + 1);
    label.yOrder = kindCount;

    const textKey = `${label.kind}\u0000${label.text}`;
    const textCount = byText.get(textKey) || 0;
    byText.set(textKey, textCount + 1);
    label.textOrder = textCount;
  }

  return ordered;
}

function formatLetterSummary(letter) {
  if (letter.status !== "ok") {
    return `${letter.grapheme}: ambiguous`;
  }
  const dx = letter.dx.toFixed(2);
  const dy = letter.dy.toFixed(2);
  return `${letter.grapheme}: dx=${dx}px dy=${dy}px`;
}

async function collectLabelData(page) {
  return page.evaluate(async () => {
    await document.fonts.ready;

    function relRect(rect, rootRect) {
      return {
        x: rect.left - rootRect.left,
        y: rect.top - rootRect.top,
        w: rect.width,
        h: rect.height,
      };
    }

    function collectTextNodes(el) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      let cursor = 0;
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent ?? "";
        if (!text) continue;
        nodes.push({ node, start: cursor, end: cursor + text.length });
        cursor += text.length;
      }
      return nodes;
    }

    function locateOffset(nodes, offset) {
      for (const entry of nodes) {
        if (offset >= entry.start && offset <= entry.end) {
          return { node: entry.node, offset: offset - entry.start };
        }
      }
      const last = nodes[nodes.length - 1];
      return last ? { node: last.node, offset: last.node.textContent.length } : null;
    }

    function segmentText(text) {
      if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
        return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)).map(
          (part) => ({ grapheme: part.segment, start: part.index, end: part.index + part.segment.length }),
        );
      }
      const chars = Array.from(text);
      let cursor = 0;
      return chars.map((grapheme) => {
        const entry = { grapheme, start: cursor, end: cursor + grapheme.length };
        cursor += grapheme.length;
        return entry;
      });
    }

    function glyphBoxesForElement(el, rootRect) {
      const text = (el.textContent ?? "").trim();
      const sourceText = el.textContent ?? "";
      const trimStart = sourceText.indexOf(text);
      const trimOffset = trimStart >= 0 ? trimStart : 0;
      const segments = segmentText(text);
      const nodes = collectTextNodes(el);
      const range = document.createRange();
      const boxes = [];

      for (const [index, segment] of segments.entries()) {
        const start = locateOffset(nodes, trimOffset + segment.start);
        const end = locateOffset(nodes, trimOffset + segment.end);
        if (!start || !end) {
          continue;
        }
        try {
          range.setStart(start.node, start.offset);
          range.setEnd(end.node, end.offset);
        } catch (_error) {
          continue;
        }
        const rects = Array.from(range.getClientRects());
        if (rects.length === 0) {
          continue;
        }
        const left = Math.min(...rects.map((rect) => rect.left));
        const top = Math.min(...rects.map((rect) => rect.top));
        const right = Math.max(...rects.map((rect) => rect.right));
        const bottom = Math.max(...rects.map((rect) => rect.bottom));
        boxes.push({
          index,
          grapheme: segment.grapheme,
          box: relRect({ left, top, width: right - left, height: bottom - top }, rootRect),
        });
      }

      return boxes;
    }

    function fontInfo(el) {
      const style = getComputedStyle(el);
      return {
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        lineHeight: style.lineHeight,
        textAlign: style.textAlign,
      };
    }

    function collectHtmlLabels(root, rootRect) {
      const labels = [];
      const selectorPairs = [
        {
          kind: "message",
          selector:
            ".interaction:not(.return):not(.creation):not(.self-invocation):not(.self) > .message .editable-span-base",
        },
        {
          kind: "self",
          selector:
            ".interaction.self-invocation > .message .editable-span-base, .interaction.self > .self-invocation .editable-span-base",
        },
        {
          kind: "return",
          selector:
            ".interaction.return > .message .editable-span-base, .interaction.return > .flex.items-center > .name",
        },
      ];

      for (const pair of selectorPairs) {
        for (const labelEl of root.querySelectorAll(pair.selector)) {
          const text = (labelEl.textContent ?? "").trim();
          if (!text) continue;
          labels.push({
            side: "html",
            kind: pair.kind,
            text,
            box: relRect(labelEl.getBoundingClientRect(), rootRect),
            font: fontInfo(labelEl),
            letters: glyphBoxesForElement(labelEl, rootRect),
          });
        }
      }
      return labels;
    }

    function collectSvgLabels(root, rootRect) {
      const labels = [];
      const pairs = [
        { selector: "g.message:not(.self-call) > text.message-label", kind: "message" },
        { selector: "g.message.self-call > text.message-label", kind: "self" },
        { selector: "g.return > text.return-label", kind: "return" },
      ];
      for (const pair of pairs) {
        for (const labelEl of root.querySelectorAll(pair.selector)) {
          const text = (labelEl.textContent ?? "").trim();
          if (!text) continue;
          labels.push({
            side: "svg",
            kind: pair.kind,
            text,
            box: relRect(labelEl.getBoundingClientRect(), rootRect),
            font: fontInfo(labelEl),
            letters: glyphBoxesForElement(labelEl, rootRect),
          });
        }
      }
      return labels;
    }

    const prepared = typeof window.prepareHtmlForCapture === "function"
      ? window.prepareHtmlForCapture()
      : null;
    const htmlOutput = document.getElementById("html-output");
    const htmlRoot = htmlOutput.querySelector(".frame") || htmlOutput.querySelector(".sequence-diagram") || htmlOutput;
    const svgRoot = document.querySelector("#svg-output > svg") || document.querySelector("#svg-output svg");
    const htmlRootRect = htmlRoot.getBoundingClientRect();
    const svgRootRect = svgRoot.getBoundingClientRect();

    return {
      caseName: new URLSearchParams(window.location.search).get("case") || "",
      htmlRootSelector: htmlOutput.querySelector(".frame") ? "#html-output .frame" : "#html-output .sequence-diagram",
      svgRootSelector: "#svg-output > svg",
      prepared: Boolean(prepared),
      htmlRoot: { width: htmlRootRect.width, height: htmlRootRect.height },
      svgRoot: { width: svgRootRect.width, height: svgRootRect.height },
      htmlLabels: collectHtmlLabels(htmlRoot, htmlRootRect),
      svgLabels: collectSvgLabels(svgRoot, svgRootRect),
    };
  });
}

function pairLabels(htmlLabels, svgLabels) {
  const htmlOrdered = enrichOrdering(htmlLabels);
  const svgOrdered = enrichOrdering(svgLabels);

  const htmlMap = new Map(htmlOrdered.map((label) => [keyForLabel(label), label]));
  const svgMap = new Map(svgOrdered.map((label) => [keyForLabel(label), label]));
  const allKeys = Array.from(new Set([...htmlMap.keys(), ...svgMap.keys()]));

  return allKeys
    .map((key) => ({ key, html: htmlMap.get(key) || null, svg: svgMap.get(key) || null }))
    .sort((a, b) => {
      const ay = a.html?.box.y ?? a.svg?.box.y ?? 0;
      const by = b.html?.box.y ?? b.svg?.box.y ?? 0;
      return ay - by;
    });
}

function scoreLetter(htmlLetter, svgLetter, diffImage) {
  const directDx = svgLetter.box.x - htmlLetter.box.x;
  const directDy = svgLetter.box.y - htmlLetter.box.y;
  const slot = {
    x: Math.min(htmlLetter.box.x, svgLetter.box.x) - 2,
    y: Math.min(htmlLetter.box.y, svgLetter.box.y) - 2,
    w: Math.max(rectRight(htmlLetter.box), rectRight(svgLetter.box)) - Math.min(htmlLetter.box.x, svgLetter.box.x) + 4,
    h: Math.max(rectBottom(htmlLetter.box), rectBottom(svgLetter.box)) - Math.min(htmlLetter.box.y, svgLetter.box.y) + 4,
  };
  const diff = analyzeDiffSlot(diffImage, slot);
  const centroidDx = diff.redCentroid && diff.blueCentroid ? diff.blueCentroid.x - diff.redCentroid.x : null;
  const centroidDy = diff.redCentroid && diff.blueCentroid ? diff.blueCentroid.y - diff.redCentroid.y : null;
  const nearZero = Math.abs(directDx) < 0.75 && Math.abs(directDy) < 0.75;
  const enoughDiffPixels = diff.redCount >= 6 && diff.blueCount >= 6;
  const xConsistent = centroidDx === null || Math.abs(directDx) < 0.75 || Math.sign(centroidDx) === Math.sign(directDx);
  const yConsistent = centroidDy === null || Math.abs(directDy) < 0.75 || Math.sign(centroidDy) === Math.sign(directDy);
  const overlap = iou(htmlLetter.box, svgLetter.box);

  let status = "ambiguous";
  if (nearZero) {
    status = overlap >= 0.35 ? "ok" : "ambiguous";
  } else if (enoughDiffPixels && xConsistent && yConsistent) {
    status = "ok";
  }

  const diffConfidence = nearZero
    ? overlap
    : enoughDiffPixels
      ? 0.5 + Math.min(0.5, ((diff.redCount + diff.blueCount) / 80))
      : 0.15;
  const confidence = round(Math.min(1, overlap * 0.45 + diffConfidence * 0.55), 3);

  return {
    index: htmlLetter.index,
    grapheme: htmlLetter.grapheme,
    status,
    dx: status === "ok" ? normalizeOffset(directDx) : null,
    dy: status === "ok" ? normalizeOffset(directDy) : null,
    confidence,
    html_box: {
      x: round(htmlLetter.box.x),
      y: round(htmlLetter.box.y),
      w: round(htmlLetter.box.w),
      h: round(htmlLetter.box.h),
    },
    svg_box: {
      x: round(svgLetter.box.x),
      y: round(svgLetter.box.y),
      w: round(svgLetter.box.w),
      h: round(svgLetter.box.h),
    },
    evidence: {
      direct_dx: normalizeOffset(directDx),
      direct_dy: normalizeOffset(directDy),
      overlap: round(overlap, 3),
      diff_red: diff.redCount,
      diff_blue: diff.blueCount,
      diff_centroid_dx: centroidDx === null ? null : round(centroidDx),
      diff_centroid_dy: centroidDy === null ? null : round(centroidDy),
    },
  };
}

function buildReport(caseName, htmlLabels, svgLabels, diffImage) {
  const pairs = pairLabels(htmlLabels, svgLabels);
  const labels = [];

  for (const pair of pairs) {
    const base = pair.html || pair.svg;
    const key = {
      kind: base?.kind ?? "message",
      text: base?.text ?? "",
      y_order: base?.yOrder ?? 0,
    };

    if (!pair.html || !pair.svg) {
      labels.push({
        key,
        status: "ambiguous",
        html_box: pair.html ? pair.html.box : null,
        svg_box: pair.svg ? pair.svg.box : null,
        font: {
          html: pair.html?.font ?? null,
          svg: pair.svg?.font ?? null,
        },
        letters: [],
        reason: "label missing on one side",
      });
      continue;
    }

    const letterCount = Math.max(pair.html.letters.length, pair.svg.letters.length);
    const letters = [];
    for (let index = 0; index < letterCount; index++) {
      const htmlLetter = pair.html.letters[index];
      const svgLetter = pair.svg.letters[index];
      if (!htmlLetter || !svgLetter || htmlLetter.grapheme !== svgLetter.grapheme) {
        letters.push({
          index,
          grapheme: htmlLetter?.grapheme ?? svgLetter?.grapheme ?? "",
          status: "ambiguous",
          dx: null,
          dy: null,
          confidence: 0,
          html_box: htmlLetter ? htmlLetter.box : null,
          svg_box: svgLetter ? svgLetter.box : null,
          evidence: { reason: "letter mismatch or missing" },
        });
        continue;
      }
      letters.push(scoreLetter(htmlLetter, svgLetter, diffImage));
    }

    const okCount = letters.filter((letter) => letter.status === "ok").length;
    const status = okCount === letters.length ? "ok" : okCount > 0 ? "mixed" : "ambiguous";
    labels.push({
      key,
      status,
      html_box: {
        x: round(pair.html.box.x),
        y: round(pair.html.box.y),
        w: round(pair.html.box.w),
        h: round(pair.html.box.h),
      },
      svg_box: {
        x: round(pair.svg.box.x),
        y: round(pair.svg.box.y),
        w: round(pair.svg.box.w),
        h: round(pair.svg.box.h),
      },
      font: {
        html: pair.html.font,
        svg: pair.svg.font,
      },
      letters,
    });
  }

  return {
    case: caseName,
    labels,
    summary: labels.map((label) => `${label.key.kind}:${label.key.text} -> ${label.letters.map(formatLetterSummary).join(", ")}`),
  };
}

async function maybeWriteArtifacts(outputDir, htmlBuffer, svgBuffer, diffImage, report) {
  if (!outputDir) {
    return null;
  }

  await fs.mkdir(outputDir, { recursive: true });
  const paths = {
    html: path.join(outputDir, "html.png"),
    svg: path.join(outputDir, "svg.png"),
    diff: path.join(outputDir, "diff.png"),
    report: path.join(outputDir, "report.json"),
  };

  await Promise.all([
    fs.writeFile(paths.html, htmlBuffer),
    fs.writeFile(paths.svg, svgBuffer),
    fs.writeFile(paths.diff, buildPngBuffer(diffImage.width, diffImage.height, diffImage.diffData)),
    fs.writeFile(paths.report, JSON.stringify(report, null, 2)),
  ]);

  return paths;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const compareUrl = `${args.baseUrl.replace(/\/$/, "")}/cy/compare-case.html?case=${encodeURIComponent(args.caseName)}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: args.viewport,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    await page.goto(compareUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("#html-output .interaction, #html-output .frame, #html-output .sequence-diagram");
    await page.waitForSelector("#svg-output svg");

    const extracted = await collectLabelData(page);
    const htmlLocator = page.locator(extracted.htmlRootSelector);
    const svgLocator = page.locator(extracted.svgRootSelector);
    const [htmlBuffer, svgBuffer] = await Promise.all([
      htmlLocator.screenshot({ type: "png", animations: "disabled" }),
      svgLocator.screenshot({ type: "png", animations: "disabled" }),
    ]);
    await page.evaluate(() => {
      if (typeof window.restoreHtmlAfterCapture === "function") {
        window.restoreHtmlAfterCapture();
      }
    });

    const htmlImage = flattenToWhite(PNG.sync.read(htmlBuffer));
    const svgImage = flattenToWhite(PNG.sync.read(svgBuffer));
    const diffImage = computeNativeDiff(htmlImage, svgImage, {
      lumaThreshold: args.lumaThreshold,
      channelTolerance: args.channelTolerance,
      positionTolerance: args.positionTolerance,
    });
    const report = buildReport(extracted.caseName || args.caseName, extracted.htmlLabels, extracted.svgLabels, diffImage);
    report.diff = diffImage.stats;
    report.capture = {
      url: compareUrl,
      html_root: extracted.htmlRoot,
      svg_root: extracted.svgRoot,
      luma_threshold: args.lumaThreshold,
      channel_tolerance: args.channelTolerance,
      position_tolerance: args.positionTolerance,
    };

    const artifactPaths = await maybeWriteArtifacts(args.outputDir, htmlBuffer, svgBuffer, diffImage, report);
    if (artifactPaths) {
      report.artifacts = artifactPaths;
    }

    if (args.summaryOnly) {
      process.stdout.write(`${report.summary.join("\n")}\n`);
      return;
    }

    if (!args.jsonOnly) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n\n`);
      process.stdout.write(`${report.summary.join("\n")}\n`);
      return;
    }

    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});

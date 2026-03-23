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
  return `${label.kind}\u0000${label.pairText ?? label.text}\u0000${label.textOrder}`;
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

function unionRect(rects) {
  if (!rects || rects.length === 0) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }
  const left = Math.min(...rects.map((rect) => rect.x));
  const top = Math.min(...rects.map((rect) => rect.y));
  const right = Math.max(...rects.map((rect) => rect.x + rect.w));
  const bottom = Math.max(...rects.map((rect) => rect.y + rect.h));
  return { x: left, y: top, w: right - left, h: bottom - top };
}

function arrowEndpointsFromBox(box) {
  return {
    left_x: box.x,
    right_x: box.x + box.w,
    width: box.w,
  };
}

function intersectionArea(a, b) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(rectRight(a), rectRight(b));
  const bottom = Math.min(rectBottom(a), rectBottom(b));
  return Math.max(0, right - left) * Math.max(0, bottom - top);
}

function rectCenter(rect) {
  return {
    x: rect.x + rect.w / 2,
    y: rect.y + rect.h / 2,
  };
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

    const textKey = `${label.kind}\u0000${label.pairText ?? label.text}`;
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

function formatSectionSummary(prefix, item) {
  const notes = [];
  if (item.owner_text) {
    notes.push(`owner=${item.owner_text}`);
  }
  if (item.html_text && item.svg_text && item.html_text !== item.svg_text) {
    notes.push(`text_mismatch(html=${item.html_text} svg=${item.svg_text})`);
  }
  const noteSuffix = notes.length > 0 ? ` [${notes.join("; ")}]` : "";
  if (!item.letters || item.letters.length === 0) {
    return `${prefix}:${item.key.kind}:${item.key.text}${noteSuffix} -> ambiguous`;
  }
  return `${prefix}:${item.key.kind}:${item.key.text}${noteSuffix} -> ${item.letters.map(formatLetterSummary).join(", ")}`;
}

function formatArrowSummary(arrow) {
  if (arrow.status !== "ok") {
    return "ambiguous";
  }
  const parts = [
    `left_dx=${arrow.left_dx.toFixed(2)}px`,
    `right_dx=${arrow.right_dx.toFixed(2)}px`,
    `width_dx=${arrow.width_dx.toFixed(2)}px`,
  ];
  if (arrow.key?.kind === "self") {
    parts.push(`top_dy=${arrow.top_dy.toFixed(2)}px`);
    parts.push(`bottom_dy=${arrow.bottom_dy.toFixed(2)}px`);
    parts.push(`height_dy=${arrow.height_dy.toFixed(2)}px`);
  }
  return parts.join(" ");
}

function formatParticipantIconSummary(icon) {
  const notes = [];
  if (icon.label_text) {
    notes.push(`label=${icon.label_text}`);
  }
  if (icon.anchor_kind) {
    notes.push(`anchor=${icon.anchor_kind}`);
  }
  if (icon.presence && icon.presence.html !== icon.presence.svg) {
    notes.push(`presence_mismatch(html=${icon.presence.html} svg=${icon.presence.svg})`);
  }
  const noteSuffix = notes.length > 0 ? ` [${notes.join("; ")}]` : "";
  if (icon.status !== "ok") {
    return `icon:${icon.name}${noteSuffix} -> ambiguous`;
  }
  return `icon:${icon.name}${noteSuffix} -> icon_dx=${icon.icon_dx.toFixed(2)}px icon_dy=${icon.icon_dy.toFixed(2)}px relative_dx=${icon.relative_dx.toFixed(2)}px relative_dy=${icon.relative_dy.toFixed(2)}px`;
}

function formatParticipantBoxSummary(box) {
  if (box.status !== "ok") {
    return `participant-box:${box.name} -> ambiguous`;
  }
  return `participant-box:${box.name} -> dx=${box.dx.toFixed(2)}px dy=${box.dy.toFixed(2)}px dw=${box.dw.toFixed(2)}px dh=${box.dh.toFixed(2)}px`;
}

function formatResidualScopeSummary(scope) {
  const htmlTarget = scope.html_target
    ? `${scope.html_target.category}:${scope.html_target.name}`
    : "none";
  const svgTarget = scope.svg_target
    ? `${scope.svg_target.category}:${scope.svg_target.name}`
    : "none";
  return `${scope.class}:${scope.size}px @ (${scope.centroid.x.toFixed(1)},${scope.centroid.y.toFixed(1)}) -> html=${htmlTarget} svg=${svgTarget}`;
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

    function elementRect(el, rootRect) {
      if (!el) {
        return null;
      }
      const rect = el.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        return null;
      }
      return relRect(rect, rootRect);
    }

    function strokedElementOuterRect(el, rootRect) {
      const box = elementRect(el, rootRect);
      if (!box) {
        return null;
      }
      const strokeWidth = parseFloat(getComputedStyle(el).strokeWidth || "0") || 0;
      if (strokeWidth <= 0) {
        return box;
      }
      const half = strokeWidth / 2;
      return {
        x: box.x - half,
        y: box.y - half,
        w: box.w + strokeWidth,
        h: box.h + strokeWidth,
      };
    }

    function pushBox(parts, part, box) {
      if (!box || box.w <= 0 || box.h <= 0) {
        return;
      }
      parts.push({ part, box });
    }

    function unionRect(rects) {
      if (!rects || rects.length === 0) {
        return { x: 0, y: 0, w: 0, h: 0 };
      }
      const left = Math.min(...rects.map((rect) => rect.x));
      const top = Math.min(...rects.map((rect) => rect.y));
      const right = Math.max(...rects.map((rect) => rect.x + rect.w));
      const bottom = Math.max(...rects.map((rect) => rect.y + rect.h));
      return { x: left, y: top, w: right - left, h: bottom - top };
    }

    function arrowEndpointsFromBox(box) {
      return {
        left_x: box.x,
        right_x: box.x + box.w,
        width: box.w,
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

    function glyphBoxesForElements(elements, rootRect) {
      const boxes = [];
      let indexOffset = 0;
      for (const el of elements) {
        const elementBoxes = glyphBoxesForElement(el, rootRect);
        for (const box of elementBoxes) {
          boxes.push({
            ...box,
            index: box.index + indexOffset,
          });
        }
        indexOffset += elementBoxes.length;
      }
      return boxes;
    }

    function measureTextEntry(el, rootRect, fontEl = el) {
      const letters = glyphBoxesForElement(el, rootRect);
      return {
        box: letters.length > 0 ? unionRect(letters.map((letter) => letter.box)) : relRect(el.getBoundingClientRect(), rootRect),
        font: fontInfo(fontEl),
        letters,
      };
    }

    function measureTextEntryFromElements(elements, rootRect, fallbackEl, fontEl = fallbackEl) {
      const letters = glyphBoxesForElements(elements, rootRect);
      return {
        box: letters.length > 0 ? unionRect(letters.map((letter) => letter.box)) : relRect(fallbackEl.getBoundingClientRect(), rootRect),
        font: fontInfo(fontEl),
        letters,
      };
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

    function textOrEmpty(el, selector) {
      return (el?.querySelector(selector)?.textContent ?? "").trim();
    }

    function fragmentOwnerText(fragmentEl) {
      return (
        textOrEmpty(fragmentEl, ":scope > .header .name") ||
        textOrEmpty(fragmentEl, ":scope > .header .text-skin-fragment span") ||
        textOrEmpty(fragmentEl, ":scope > .header .text-skin-fragment")
      );
    }

    function visibleChildren(el) {
      return Array.from(el.children).filter((child) => getComputedStyle(child).display !== "none");
    }

    function textContentNormalized(el) {
      return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
    }

    function boxOrNull(box) {
      if (!box || box.w <= 0 || box.h <= 0) {
        return null;
      }
      return box;
    }

    function paintedBox(el, rootRect) {
      if (!el) {
        return null;
      }
      const shapeSelectors = "path, rect, circle, ellipse, polygon, polyline, line, use";
      const rects = [];
      for (const shape of el.querySelectorAll(shapeSelectors)) {
        const rect = relRect(shape.getBoundingClientRect(), rootRect);
        if (rect.w > 0 && rect.h > 0) {
          rects.push(rect);
        }
      }
      if (rects.length > 0) {
        return unionRect(rects);
      }
      return boxOrNull(relRect(el.getBoundingClientRect(), rootRect));
    }

    function topParticipantsByName(entries) {
      const ordered = [...entries].sort((a, b) => (a.participantBox.y - b.participantBox.y) || (a.participantBox.x - b.participantBox.x));
      const byName = new Map();
      for (const entry of ordered) {
        if (!entry.name || byName.has(entry.name)) {
          continue;
        }
        byName.set(entry.name, entry);
      }
      return Array.from(byName.values());
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
          const measured = measureTextEntry(labelEl, rootRect);
          labels.push({
            side: "html",
            kind: pair.kind,
            text,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }

      for (const conditionWrap of root.querySelectorAll(".fragment .segment > .text-skin-fragment:not(.finally)")) {
        const children = visibleChildren(conditionWrap);
        if (children.length === 0) continue;
        const text = children.map((child) => (child.textContent ?? "").trim()).join("").trim();
        if (!text) continue;
        const measured = measureTextEntryFromElements(children, rootRect, conditionWrap, children[0]);
        labels.push({
          side: "html",
          kind: "fragment-condition",
          text,
          ownerText: fragmentOwnerText(conditionWrap.closest(".fragment")) || null,
          box: measured.box,
          font: measured.font,
          letters: measured.letters,
        });
      }

      const sectionSelectors = [
        ".fragment.fragment-tcf .segment > .header.inline-block.bg-skin-frame.opacity-65",
        ".fragment.fragment-tcf .segment > .header.finally",
      ];
      for (const selector of sectionSelectors) {
        for (const sectionEl of root.querySelectorAll(selector)) {
          const children = visibleChildren(sectionEl);
          if (children.length === 0) continue;
          const text = children.map((child) => (child.textContent ?? "").trim()).join("").trim();
          if (!text) continue;
          const measured = measureTextEntryFromElements(children, rootRect, sectionEl, children[0]);
          labels.push({
            side: "html",
            kind: "fragment-section",
            text,
            ownerText: fragmentOwnerText(sectionEl.closest(".fragment")) || null,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
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
          const measured = measureTextEntry(labelEl, rootRect);
          labels.push({
            side: "svg",
            kind: pair.kind,
            text,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }

      for (const labelEl of root.querySelectorAll("g.fragment > text.fragment-condition")) {
        const text = (labelEl.textContent ?? "").trim();
        if (!text) continue;
        const measured = measureTextEntry(labelEl, rootRect);
        labels.push({
          side: "svg",
          kind: "fragment-condition",
          text,
          ownerText: textOrEmpty(labelEl.closest("g.fragment"), ":scope > text.fragment-label") || null,
          box: measured.box,
          font: measured.font,
          letters: measured.letters,
        });
      }

      for (const fragmentEl of root.querySelectorAll("g.fragment")) {
        for (const groupEl of fragmentEl.querySelectorAll(":scope > g")) {
          const conditionTextEls = Array.from(groupEl.querySelectorAll(":scope > text.fragment-condition"));
          if (conditionTextEls.length > 0) {
            const text = conditionTextEls.map((el) => (el.textContent ?? "").trim()).join("").replace(/\s+\]/g, "]").trim();
            if (!text) continue;
            const measured = measureTextEntryFromElements(conditionTextEls, rootRect, groupEl, conditionTextEls[0]);
            labels.push({
              side: "svg",
              kind: "fragment-condition",
              text,
              ownerText: textOrEmpty(fragmentEl, ":scope > text.fragment-label") || null,
              box: measured.box,
              font: measured.font,
              letters: measured.letters,
            });
            continue;
          }

          const textEls = Array.from(groupEl.querySelectorAll("text.fragment-section-label"));
          if (textEls.length === 0) continue;
          const text = textEls.map((el) => (el.textContent ?? "").trim()).join("").replace(/\s+\]/g, "]").trim();
          if (!text) continue;
          const measured = measureTextEntryFromElements(textEls, rootRect, groupEl, textEls[0]);
          labels.push({
            side: "svg",
            kind: text.startsWith("[") ? "fragment-condition" : "fragment-section",
            text,
            ownerText: textOrEmpty(fragmentEl, ":scope > text.fragment-label") || null,
            box: measured.box,
            font: measured.font,
            letters: measured.letters,
          });
        }
      }
      return labels;
    }

    function collectHtmlParticipants(root, rootRect) {
      const participants = [];
      for (const participantEl of root.querySelectorAll(".participant[data-participant-id]")) {
        const name = (participantEl.getAttribute("data-participant-id") ?? "").trim();
        if (!name) continue;
        const participantBox = boxOrNull(relRect(participantEl.getBoundingClientRect(), rootRect));
        if (!participantBox) continue;

        const rowEl = participantEl.querySelector(":scope > .flex.items-center.justify-center, :scope > div:last-child");
        const firstChild = rowEl?.firstElementChild ?? null;
        const iconHost = firstChild && (
          firstChild.matches("[aria-description]") ||
          firstChild.querySelector("svg") ||
          /\bh-6\b/.test(firstChild.className || "")
        )
          ? firstChild
          : null;
        const labelEl = Array.from(participantEl.querySelectorAll(".name")).at(-1) ?? null;
        const measuredLabel = labelEl ? measureTextEntry(labelEl, rootRect) : null;
        const iconPaintRoot = iconHost?.querySelector("svg") ?? iconHost;

        participants.push({
          side: "html",
          name,
          labelText: textContentNormalized(labelEl),
          participantBox,
          labelBox: measuredLabel?.box ?? null,
          labelFont: measuredLabel?.font ?? null,
          labelLetters: measuredLabel?.letters ?? [],
          iconBox: paintedBox(iconPaintRoot, rootRect),
          anchorKind: measuredLabel?.box ? "label" : "participant-box",
          anchorBox: measuredLabel?.box ?? participantBox,
        });
      }
      return topParticipantsByName(participants);
    }

    function collectSvgParticipants(root, rootRect) {
      const participants = [];
      for (const participantEl of root.querySelectorAll("g.participant[data-participant]")) {
        if (participantEl.classList.contains("participant-bottom")) {
          continue;
        }
        const name = (participantEl.getAttribute("data-participant") ?? "").trim();
        if (!name) continue;
        const participantBoxEl = participantEl.querySelector(":scope > rect.participant-box");
        const participantBox = boxOrNull(strokedElementOuterRect(participantBoxEl || participantEl, rootRect));
        if (!participantBox) continue;

        const labelEl = participantEl.querySelector(":scope > text.participant-label");
        const measuredLabel = labelEl ? measureTextEntry(labelEl, rootRect) : null;
        const iconEl = participantEl.querySelector(":scope > g[transform]");

        participants.push({
          side: "svg",
          name,
          labelText: textContentNormalized(labelEl),
          participantBox,
          labelBox: measuredLabel?.box ?? null,
          labelFont: measuredLabel?.font ?? null,
          labelLetters: measuredLabel?.letters ?? [],
          iconBox: paintedBox(iconEl, rootRect),
          anchorKind: measuredLabel?.box ? "label" : "participant-box",
          anchorBox: measuredLabel?.box ?? participantBox,
        });
      }
      return topParticipantsByName(participants);
    }

    function collectHtmlArrows(root, rootRect) {
      const arrows = [];

      function addArrow(kind, interaction, text, parts) {
        if (!text || parts.length === 0) return;
        const box = unionRect(parts.map((part) => part.box));
        const labelText = (interaction.getAttribute("data-signature") || "").trim();
        arrows.push({
          side: "html",
          kind,
          text,
          pairText: labelText || text,
          box,
          ...arrowEndpointsFromBox(box),
          labelText,
        });
      }

      for (const interaction of root.querySelectorAll(".interaction:not(.return):not(.creation):not(.self-invocation):not(.self)")) {
        const text = (interaction.querySelector(":scope > .message > .absolute.text-xs")?.textContent || "").trim()
          || (interaction.getAttribute("data-signature") || "").trim();
        const messageEl = interaction.querySelector(":scope > .message");
        if (!messageEl) continue;
        const svgChildren = Array.from(messageEl.children).filter((child) => child.tagName?.toLowerCase() === "svg");
        const parts = [];
        if (svgChildren[0]) {
          parts.push({ part: "line", box: relRect(svgChildren[0].getBoundingClientRect(), rootRect) });
        }
        if (svgChildren[1]) {
          parts.push({ part: "head", box: relRect(svgChildren[1].getBoundingClientRect(), rootRect) });
        }
        addArrow("message", interaction, text, parts);
      }

      for (const interaction of root.querySelectorAll(".interaction.return")) {
        const text = (interaction.querySelector(":scope > .message > .absolute.text-xs")?.textContent || "").trim()
          || (interaction.getAttribute("data-signature") || "").trim();
        const messageEl = interaction.querySelector(":scope > .message");
        if (!messageEl) continue;
        const svgChildren = Array.from(messageEl.children).filter((child) => child.tagName?.toLowerCase() === "svg");
        const parts = [];
        if (svgChildren[0]) {
          parts.push({ part: "line", box: relRect(svgChildren[0].getBoundingClientRect(), rootRect) });
        }
        if (svgChildren[1]) {
          parts.push({ part: "head", box: relRect(svgChildren[1].getBoundingClientRect(), rootRect) });
        }
        addArrow("return", interaction, text, parts);
      }

      for (const interaction of root.querySelectorAll(".interaction.self, .interaction.self-invocation")) {
        const text = (interaction.querySelector(":scope > .message .absolute.text-xs, :scope > .self-invocation .absolute.text-xs")?.textContent || "").trim()
          || (interaction.getAttribute("data-signature") || "").trim();
        const arrowSvg = interaction.querySelector(":scope > .message > svg.arrow, :scope > .self-invocation > svg.arrow");
        if (!arrowSvg) continue;
        const parts = [];
        pushBox(parts, "loop", elementRect(arrowSvg.querySelector(":scope > path, :scope > polyline"), rootRect));
        pushBox(parts, "head", elementRect(arrowSvg.querySelector(":scope > g path, :scope > g polyline"), rootRect));
        if (parts.length === 0) {
          pushBox(parts, "loop", elementRect(arrowSvg, rootRect));
        }
        addArrow("self", interaction, text, parts);
      }

      return arrows;
    }

    function collectSvgArrows(root, rootRect) {
      const arrows = [];

      function addArrow(kind, group, text, parts) {
        if (!text || parts.length === 0) return;
        const box = unionRect(parts.map((part) => part.box));
        const labelText = (group.querySelector("text.message-label, text.return-label")?.textContent || "").trim();
        arrows.push({
          side: "svg",
          kind,
          text,
          pairText: labelText || text,
          box,
          ...arrowEndpointsFromBox(box),
          labelText,
        });
      }

      for (const group of root.querySelectorAll("g.message:not(.self-call)")) {
        const text = (group.querySelector("text.seq-number")?.textContent || "").trim()
          || (group.querySelector("text.message-label")?.textContent || "").trim();
        const parts = [];
        const lineEl = group.querySelector(":scope > line.message-line");
        const headEl = group.querySelector(":scope > svg.arrow-head");
        if (lineEl) parts.push({ part: "line", box: relRect(lineEl.getBoundingClientRect(), rootRect) });
        if (headEl) parts.push({ part: "head", box: relRect(headEl.getBoundingClientRect(), rootRect) });
        addArrow("message", group, text, parts);
      }

      for (const group of root.querySelectorAll("g.return")) {
        const text = (group.querySelector("text.seq-number")?.textContent || "").trim()
          || (group.querySelector("text.return-label")?.textContent || "").trim();
        const parts = [];
        const lineEl = group.querySelector(":scope > line.return-line");
        const headEl = group.querySelector(":scope > polyline.return-arrow");
        if (lineEl) parts.push({ part: "line", box: relRect(lineEl.getBoundingClientRect(), rootRect) });
        if (headEl) parts.push({ part: "head", box: relRect(headEl.getBoundingClientRect(), rootRect) });
        addArrow("return", group, text, parts);
      }

      for (const group of root.querySelectorAll("g.message.self-call")) {
        const text = (group.querySelector("text.seq-number")?.textContent || "").trim()
          || (group.querySelector("text.message-label")?.textContent || "").trim();
        const loopEl = group.querySelector(":scope > svg");
        if (!loopEl) continue;
        const parts = [];
        pushBox(parts, "loop", elementRect(loopEl.querySelector(":scope > path, :scope > polyline"), rootRect));
        pushBox(parts, "head", elementRect(loopEl.querySelector(":scope > g path, :scope > g polyline"), rootRect));
        if (parts.length === 0) {
          const loopRect = loopEl.getBoundingClientRect();
          const attrW = parseFloat(loopEl.getAttribute("width"));
          const attrH = parseFloat(loopEl.getAttribute("height"));
          const box = relRect(loopRect, rootRect);
          if (attrW && attrH) {
            box.w = attrW;
            box.h = attrH;
          }
          pushBox(parts, "loop", box);
        }
        addArrow("self", group, text, parts);
      }

      return arrows;
    }

    function collectHtmlNumbers(root, rootRect) {
      const numbers = [];
      const selectorPairs = [
        {
          kind: "message",
          selector:
            ".interaction:not(.return):not(.creation):not(.self-invocation):not(.self) > .message > .absolute.text-xs",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest(".interaction"), ":scope > .message .editable-span-base"),
        },
        {
          kind: "self",
          selector:
            ".interaction.self-invocation > .message .absolute.text-xs, .interaction.self > .self-invocation .absolute.text-xs",
          ownerText: (numberEl) =>
            textOrEmpty(numberEl.closest(".interaction"), ":scope > .message .editable-span-base, :scope > .self-invocation .editable-span-base"),
        },
        {
          kind: "return",
          selector:
            ".interaction.return > .message > .absolute.text-xs",
          ownerText: (numberEl) =>
            textOrEmpty(numberEl.closest(".interaction"), ":scope > .message .editable-span-base, :scope > .message .name"),
        },
        {
          kind: "fragment",
          selector:
            ".fragment > .header > .absolute.text-xs",
          ownerText: (numberEl) => fragmentOwnerText(numberEl.closest(".fragment")),
        },
      ];

      for (const pair of selectorPairs) {
        for (const numberEl of root.querySelectorAll(pair.selector)) {
          const text = (numberEl.textContent ?? "").trim();
          if (!text) continue;
          numbers.push({
            side: "html",
            kind: pair.kind,
            text,
            pairText: pair.ownerText ? pair.ownerText(numberEl) || text : text,
            ownerText: pair.ownerText ? pair.ownerText(numberEl) || null : null,
            box: relRect(numberEl.getBoundingClientRect(), rootRect),
            font: fontInfo(numberEl),
            letters: glyphBoxesForElement(numberEl, rootRect),
          });
        }
      }
      return numbers;
    }

    function collectSvgNumbers(root, rootRect) {
      const numbers = [];
      const pairs = [
        {
          selector: "g.message:not(.self-call) > text.seq-number",
          kind: "message",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.message"), ":scope > text.message-label"),
        },
        {
          selector: "g.message.self-call > text.seq-number",
          kind: "self",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.message"), ":scope > text.message-label"),
        },
        {
          selector: "g.return > text.seq-number",
          kind: "return",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.return"), ":scope > text.return-label"),
        },
        {
          selector: "g.fragment > text.seq-number",
          kind: "fragment",
          ownerText: (numberEl) => textOrEmpty(numberEl.closest("g.fragment"), ":scope > text.fragment-label"),
        },
      ];
      for (const pair of pairs) {
        for (const numberEl of root.querySelectorAll(pair.selector)) {
          const text = (numberEl.textContent ?? "").trim();
          if (!text) continue;
          numbers.push({
            side: "svg",
            kind: pair.kind,
            text,
            pairText: pair.ownerText ? pair.ownerText(numberEl) || text : text,
            ownerText: pair.ownerText ? pair.ownerText(numberEl) || null : null,
            box: relRect(numberEl.getBoundingClientRect(), rootRect),
            font: fontInfo(numberEl),
            letters: glyphBoxesForElement(numberEl, rootRect),
          });
        }
      }
      return numbers;
    }

    const prepared = typeof window.prepareHtmlForCapture === "function"
      ? window.prepareHtmlForCapture()
      : null;
    const htmlOutput = document.getElementById("html-output");
    const htmlRoot = htmlOutput.querySelector(".frame") || htmlOutput.querySelector(".sequence-diagram") || htmlOutput;
    const svgRoot = document.querySelector("#svg-output > svg") || document.querySelector("#svg-output svg");
    const htmlRootRect = htmlRoot.getBoundingClientRect();
    const svgRootRect = svgRoot.getBoundingClientRect();
    const svgFrameBorderEl = svgRoot.querySelector("rect.frame-border-inner, rect.frame-border, rect.frame-box");

    return {
      caseName: new URLSearchParams(window.location.search).get("case") || "",
      htmlRootSelector: htmlOutput.querySelector(".frame") ? "#html-output .frame" : "#html-output .sequence-diagram",
      svgRootSelector: "#svg-output > svg",
      prepared: Boolean(prepared),
      htmlRoot: { width: htmlRootRect.width, height: htmlRootRect.height },
      svgRoot: { width: svgRootRect.width, height: svgRootRect.height },
      htmlRootBox: { x: 0, y: 0, w: htmlRootRect.width, h: htmlRootRect.height },
      svgRootBox: { x: 0, y: 0, w: svgRootRect.width, h: svgRootRect.height },
      svgFrameBorderBox: boxOrNull(strokedElementOuterRect(svgFrameBorderEl, svgRootRect)),
      htmlLabels: collectHtmlLabels(htmlRoot, htmlRootRect),
      svgLabels: collectSvgLabels(svgRoot, svgRootRect),
      htmlNumbers: collectHtmlNumbers(htmlRoot, htmlRootRect),
      svgNumbers: collectSvgNumbers(svgRoot, svgRootRect),
      htmlArrows: collectHtmlArrows(htmlRoot, htmlRootRect),
      svgArrows: collectSvgArrows(svgRoot, svgRootRect),
      htmlParticipants: collectHtmlParticipants(htmlRoot, htmlRootRect),
      svgParticipants: collectSvgParticipants(svgRoot, svgRootRect),
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

function buildSection(htmlItems, svgItems, diffImage) {
  const pairs = pairLabels(htmlItems, svgItems);
  const section = [];

  for (const pair of pairs) {
    const base = pair.html || pair.svg;
    const key = {
      kind: base?.kind ?? "message",
      text: base?.text ?? "",
      y_order: base?.yOrder ?? 0,
    };

    if (!pair.html || !pair.svg) {
      section.push({
        key,
        status: "ambiguous",
        html_text: pair.html?.text ?? null,
        svg_text: pair.svg?.text ?? null,
        owner_text: pair.html?.ownerText ?? pair.svg?.ownerText ?? null,
        html_box: pair.html ? pair.html.box : null,
        svg_box: pair.svg ? pair.svg.box : null,
        font: {
          html: pair.html?.font ?? null,
          svg: pair.svg?.font ?? null,
        },
        letters: [],
        reason: "item missing on one side",
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
    section.push({
      key,
      status,
      html_text: pair.html.text,
      svg_text: pair.svg.text,
      owner_text: pair.html.ownerText ?? pair.svg.ownerText ?? null,
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

  return section;
}

function scoreArrowGeometry(htmlArrow, svgArrow, diffImage, kind = htmlArrow.kind ?? svgArrow.kind ?? "message") {
  const leftDx = svgArrow.left_x - htmlArrow.left_x;
  const rightDx = svgArrow.right_x - htmlArrow.right_x;
  const widthDx = svgArrow.width - htmlArrow.width;
  const topDy = svgArrow.box.y - htmlArrow.box.y;
  const bottomDy = rectBottom(svgArrow.box) - rectBottom(htmlArrow.box);
  const heightDy = svgArrow.box.h - htmlArrow.box.h;
  const slot = {
    x: Math.min(htmlArrow.box.x, svgArrow.box.x) - 2,
    y: Math.min(htmlArrow.box.y, svgArrow.box.y) - 2,
    w: Math.max(rectRight(htmlArrow.box), rectRight(svgArrow.box)) - Math.min(htmlArrow.box.x, svgArrow.box.x) + 4,
    h: Math.max(rectBottom(htmlArrow.box), rectBottom(svgArrow.box)) - Math.min(htmlArrow.box.y, svgArrow.box.y) + 4,
  };
  const diff = analyzeDiffSlot(diffImage, slot);
  const centroidDx = diff.redCentroid && diff.blueCentroid ? diff.blueCentroid.x - diff.redCentroid.x : null;
  const centroidDy = diff.redCentroid && diff.blueCentroid ? diff.blueCentroid.y - diff.redCentroid.y : null;
  const nearZero = Math.abs(leftDx) < 0.75 && Math.abs(rightDx) < 0.75;
  const nearZeroSelf = nearZero && Math.abs(topDy) < 0.75 && Math.abs(bottomDy) < 0.75 && Math.abs(heightDy) < 0.75;
  const enoughDiffPixels = diff.redCount >= 6 && diff.blueCount >= 6;
  const dominantDx = Math.abs(rightDx) >= Math.abs(leftDx) ? rightDx : leftDx;
  const dominantDy = [topDy, bottomDy, heightDy].reduce((dominant, value) => (
    Math.abs(value) > Math.abs(dominant) ? value : dominant
  ), 0);
  const xConsistent = centroidDx === null || Math.abs(dominantDx) < 0.75 || Math.sign(centroidDx) === Math.sign(dominantDx);
  const yConsistent = centroidDy === null || Math.abs(dominantDy) < 0.75 || Math.sign(centroidDy) === Math.sign(dominantDy);
  const overlap = iou(htmlArrow.box, svgArrow.box);
  const status = kind === "self"
    ? (nearZeroSelf || (enoughDiffPixels && xConsistent && yConsistent) || Math.abs(dominantDx) >= 0.75 || Math.abs(dominantDy) >= 0.75 ? "ok" : "ambiguous")
    : (nearZero || (enoughDiffPixels && xConsistent) || Math.abs(dominantDx) >= 0.75 ? "ok" : "ambiguous");
  const confidence = round(Math.min(1, overlap * 0.45 + (enoughDiffPixels ? 0.55 : 0.2)), 3);

  return {
    status,
    left_dx: status === "ok" ? normalizeOffset(leftDx) : null,
    right_dx: status === "ok" ? normalizeOffset(rightDx) : null,
    width_dx: status === "ok" ? normalizeOffset(widthDx) : null,
    top_dy: kind === "self" && status === "ok" ? normalizeOffset(topDy) : null,
    bottom_dy: kind === "self" && status === "ok" ? normalizeOffset(bottomDy) : null,
    height_dy: kind === "self" && status === "ok" ? normalizeOffset(heightDy) : null,
    confidence,
    html_box: {
      x: round(htmlArrow.box.x),
      y: round(htmlArrow.box.y),
      w: round(htmlArrow.box.w),
      h: round(htmlArrow.box.h),
    },
    svg_box: {
      x: round(svgArrow.box.x),
      y: round(svgArrow.box.y),
      w: round(svgArrow.box.w),
      h: round(svgArrow.box.h),
    },
    evidence: {
      left_dx: normalizeOffset(leftDx),
      right_dx: normalizeOffset(rightDx),
      width_dx: normalizeOffset(widthDx),
      top_dy: normalizeOffset(topDy),
      bottom_dy: normalizeOffset(bottomDy),
      height_dy: normalizeOffset(heightDy),
      overlap: round(overlap, 3),
      diff_red: diff.redCount,
      diff_blue: diff.blueCount,
      diff_centroid_dx: centroidDx === null ? null : round(centroidDx),
      diff_centroid_dy: centroidDy === null ? null : round(centroidDy),
    },
  };
}

function buildArrowSection(htmlItems, svgItems, diffImage) {
  const htmlOrdered = enrichOrdering(htmlItems);
  const svgOrdered = enrichOrdering(svgItems);
  const htmlMap = new Map(htmlOrdered.map((item) => [keyForLabel(item), item]));
  const svgMap = new Map(svgOrdered.map((item) => [keyForLabel(item), item]));
  const allKeys = Array.from(new Set([...htmlMap.keys(), ...svgMap.keys()]));
  const arrows = [];

  for (const key of allKeys) {
    const html = htmlMap.get(key) || null;
    const svg = svgMap.get(key) || null;
    const base = html || svg;
    const arrow = {
      key: {
        kind: base?.kind ?? "message",
        text: base?.text ?? "",
        y_order: base?.yOrder ?? 0,
      },
      status: "ambiguous",
    };

    if (!html || !svg) {
      arrow.reason = "arrow missing on one side";
      arrows.push(arrow);
      continue;
    }

    const scored = scoreArrowGeometry(html, svg, diffImage, base?.kind);
    arrows.push({
      ...arrow,
      ...scored,
      label_text: base?.labelText ?? null,
    });
  }

  return arrows;
}

function participantsWithIcons(htmlParticipants, svgParticipants) {
  const htmlMap = new Map(htmlParticipants.map((participant) => [participant.name, participant]));
  const svgMap = new Map(svgParticipants.map((participant) => [participant.name, participant]));
  const byName = new Map();
  for (const participant of [...htmlParticipants, ...svgParticipants]) {
    if (!participant.name || !participant.iconBox) {
      continue;
    }
    const html = htmlMap.get(participant.name) || null;
    const svg = svgMap.get(participant.name) || null;
    const hasLabel = Boolean(html?.labelText || svg?.labelText);
    if (!hasLabel && participant.name === "_STARTER_") {
      continue;
    }
    byName.set(participant.name, true);
  }
  return Array.from(byName.keys()).sort((a, b) => a.localeCompare(b));
}

function buildParticipantLabelItems(participants, iconNames) {
  const include = new Set(iconNames);
  return participants
    .filter((participant) => include.has(participant.name) && participant.labelText && participant.labelBox)
    .map((participant) => ({
      side: participant.side,
      kind: "participant",
      text: participant.labelText,
      pairText: participant.name,
      ownerText: participant.name,
      box: participant.labelBox,
      font: participant.labelFont,
      letters: participant.labelLetters,
    }));
}

function scoreParticipantIcon(htmlParticipant, svgParticipant, diffImage) {
  const iconPresentHtml = Boolean(htmlParticipant?.iconBox);
  const iconPresentSvg = Boolean(svgParticipant?.iconBox);
  const base = htmlParticipant || svgParticipant;
  const participant = {
    name: base?.name ?? "",
    label_text: htmlParticipant?.labelText || svgParticipant?.labelText || null,
    presence: {
      html: iconPresentHtml,
      svg: iconPresentSvg,
    },
    anchor_kind: htmlParticipant?.anchorKind || svgParticipant?.anchorKind || null,
    status: "ambiguous",
  };

  if (!iconPresentHtml || !iconPresentSvg) {
    participant.reason = "icon missing on one side";
    return participant;
  }

  const htmlIconCenter = rectCenter(htmlParticipant.iconBox);
  const svgIconCenter = rectCenter(svgParticipant.iconBox);
  const htmlAnchorCenter = rectCenter(htmlParticipant.anchorBox);
  const svgAnchorCenter = rectCenter(svgParticipant.anchorBox);
  const directDx = svgIconCenter.x - htmlIconCenter.x;
  const directDy = svgIconCenter.y - htmlIconCenter.y;
  const relativeDx = (svgIconCenter.x - svgAnchorCenter.x) - (htmlIconCenter.x - htmlAnchorCenter.x);
  const relativeDy = (svgIconCenter.y - svgAnchorCenter.y) - (htmlIconCenter.y - htmlAnchorCenter.y);
  const slot = {
    x: Math.min(htmlParticipant.iconBox.x, svgParticipant.iconBox.x) - 2,
    y: Math.min(htmlParticipant.iconBox.y, svgParticipant.iconBox.y) - 2,
    w: Math.max(rectRight(htmlParticipant.iconBox), rectRight(svgParticipant.iconBox)) - Math.min(htmlParticipant.iconBox.x, svgParticipant.iconBox.x) + 4,
    h: Math.max(rectBottom(htmlParticipant.iconBox), rectBottom(svgParticipant.iconBox)) - Math.min(htmlParticipant.iconBox.y, svgParticipant.iconBox.y) + 4,
  };
  const diff = analyzeDiffSlot(diffImage, slot);
  const centroidDx = diff.redCentroid && diff.blueCentroid ? diff.blueCentroid.x - diff.redCentroid.x : null;
  const centroidDy = diff.redCentroid && diff.blueCentroid ? diff.blueCentroid.y - diff.redCentroid.y : null;
  const nearZero = Math.abs(directDx) < 0.75
    && Math.abs(directDy) < 0.75
    && Math.abs(relativeDx) < 0.75
    && Math.abs(relativeDy) < 0.75;
  const enoughDiffPixels = diff.redCount >= 6 && diff.blueCount >= 6;
  const xConsistent = centroidDx === null || Math.abs(directDx) < 0.75 || Math.sign(centroidDx) === Math.sign(directDx);
  const yConsistent = centroidDy === null || Math.abs(directDy) < 0.75 || Math.sign(centroidDy) === Math.sign(directDy);
  const overlap = iou(htmlParticipant.iconBox, svgParticipant.iconBox);
  const status = nearZero
    ? (overlap >= 0.15 ? "ok" : "ambiguous")
    : ((enoughDiffPixels && xConsistent && yConsistent)
      || Math.abs(directDx) >= 0.75
      || Math.abs(directDy) >= 0.75
      || Math.abs(relativeDx) >= 0.75
      || Math.abs(relativeDy) >= 0.75
      ? "ok"
      : "ambiguous");
  const confidence = round(Math.min(1, overlap * 0.45 + (enoughDiffPixels ? 0.55 : 0.2)), 3);

  return {
    ...participant,
    status,
    icon_dx: status === "ok" ? normalizeOffset(directDx) : null,
    icon_dy: status === "ok" ? normalizeOffset(directDy) : null,
    relative_dx: status === "ok" ? normalizeOffset(relativeDx) : null,
    relative_dy: status === "ok" ? normalizeOffset(relativeDy) : null,
    confidence,
    html_icon_box: {
      x: round(htmlParticipant.iconBox.x),
      y: round(htmlParticipant.iconBox.y),
      w: round(htmlParticipant.iconBox.w),
      h: round(htmlParticipant.iconBox.h),
    },
    svg_icon_box: {
      x: round(svgParticipant.iconBox.x),
      y: round(svgParticipant.iconBox.y),
      w: round(svgParticipant.iconBox.w),
      h: round(svgParticipant.iconBox.h),
    },
    html_anchor_box: {
      x: round(htmlParticipant.anchorBox.x),
      y: round(htmlParticipant.anchorBox.y),
      w: round(htmlParticipant.anchorBox.w),
      h: round(htmlParticipant.anchorBox.h),
    },
    svg_anchor_box: {
      x: round(svgParticipant.anchorBox.x),
      y: round(svgParticipant.anchorBox.y),
      w: round(svgParticipant.anchorBox.w),
      h: round(svgParticipant.anchorBox.h),
    },
    evidence: {
      icon_dx: normalizeOffset(directDx),
      icon_dy: normalizeOffset(directDy),
      relative_dx: normalizeOffset(relativeDx),
      relative_dy: normalizeOffset(relativeDy),
      overlap: round(overlap, 3),
      diff_red: diff.redCount,
      diff_blue: diff.blueCount,
      diff_centroid_dx: centroidDx === null ? null : round(centroidDx),
      diff_centroid_dy: centroidDy === null ? null : round(centroidDy),
    },
  };
}

function buildParticipantIconSection(htmlParticipants, svgParticipants, diffImage) {
  const names = participantsWithIcons(htmlParticipants, svgParticipants);
  const htmlMap = new Map(htmlParticipants.map((participant) => [participant.name, participant]));
  const svgMap = new Map(svgParticipants.map((participant) => [participant.name, participant]));
  return names.map((name) => scoreParticipantIcon(htmlMap.get(name) || null, svgMap.get(name) || null, diffImage));
}

function participantNames(htmlParticipants, svgParticipants) {
  return Array.from(
    new Set(
      [...htmlParticipants, ...svgParticipants]
        .map((participant) => participant.name)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function scoreParticipantBox(htmlParticipant, svgParticipant) {
  const base = htmlParticipant || svgParticipant;
  const item = {
    name: base?.name ?? "",
    status: "ambiguous",
  };

  if (!htmlParticipant?.participantBox || !svgParticipant?.participantBox) {
    item.reason = "participant box missing on one side";
    return item;
  }

  const dx = svgParticipant.participantBox.x - htmlParticipant.participantBox.x;
  const dy = svgParticipant.participantBox.y - htmlParticipant.participantBox.y;
  const dw = svgParticipant.participantBox.w - htmlParticipant.participantBox.w;
  const dh = svgParticipant.participantBox.h - htmlParticipant.participantBox.h;

  return {
    ...item,
    status: "ok",
    dx: normalizeOffset(dx),
    dy: normalizeOffset(dy),
    dw: normalizeOffset(dw),
    dh: normalizeOffset(dh),
    html_box: {
      x: round(htmlParticipant.participantBox.x),
      y: round(htmlParticipant.participantBox.y),
      w: round(htmlParticipant.participantBox.w),
      h: round(htmlParticipant.participantBox.h),
    },
    svg_box: {
      x: round(svgParticipant.participantBox.x),
      y: round(svgParticipant.participantBox.y),
      w: round(svgParticipant.participantBox.w),
      h: round(svgParticipant.participantBox.h),
    },
  };
}

function buildParticipantBoxSection(htmlParticipants, svgParticipants) {
  const names = participantNames(htmlParticipants, svgParticipants);
  const htmlMap = new Map(htmlParticipants.map((participant) => [participant.name, participant]));
  const svgMap = new Map(svgParticipants.map((participant) => [participant.name, participant]));
  return names.map((name) => scoreParticipantBox(htmlMap.get(name) || null, svgMap.get(name) || null));
}

function scopePriority(category) {
  switch (category) {
    case "participant-icon":
      return 8;
    case "label":
    case "number":
    case "participant-label":
      return 7;
    case "arrow":
      return 6;
    case "participant-box":
      return 5;
    case "frame-border":
      return 2;
    case "diagram-root":
      return 1;
    default:
      return 0;
  }
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rectRight(rect) && point.y >= rect.y && point.y <= rectBottom(rect);
}

function distanceToRect(point, rect) {
  const dx = point.x < rect.x ? rect.x - point.x : point.x > rectRight(rect) ? point.x - rectRight(rect) : 0;
  const dy = point.y < rect.y ? rect.y - point.y : point.y > rectBottom(rect) ? point.y - rectBottom(rect) : 0;
  return Math.hypot(dx, dy);
}

function formatScopeName(item) {
  if (item.owner_text && item.text && item.owner_text !== item.text) {
    return `${item.owner_text}:${item.text}`;
  }
  return item.name ?? item.text ?? item.kind ?? item.category ?? "unknown";
}

function buildScopeItems(side, extracted) {
  const items = [];

  function push(category, name, box, extra = {}) {
    if (!box || box.w <= 0 || box.h <= 0) {
      return;
    }
    items.push({
      side,
      category,
      name,
      box,
      ...extra,
    });
  }

  const sideKey = side === "html" ? "html" : "svg";
  const labels = side === "html" ? extracted.htmlLabels : extracted.svgLabels;
  const numbers = side === "html" ? extracted.htmlNumbers : extracted.svgNumbers;
  const arrows = side === "html" ? extracted.htmlArrows : extracted.svgArrows;
  const participants = side === "html" ? extracted.htmlParticipants : extracted.svgParticipants;

  for (const label of labels) {
    push("label", formatScopeName(label), label.box, {
      kind: label.kind,
      text: label.text,
      owner_text: label.ownerText ?? null,
    });
  }
  for (const number of numbers) {
    push("number", formatScopeName(number), number.box, {
      kind: number.kind,
      text: number.text,
      owner_text: number.ownerText ?? null,
    });
  }
  for (const arrow of arrows) {
    push("arrow", formatScopeName(arrow), arrow.box, {
      kind: arrow.kind,
      text: arrow.text,
      owner_text: arrow.labelText ?? null,
    });
  }
  for (const participant of participants) {
    push("participant-box", participant.name, participant.participantBox, {
      kind: "participant",
      text: participant.labelText ?? participant.name,
      owner_text: participant.name,
    });
    push("participant-label", participant.name, participant.labelBox, {
      kind: "participant",
      text: participant.labelText ?? participant.name,
      owner_text: participant.name,
    });
    push("participant-icon", participant.name, participant.iconBox, {
      kind: "participant",
      text: participant.labelText ?? participant.name,
      owner_text: participant.name,
    });
  }

  if (sideKey === "html") {
    push("diagram-root", "html-root", extracted.htmlRootBox, { kind: "root" });
  } else {
    push("frame-border", "frame-border", extracted.svgFrameBorderBox, { kind: "frame" });
    push("diagram-root", "svg-root", extracted.svgRootBox, { kind: "root" });
  }

  return items;
}

function buildDiffClusters(diffImage, targetClass) {
  const visited = new Uint8Array(diffImage.width * diffImage.height);
  const clusters = [];
  const offsets = [-1, 0, 1, 0, -1];

  for (let index = 0; index < diffImage.classData.length; index++) {
    if (visited[index] || diffImage.classData[index] !== targetClass) {
      continue;
    }
    visited[index] = 1;
    const queue = [index];
    let head = 0;
    let size = 0;
    let sumX = 0;
    let sumY = 0;
    let left = diffImage.width;
    let top = diffImage.height;
    let right = -1;
    let bottom = -1;

    while (head < queue.length) {
      const current = queue[head++];
      const x = current % diffImage.width;
      const y = Math.floor(current / diffImage.width);
      size++;
      sumX += x + 0.5;
      sumY += y + 0.5;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);

      for (let dir = 0; dir < 4; dir++) {
        const nx = x + offsets[dir];
        const ny = y + offsets[dir + 1];
        if (nx < 0 || nx >= diffImage.width || ny < 0 || ny >= diffImage.height) {
          continue;
        }
        const nextIndex = ny * diffImage.width + nx;
        if (visited[nextIndex] || diffImage.classData[nextIndex] !== targetClass) {
          continue;
        }
        visited[nextIndex] = 1;
        queue.push(nextIndex);
      }
    }

    clusters.push({
      class: targetClass === 2 ? "html-only" : "svg-only",
      size,
      bbox: {
        x: left,
        y: top,
        w: right - left + 1,
        h: bottom - top + 1,
      },
      centroid: {
        x: sumX / size,
        y: sumY / size,
      },
    });
  }

  return clusters.sort((a, b) => b.size - a.size);
}

function pickScopeTarget(cluster, items) {
  const centroid = cluster.centroid;
  let best = null;
  let bestScore = -Infinity;

  for (const item of items) {
    const contains = pointInRect(centroid, item.box);
    const distance = distanceToRect(centroid, item.box);
    const overlap = intersectionArea(cluster.bbox, item.box);
    const score = (contains ? 10000 : 0)
      + overlap * 10
      - distance * 100
      + scopePriority(item.category) * 1000
      - area(item.box) * 0.01;

    if (score > bestScore) {
      bestScore = score;
      best = {
        category: item.category,
        name: item.name,
        kind: item.kind ?? null,
        text: item.text ?? null,
        owner_text: item.owner_text ?? null,
        contains_centroid: contains,
        overlap_area: round(overlap),
        distance: round(distance),
        box: {
          x: round(item.box.x),
          y: round(item.box.y),
          w: round(item.box.w),
          h: round(item.box.h),
        },
      };
    }
  }

  return best;
}

function buildResidualScopes(extracted, diffImage) {
  const htmlItems = buildScopeItems("html", extracted);
  const svgItems = buildScopeItems("svg", extracted);
  const clusters = [
    ...buildDiffClusters(diffImage, 2),
    ...buildDiffClusters(diffImage, 3),
  ].sort((a, b) => b.size - a.size);

  const residualScopes = clusters.map((cluster, index) => ({
    rank: index + 1,
    class: cluster.class,
    size: cluster.size,
    centroid: {
      x: round(cluster.centroid.x),
      y: round(cluster.centroid.y),
    },
    bbox: {
      x: round(cluster.bbox.x),
      y: round(cluster.bbox.y),
      w: round(cluster.bbox.w),
      h: round(cluster.bbox.h),
    },
    html_target: pickScopeTarget(cluster, htmlItems),
    svg_target: pickScopeTarget(cluster, svgItems),
  }));

  const byClass = residualScopes.reduce((acc, scope) => {
    acc[scope.class] = acc[scope.class] || [];
    acc[scope.class].push(scope);
    return acc;
  }, {});

  return {
    scopes: residualScopes,
    summary: residualScopes.slice(0, 20).map((scope) => formatResidualScopeSummary(scope)),
    html_only_top: (byClass["html-only"] || []).slice(0, 10),
    svg_only_top: (byClass["svg-only"] || []).slice(0, 10),
  };
}

function buildReport(caseName, extracted, diffImage) {
  const {
    htmlLabels,
    svgLabels,
    htmlNumbers,
    svgNumbers,
    htmlArrows,
    svgArrows,
    htmlParticipants,
    svgParticipants,
  } = extracted;
  const iconNames = participantsWithIcons(htmlParticipants, svgParticipants);
  const htmlParticipantLabels = buildParticipantLabelItems(htmlParticipants, iconNames);
  const svgParticipantLabels = buildParticipantLabelItems(svgParticipants, iconNames);
  const labels = buildSection(htmlLabels, svgLabels, diffImage);
  const numbers = buildSection(htmlNumbers, svgNumbers, diffImage);
  const arrows = buildArrowSection(htmlArrows, svgArrows, diffImage);
  const participantLabels = buildSection(htmlParticipantLabels, svgParticipantLabels, diffImage);
  const participantIcons = buildParticipantIconSection(htmlParticipants, svgParticipants, diffImage);
  const participantBoxes = buildParticipantBoxSection(htmlParticipants, svgParticipants);
  const residualScopes = buildResidualScopes(extracted, diffImage);
  return {
    case: caseName,
    labels,
    numbers,
    arrows,
    participant_labels: participantLabels,
    participant_icons: participantIcons,
    participant_boxes: participantBoxes,
    residual_scopes: residualScopes.scopes,
    summary: labels.map((label) => formatSectionSummary("label", label)),
    number_summary: numbers.map((number) => formatSectionSummary("number", number)),
    arrow_summary: arrows.map((arrow) => `arrow:${arrow.key.text} -> ${formatArrowSummary(arrow)}`),
    participant_label_summary: participantLabels.map((label) => formatSectionSummary("participant-label", label)),
    participant_icon_summary: participantIcons.map((icon) => formatParticipantIconSummary(icon)),
    participant_box_summary: participantBoxes.map((box) => formatParticipantBoxSummary(box)),
    residual_scope_summary: residualScopes.summary,
    residual_scope_html_only_top: residualScopes.html_only_top,
    residual_scope_svg_only_top: residualScopes.svg_only_top,
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
    const report = buildReport(extracted.caseName || args.caseName, extracted, diffImage);
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
      process.stdout.write(`${report.number_summary.join("\n")}\n`);
      process.stdout.write(`${report.arrow_summary.join("\n")}\n`);
      process.stdout.write(`${report.participant_label_summary.join("\n")}\n`);
      process.stdout.write(`${report.participant_icon_summary.join("\n")}\n`);
      process.stdout.write(`${report.participant_box_summary.join("\n")}\n`);
      process.stdout.write(`${report.residual_scope_summary.join("\n")}\n`);
      return;
    }

    if (!args.jsonOnly) {
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n\n`);
      process.stdout.write(`${report.summary.join("\n")}\n`);
      process.stdout.write(`${report.number_summary.join("\n")}\n`);
      process.stdout.write(`${report.arrow_summary.join("\n")}\n`);
      process.stdout.write(`${report.participant_label_summary.join("\n")}\n`);
      process.stdout.write(`${report.participant_icon_summary.join("\n")}\n`);
      process.stdout.write(`${report.participant_box_summary.join("\n")}\n`);
      process.stdout.write(`${report.residual_scope_summary.join("\n")}\n`);
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

/*
 * What this file does:
 * Groups remaining diff pixels into residual hotspots and attributes them to nearby elements.
 *
 * High-level flow:
 * - Scans the analyzer's local diff for connected html-only and svg-only clusters.
 * - Builds candidate scope items from labels, arrows, participant headers, icons,
 *   boxes, and frame-level containers.
 * - Picks the nearest and most specific target on each side for each cluster.
 * - Produces concise residual summaries for terminal and JSON output.
 *
 * This module explains "where the remaining diff seems to belong" after the
 * semantic scoring step.
 *
 * Example input:
 * Extracted geometry plus a diff image containing `html-only` and `svg-only` pixels.
 *
 * Example output:
 * `{ scopes, summary, html_only_top, svg_only_top }`
 * with each scope carrying a bbox, centroid, and nearest HTML/SVG targets.
 */
import { area, intersectionArea, rectBottom, rectRight, round } from "./geometry.mjs";

function scopePriority(category) {
  switch (category) {
    case "participant-icon":
      return 8;
    case "participant-stereotype":
    case "label":
    case "number":
    case "comment":
    case "participant-label":
      return 7;
    case "arrow":
      return 6;
    case "participant-box":
    case "participant-group":
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
  const comments = side === "html" ? extracted.htmlComments : extracted.svgComments;
  const groups = side === "html" ? extracted.htmlGroups : extracted.svgGroups;

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
  for (const comment of comments) {
    push("comment", formatScopeName(comment), comment.box, {
      kind: comment.kind,
      text: comment.text,
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
    push("participant-stereotype", participant.name, participant.stereotypeBox, {
      kind: "participant",
      text: participant.stereotypeText ?? participant.name,
      owner_text: participant.name,
    });
    push("participant-icon", participant.name, participant.iconBox, {
      kind: "participant",
      text: participant.labelText ?? participant.name,
      owner_text: participant.name,
    });
  }
  for (const group of groups) {
    push("participant-group", group.name || "group", group.box, {
      kind: "group",
      text: group.name,
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

function formatResidualScopeSummary(scope) {
  const htmlTarget = scope.html_target
    ? `${scope.html_target.category}:${scope.html_target.name}`
    : "none";
  const svgTarget = scope.svg_target
    ? `${scope.svg_target.category}:${scope.svg_target.name}`
    : "none";
  return `${scope.class}:${scope.size}px @ (${scope.centroid.x.toFixed(1)},${scope.centroid.y.toFixed(1)}) -> html=${htmlTarget} svg=${svgTarget}`;
}

export function buildResidualScopes(extracted, diffImage) {
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

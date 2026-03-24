/*
 * What this file does:
 * Compares extracted HTML and SVG geometry and converts it into scored sections.
 *
 * High-level flow:
 * - Pairs equivalent items across HTML and SVG by semantic keys.
 * - Scores per-letter drift, arrow geometry, participant labels, icons, and boxes.
 * - Uses the analyzer's local diff only as supporting evidence when deciding
 *   whether a measured offset is strong enough to report.
 * - Returns structured sections ready for report assembly.
 *
 * This module answers "how far apart are the matched elements?" but does not
 * decide how to print results or where residual hotspots belong.
 *
 * Example input:
 * Extracted HTML/SVG geometry plus a local diff image.
 *
 * Example output:
 * `{ labels, numbers, arrows, participantLabels, participantIcons, participantBoxes }`
 * where each section contains status, deltas, evidence, and normalized boxes.
 */
import { analyzeDiffSlot } from "./native-diff.mjs";
import {
  iou,
  keyForLabel,
  normalizeOffset,
  rectBottom,
  rectCenter,
  rectRight,
  round,
} from "./geometry.mjs";

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

function buildParticipantStereotypeItems(participants) {
  return participants
    .filter((participant) => participant.stereotypeText && participant.stereotypeBox)
    .map((participant) => ({
      side: participant.side,
      kind: "participant-stereotype",
      text: participant.stereotypeText,
      pairText: participant.name,
      ownerText: participant.name,
      box: participant.stereotypeBox,
      font: participant.stereotypeFont,
      letters: participant.stereotypeLetters,
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

function scoreParticipantColor(htmlParticipant, svgParticipant) {
  const base = htmlParticipant || svgParticipant;
  const item = {
    name: base?.name ?? "",
    status: "ambiguous",
  };

  if (!htmlParticipant || !svgParticipant) {
    item.reason = "participant missing on one side";
    return item;
  }

  return {
    ...item,
    status: "ok",
    html_background_color: htmlParticipant.backgroundColor ?? null,
    svg_background_color: svgParticipant.backgroundColor ?? null,
    html_text_color: htmlParticipant.textColor ?? null,
    svg_text_color: svgParticipant.textColor ?? null,
    html_stereotype_color: htmlParticipant.stereotypeColor ?? null,
    svg_stereotype_color: svgParticipant.stereotypeColor ?? null,
    background_match: (htmlParticipant.backgroundColor ?? null) === (svgParticipant.backgroundColor ?? null),
    text_match: (htmlParticipant.textColor ?? null) === (svgParticipant.textColor ?? null),
    stereotype_text_match: (htmlParticipant.stereotypeColor ?? null) === (svgParticipant.stereotypeColor ?? null),
  };
}

function buildParticipantColorSection(htmlParticipants, svgParticipants) {
  const names = participantNames(htmlParticipants, svgParticipants);
  const htmlMap = new Map(htmlParticipants.map((participant) => [participant.name, participant]));
  const svgMap = new Map(svgParticipants.map((participant) => [participant.name, participant]));
  return names.map((name) => scoreParticipantColor(htmlMap.get(name) || null, svgMap.get(name) || null));
}

function groupNames(htmlGroups, svgGroups) {
  return Array.from(
    new Set(
      [...htmlGroups, ...svgGroups]
        .map((group) => group.name)
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

function scoreGroup(htmlGroup, svgGroup) {
  const base = htmlGroup || svgGroup;
  const item = {
    name: base?.name ?? "",
    status: "ambiguous",
  };

  if (!htmlGroup?.box || !svgGroup?.box) {
    item.reason = "group missing on one side";
    return item;
  }

  const dx = svgGroup.box.x - htmlGroup.box.x;
  const dy = svgGroup.box.y - htmlGroup.box.y;
  const dw = svgGroup.box.w - htmlGroup.box.w;
  const dh = svgGroup.box.h - htmlGroup.box.h;
  const nameDx = htmlGroup.nameBox && svgGroup.nameBox
    ? svgGroup.nameBox.x - htmlGroup.nameBox.x
    : null;
  const nameDy = htmlGroup.nameBox && svgGroup.nameBox
    ? svgGroup.nameBox.y - htmlGroup.nameBox.y
    : null;

  return {
    ...item,
    status: "ok",
    html_name: htmlGroup.name,
    svg_name: svgGroup.name,
    dx: normalizeOffset(dx),
    dy: normalizeOffset(dy),
    dw: normalizeOffset(dw),
    dh: normalizeOffset(dh),
    name_dx: nameDx === null ? null : normalizeOffset(nameDx),
    name_dy: nameDy === null ? null : normalizeOffset(nameDy),
    html_box: {
      x: round(htmlGroup.box.x),
      y: round(htmlGroup.box.y),
      w: round(htmlGroup.box.w),
      h: round(htmlGroup.box.h),
    },
    svg_box: {
      x: round(svgGroup.box.x),
      y: round(svgGroup.box.y),
      w: round(svgGroup.box.w),
      h: round(svgGroup.box.h),
    },
    html_name_box: htmlGroup.nameBox ? {
      x: round(htmlGroup.nameBox.x),
      y: round(htmlGroup.nameBox.y),
      w: round(htmlGroup.nameBox.w),
      h: round(htmlGroup.nameBox.h),
    } : null,
    svg_name_box: svgGroup.nameBox ? {
      x: round(svgGroup.nameBox.x),
      y: round(svgGroup.nameBox.y),
      w: round(svgGroup.nameBox.w),
      h: round(svgGroup.nameBox.h),
    } : null,
  };
}

function buildGroupSection(htmlGroups, svgGroups) {
  const names = groupNames(htmlGroups, svgGroups);
  const htmlMap = new Map(htmlGroups.map((group) => [group.name, group]));
  const svgMap = new Map(svgGroups.map((group) => [group.name, group]));
  return names.map((name) => scoreGroup(htmlMap.get(name) || null, svgMap.get(name) || null));
}

export function buildScoredSections(extracted, diffImage) {
  const {
    htmlLabels,
    svgLabels,
    htmlNumbers,
    svgNumbers,
    htmlArrows,
    svgArrows,
    htmlParticipants,
    svgParticipants,
    htmlComments,
    svgComments,
    htmlGroups,
    svgGroups,
  } = extracted;

  const iconNames = participantsWithIcons(htmlParticipants, svgParticipants);
  const htmlParticipantLabels = buildParticipantLabelItems(htmlParticipants, iconNames);
  const svgParticipantLabels = buildParticipantLabelItems(svgParticipants, iconNames);
  const htmlParticipantStereotypes = buildParticipantStereotypeItems(htmlParticipants);
  const svgParticipantStereotypes = buildParticipantStereotypeItems(svgParticipants);

  return {
    labels: buildSection(htmlLabels, svgLabels, diffImage),
    numbers: buildSection(htmlNumbers, svgNumbers, diffImage),
    arrows: buildArrowSection(htmlArrows, svgArrows, diffImage),
    participantLabels: buildSection(htmlParticipantLabels, svgParticipantLabels, diffImage),
    participantStereotypes: buildSection(htmlParticipantStereotypes, svgParticipantStereotypes, diffImage),
    participantIcons: buildParticipantIconSection(htmlParticipants, svgParticipants, diffImage),
    participantBoxes: buildParticipantBoxSection(htmlParticipants, svgParticipants),
    participantColors: buildParticipantColorSection(htmlParticipants, svgParticipants),
    comments: buildSection(htmlComments, svgComments, diffImage),
    groups: buildGroupSection(htmlGroups, svgGroups),
  };
}

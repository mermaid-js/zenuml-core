/*
 * What this file does:
 * Assembles the final report object from scored sections and residual attribution.
 *
 * High-level flow:
 * - Pulls in semantic scoring results and residual hotspot attribution.
 * - Builds the JSON report shape consumed by scripts and humans.
 * - Produces concise summary lines for labels, numbers, arrows, icons, boxes,
 *   and residual scopes so the CLI can print a readable digest.
 *
 * This module is the boundary between raw analysis results and final report shape.
 *
 * Example input:
 * `caseName`, extracted geometry, and the analyzer's local diff image.
 *
 * Example output:
 * A single report object with JSON-friendly sections plus terminal summary arrays
 * such as `summary`, `arrow_summary`, and `residual_scope_summary`.
 */
import { buildResidualScopes } from "./residual-scopes.mjs";
import { buildScoredSections } from "./scoring.mjs";

function formatLetterSummary(letter) {
  if (letter.dx == null || letter.dy == null) {
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
  if (icon.emoji) {
    notes.push(`emoji=${icon.emoji}`);
  }
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

function formatParticipantColorSummary(color) {
  if (color.status !== "ok") {
    return `participant-color:${color.name} -> ambiguous`;
  }
  return `participant-color:${color.name} -> bg(html=${color.html_background_color} svg=${color.svg_background_color}) text(html=${color.html_text_color} svg=${color.svg_text_color}) stereotype(html=${color.html_stereotype_color} svg=${color.svg_stereotype_color})`;
}

function formatGroupSummary(group) {
  if (group.status !== "ok") {
    return `participant-group:${group.name} -> ambiguous`;
  }
  const namePart = group.name_dx === null || group.name_dy === null
    ? "name=ambiguous"
    : `name_dx=${group.name_dx.toFixed(2)}px name_dy=${group.name_dy.toFixed(2)}px`;
  return `participant-group:${group.name} -> dx=${group.dx.toFixed(2)}px dy=${group.dy.toFixed(2)}px dw=${group.dw.toFixed(2)}px dh=${group.dh.toFixed(2)}px ${namePart}`;
}

function formatOccurrenceSummary(occ) {
  if (occ.status !== "ok") {
    return `occurrence:${occ.participant}#${occ.idx} -> ambiguous`;
  }
  return `occurrence:${occ.participant}#${occ.idx} -> dx=${occ.dx.toFixed(2)}px dy=${occ.dy.toFixed(2)}px dw=${occ.dw.toFixed(2)}px dh=${occ.dh.toFixed(2)}px`;
}

function formatFragmentDividerSummary(div) {
  if (div.status !== "ok") {
    return `fragment-divider:#${div.idx} -> ambiguous`;
  }
  return `fragment-divider:#${div.idx} -> dx=${div.dx.toFixed(2)}px dy=${div.dy.toFixed(2)}px dw=${div.dw.toFixed(2)}px`;
}

export function buildReport(caseName, extracted, diffImage) {
  const sections = buildScoredSections(extracted, diffImage);
  const residualScopes = buildResidualScopes(extracted, diffImage);

  return {
    case: caseName,
    title: sections.title,
    labels: sections.labels,
    numbers: sections.numbers,
    arrows: sections.arrows,
    participant_labels: sections.participantLabels,
    participant_stereotypes: sections.participantStereotypes,
    participant_icons: sections.participantIcons,
    participant_boxes: sections.participantBoxes,
    participant_colors: sections.participantColors,
    comments: sections.comments,
    participant_groups: sections.groups,
    occurrences: sections.occurrences,
    fragment_dividers: sections.fragmentDividers,
    dividers: sections.dividers,
    residual_scopes: residualScopes.scopes,
    title_summary: sections.title ? formatSectionSummary("title", sections.title) : null,
    summary: sections.labels.map((label) => formatSectionSummary("label", label)),
    number_summary: sections.numbers.map((number) => formatSectionSummary("number", number)),
    arrow_summary: sections.arrows.map((arrow) => `arrow:${arrow.key.text} -> ${formatArrowSummary(arrow)}`),
    participant_label_summary: sections.participantLabels.map((label) => formatSectionSummary("participant-label", label)),
    participant_stereotype_summary: sections.participantStereotypes.map((label) => formatSectionSummary("participant-stereotype", label)),
    participant_icon_summary: sections.participantIcons.map((icon) => formatParticipantIconSummary(icon)),
    participant_box_summary: sections.participantBoxes.map((box) => formatParticipantBoxSummary(box)),
    participant_color_summary: sections.participantColors.map((color) => formatParticipantColorSummary(color)),
    comment_summary: sections.comments.map((comment) => formatSectionSummary("comment", comment)),
    participant_group_summary: sections.groups.map((group) => formatGroupSummary(group)),
    occurrence_summary: sections.occurrences.map((occ) => formatOccurrenceSummary(occ)),
    fragment_divider_summary: sections.fragmentDividers.map((div) => formatFragmentDividerSummary(div)),
    divider_summary: sections.dividers.map((d) => `divider:"${d.label}" dy=${d.dy ?? "?"} ${d.status}`),
    residual_scope_summary: residualScopes.summary,
    residual_scope_html_only_top: residualScopes.html_only_top,
    residual_scope_svg_only_top: residualScopes.svg_only_top,
  };
}

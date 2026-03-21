/**
 * geometry-scorer.ts
 *
 * Compares buildGeometry() output against HTML-measured fixtures.
 * Exact comparison — no rounding tolerance. 0.5px is a mismatch.
 * Y values are normalized relative to the anchor participant bottom
 * so the HTML and SVG coordinate systems are comparable.
 * X values are normalized relative to the anchor participant center X
 * so the horizontal coordinate origins are comparable.
 */

import { renderToSvg } from "./renderToSvg";
import type { DiagramGeometry } from "./geometry";
import type { GeometryFixture } from "./geometry-fixture";

// ─── Canvas text measurement (14px) ─────────────────────────────────
// Fragment condition labels render at 14px in both HTML and SVG.
// The WidthProvider uses 16px for all text. We need a 14px measurement
// for condition label width comparison.
const COND_FONT = "14px Helvetica, Verdana, serif";
const COND_PADDING = 8; // HTML .condition span has padding: 0 4px (4px each side)
function measureConditionText(text: string): number {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createCanvas } = require("@napi-rs/canvas");
    const canvas = createCanvas(1, 1);
    const ctx = canvas.getContext("2d");
    ctx.font = COND_FONT;
    // SVG fragment.ts adds dx="4" on condition tspan and dx="4" on closing bracket
    // to match HTML's padding: 0 4px on .condition span (4px each side = 8px total)
    return ctx.measureText(text).width + COND_PADDING;
  } catch {
    // Fallback: character estimate
    return text.length * 7 + COND_PADDING;
  }
}

// ─── Public types ──────────────────────────────────────────────────

export interface Mismatch {
  elementType: string;
  label: string;
  property: string;
  expected: number;
  actual: number;
  delta: number;
}

export interface ScoreResult {
  case: string;
  score: number; // 0-100
  matched: number;
  total: number;
  mismatches: Mismatch[];
  byType: Record<string, { matched: number; total: number }>;
}

// ─── Internal helpers ───────────────────────────────────────────────

function addMismatch(
  mismatches: Mismatch[],
  elementType: string,
  label: string,
  property: string,
  expected: number,
  actual: number,
): void {
  mismatches.push({
    elementType,
    label,
    property,
    expected,
    actual,
    delta: Math.abs(actual - expected),
  });
}

/** Exact comparison — no rounding tolerance */
function match(expected: number, actual: number): boolean {
  return expected === actual;
}

function getRenderResult(code: string): { geometry: DiagramGeometry; viewBoxHeight: number } {
  const result = renderToSvg(code);
  if (!result.geometry) throw new Error("renderToSvg returned no geometry");
  return { geometry: result.geometry, viewBoxHeight: result.height };
}

// ─── Utility ────────────────────────────────────────────────────────

function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const k = key(item);
    if (!result[k]) result[k] = [];
    result[k].push(item);
  }
  return result;
}

// ─── Anchors type ───────────────────────────────────────────────────

interface Anchors {
  fY: number; // fixture anchor bottom Y
  gY: number; // geometry anchor bottom Y
  fX: number; // fixture anchor center X
  gX: number; // geometry anchor center X
}

// ─── Main export ────────────────────────────────────────────────────

export function scoreGeometry(fixture: GeometryFixture): ScoreResult {
  const { geometry, viewBoxHeight } = getRenderResult(fixture.code);

  // Find anchor participant in both renderers for normalization
  const anchorGeo = geometry.participants.find(
    (p) => p.name === fixture.anchor.participant,
  );
  const svgAnchorBottom = anchorGeo
    ? anchorGeo.y + anchorGeo.height
    : fixture.anchor.bottom;
  // Geometry stores center X; compute anchor center X for normalization
  const svgAnchorCenterX = anchorGeo ? anchorGeo.x : 0;

  const fixtureAnchorBottom = fixture.anchor.bottom;
  // Fixture stores left edge; compute anchor center X
  const fixtureAnchorP = fixture.participants.find(p => p.name === fixture.anchor.participant);
  const fixtureAnchorCenterX = fixtureAnchorP ? fixtureAnchorP.x + fixtureAnchorP.width / 2 : 0;

  const mismatches: Mismatch[] = [];
  const byType: Record<string, { matched: number; total: number }> = {};

  // Build normalized comparators. Each scorer gets anchors for both X and Y normalization.
  const anchors: Anchors = { fY: fixtureAnchorBottom, gY: svgAnchorBottom, fX: fixtureAnchorCenterX, gX: svgAnchorCenterX };
  scoreParticipantsNorm(fixture, geometry, anchors, mismatches, byType);
  scoreMessagesNorm(fixture, geometry, anchors, mismatches, byType);
  scoreSelfCallsNorm(fixture, geometry, anchors, mismatches, byType);
  scoreOccurrencesNorm(fixture, geometry, anchors, mismatches, byType);
  scoreReturnsNorm(fixture, geometry, anchors, mismatches, byType);
  scoreCreationsNorm(fixture, geometry, anchors, mismatches, byType);
  scoreFragmentsNorm(fixture, geometry, anchors, mismatches, byType);
  scoreDividersNorm(fixture, geometry, anchors, mismatches, byType);
  scoreCommentsNorm(fixture, geometry, anchors, mismatches, byType);

  // Frame height: compare SVG viewBox height against HTML .frame height.
  // viewBoxHeight comes directly from renderToSvg() — no magic numbers.
  if (fixture.frameHeight && fixture.frameHeight > 0) {
    compareProps(mismatches, byType, "frame", "diagram", [
      { prop: "height", expected: fixture.frameHeight, actual: viewBoxHeight },
    ]);
  }

  const total = Object.values(byType).reduce((s, t) => s + t.total, 0);
  const matched = Object.values(byType).reduce((s, t) => s + t.matched, 0);

  const score = total === 0 ? 100 : Math.round((matched / total) * 100);

  return {
    case: fixture.case,
    score,
    matched,
    total,
    mismatches,
    byType,
  };
}

// ─── Normalized per-type scorers ───────────────────────────────────
// Each one normalizes Y values: dy = absoluteY - anchorBottom
// Each one normalizes X values: dx = absoluteX - anchorCenterX

function normY(y: number, anchorBottom: number): number {
  return y - anchorBottom;
}

function normX(x: number, anchorCenterX: number): number {
  return x - anchorCenterX;
}

function compareProps(
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
  type: string,
  label: string,
  props: Array<{ prop: string; expected: number; actual: number | undefined }>,
): void {
  if (!byType[type]) byType[type] = { matched: 0, total: 0 };
  for (const { prop, expected, actual } of props) {
    byType[type].total++;
    if (actual === undefined || isNaN(actual as number)) {
      addMismatch(mismatches, type, label, prop, expected, NaN);
    } else if (match(expected, actual)) {
      byType[type].matched++;
    } else {
      addMismatch(mismatches, type, label, prop, expected, actual);
    }
  }
}

function scoreParticipantsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  for (const fp of fixture.participants) {
    const gp = geometry.participants.find((p) => p.name === fp.name);
    // Fixture stores left-edge X; geometry stores center X.
    // Convert both to center-relative for comparison.
    // Build props list
    const props: Array<{ prop: string; expected: number; actual: number | undefined }> = [
      {
        prop: "x",
        expected: normX(fp.x + fp.width / 2, anchors.fX),
        actual: gp !== undefined ? normX(gp.x, anchors.gX) : undefined,
      },
      { prop: "y", expected: fp.y, actual: gp?.y },
      { prop: "width", expected: fp.width, actual: gp?.width },
      { prop: "height", expected: fp.height, actual: gp?.height },
    ];
    // For aliased labels: compare HTML glyph width against SVG effective textLength.
    // SVG renderer sets textLength = labelWidth for assignee participants.
    // HTML renders at natural glyph width with CSS padding around it.
    // Round to 1 decimal: canvas measureText and browser getBoundingClientRect
    // return slightly different float precision for the same font/text.
    if (fp.labelTextWidth != null && gp !== undefined) {
      const r1 = (n: number) => Math.round(n * 10) / 10;
      const svgEffectiveTextLength = gp.labelWidth != null ? r1(gp.labelWidth) : undefined;
      props.push({
        prop: "labelTextWidth",
        expected: r1(fp.labelTextWidth),
        actual: svgEffectiveTextLength,
      });
    }
    compareProps(mismatches, byType, "participant", fp.name, props);
  }
}

function scoreMessagesNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  // Filter out self-calls from fixture messages. The HTML fixture recorder puts
  // all interactions (including self-calls) in messages[], but the geometry stores
  // self-calls separately. Self-calls have |toX - fromX| ≤ 50 (arrow width ~30px).
  const SELF_CALL_THRESHOLD = 50;
  const fixtureMessages = [...fixture.messages]
    .filter((m) => Math.abs(m.toX - m.fromX) > SELF_CALL_THRESHOLD)
    .sort((a, b) => a.y - b.y);
  const geoMessages = geometry.messages.filter((m) => !m.isSelf).sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureMessages.length; i++) {
    const fm = fixtureMessages[i];
    const gm = geoMessages[i];
    // SVG sub-pixel corrections for message coordinates:
    // - Y: SVG uses -0.5 offset for crisp line rendering. Subtract 0.5
    //   before normalizing so the rounded value aligns with HTML.
    // - X: Geometry stores lifeline center. message.ts renders with +1 on the
    //   left-side endpoint (right edge of 2px lifeline). Apply the same +1 here
    //   so the scorer matches what the renderer actually outputs.
    const gmY = gm !== undefined ? gm.y - 0.5 : undefined;
    const isLTR = gm !== undefined ? gm.fromX < gm.toX : true;
    const gmFromX = gm !== undefined ? gm.fromX + (isLTR ? 1 : 0) : undefined;
    const gmToX = gm !== undefined ? gm.toX + (isLTR ? 0 : 1) : undefined;
    // Sequence number X: SVG renders at Math.min(fromX, toX) - 4 with text-anchor="end".
    // HTML Numbering component uses right-[100%] (outer box right edge = message left edge)
    // with pr-1 (padding-right: 4px). The fixture records the outer box right edge,
    // which equals the arrow's left endpoint. Both renderers place the number's right
    // edge at the arrow's left endpoint, so compare fixture numberX against SVG min(fromX, toX).
    const numberProps: Array<{ prop: string; expected: number; actual: number | undefined }> = [];
    if (fm.numberX !== undefined && gm !== undefined && gm.number) {
      // Use rendered endpoints (with +1 lifeline correction) to match HTML fixture
      const renderedLeft = Math.min(gmFromX ?? gm.fromX, gmToX ?? gm.toX);
      numberProps.push({
        prop: "numberX",
        expected: normX(fm.numberX, anchors.fX),
        actual: normX(renderedLeft, anchors.gX),
      });
    }

    compareProps(mismatches, byType, "message", fm.label, [
      {
        prop: "fromX",
        expected: normX(fm.fromX, anchors.fX),
        actual: gmFromX !== undefined ? normX(gmFromX, anchors.gX) : undefined,
      },
      {
        prop: "toX",
        expected: normX(fm.toX, anchors.fX),
        actual: gmToX !== undefined ? normX(gmToX, anchors.gX) : undefined,
      },
      {
        prop: "y",
        expected: normY(fm.y, anchors.fY),
        actual: gmY !== undefined ? normY(gmY, anchors.gY) : undefined,
      },
      ...numberProps,
    ]);
  }
}

function scoreSelfCallsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  // Self-calls may be in fixture.selfCalls or embedded in fixture.messages
  // (the HTML recorder puts all interactions in messages[]). Extract self-calls
  // from messages when selfCalls[] is empty: they have |toX - fromX| ≤ 50.
  const SELF_CALL_THRESHOLD = 50;
  let fixtureSelfCalls = [...fixture.selfCalls].sort((a, b) => a.y - b.y);
  if (fixtureSelfCalls.length === 0 && fixture.messages.length > 0) {
    // Async self-call layout: label(~20px) + arrow center(12px) = 32px from
    // component top to arrow Y. Subtract to align with geometry's component top.
    const SELF_CALL_Y_OFFSET = 32;
    const selfMsgs = fixture.messages.filter((m) => Math.abs(m.toX - m.fromX) <= SELF_CALL_THRESHOLD);
    fixtureSelfCalls = selfMsgs.map((m) => ({
      label: m.label,
      x: Math.min(m.fromX, m.toX),
      y: m.y - SELF_CALL_Y_OFFSET,
      width: Math.abs(m.toX - m.fromX),
      height: 0, // not available from message format
    })).sort((a, b) => a.y - b.y);
  }
  const geoSelfCalls = [...geometry.selfCalls].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureSelfCalls.length; i++) {
    const fs = fixtureSelfCalls[i];
    const gs = geoSelfCalls[i];
    // SVG self-call X uses participant center; HTML uses center+1 (same as messages).
    const gsX = gs !== undefined ? gs.x + 1 : undefined;
    const props: Array<{ prop: string; expected: number; actual: number | undefined }> = [
      {
        prop: "x",
        expected: normX(fs.x, anchors.fX),
        actual: gsX !== undefined ? normX(gsX, anchors.gX) : undefined,
      },
      {
        prop: "y",
        expected: normY(fs.y, anchors.fY),
        actual: gs !== undefined ? normY(gs.y, anchors.gY) : undefined,
      },
    ];
    // Only compare width/height when available from fixture (height=0 sentinel
    // means self-call was extracted from messages[] without size info)
    if (fs.height > 0) {
      props.push({ prop: "width", expected: fs.width, actual: gs?.width });
      props.push({ prop: "height", expected: fs.height, actual: gs?.height });
    }
    compareProps(mismatches, byType, "selfCall", fs.label, props);
  }
}

function scoreOccurrencesNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureByParticipant = groupBy(fixture.occurrences, (o) => o.participant);
  const geoByParticipant = groupBy(geometry.occurrences, (o) => o.participantName);

  for (const [participant, fOccs] of Object.entries(fixtureByParticipant)) {
    const sortedF = [...fOccs].sort((a, b) => a.y - b.y);
    const sortedG = (geoByParticipant[participant] ?? []).sort((a, b) => a.y - b.y);

    for (let i = 0; i < sortedF.length; i++) {
      const fo = sortedF[i];
      const go = sortedG[i];
      const label = `${participant}[${i}]`;
      compareProps(mismatches, byType, "occurrence", label, [
        {
          prop: "x",
          expected: normX(fo.x, anchors.fX),
          actual: go !== undefined ? normX(go.x, anchors.gX) : undefined,
        },
        {
          prop: "y",
          expected: normY(fo.y, anchors.fY),
          actual: go !== undefined ? normY(go.y, anchors.gY) : undefined,
        },
        { prop: "width", expected: fo.width, actual: go?.width },
        { prop: "height", expected: fo.height, actual: go?.height },
      ]);
    }
  }
}

function scoreReturnsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  // Filter out self-returns: they render as self-call arrows, so their
  // geometry fromX/toX (raw participant positions) aren't comparable to
  // the fixture's HTML arrow endpoint measurements.
  const SELF_RETURN_THRESHOLD = 15; // self-returns have |fromX-toX| ≤ ~12px
  const fixtureReturns = [...fixture.returns]
    .filter((r) => Math.abs(r.fromX - r.toX) > SELF_RETURN_THRESHOLD)
    .sort((a, b) => a.y - b.y);
  const geoReturns = [...geometry.returns]
    .filter((r) => !r.isSelf)
    .sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureReturns.length; i++) {
    const fr = fixtureReturns[i];
    const gr = geoReturns[i];
    // Compare leftX/rightX (min/max) instead of fromX/toX — the HTML
    // fixture always records left→right, but geometry may swap for RTL.
    const fLeft = normX(Math.min(fr.fromX, fr.toX), anchors.fX);
    const fRight = normX(Math.max(fr.fromX, fr.toX), anchors.fX);
    const gLeft = gr !== undefined ? normX(Math.min(gr.fromX, gr.toX), anchors.gX) : undefined;
    const gRight = gr !== undefined ? normX(Math.max(gr.fromX, gr.toX), anchors.gX) : undefined;
    compareProps(mismatches, byType, "return", fr.label, [
      { prop: "leftX", expected: fLeft, actual: gLeft },
      { prop: "rightX", expected: fRight, actual: gRight },
      {
        prop: "y",
        expected: normY(fr.y, anchors.fY),
        actual: gr !== undefined ? normY(gr.y, anchors.gY) : undefined,
      },
    ]);
  }
}

function scoreCreationsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  for (const fc of fixture.creations) {
    const gc = geometry.creations.find((c) => c.participant.name === fc.participantName);
    const label = fc.participantName;
    // Creation participant: fixture stores left-edge px, geometry stores center x.
    // Convert both to center-relative.
    //
    // Message endpoints: geometry stores participant center positions.
    // creation.ts renders with adjustments:
    //   - fromX: +1 on left endpoint (same as message.ts lifeline offset)
    //   - toX: participant near edge (LTR: center - halfWidth, RTL: center + halfWidth)
    //     The arrow tip must stop AT the participant rect edge, not past it,
    //     because SVG has no z-ordering to hide overlap like CSS does.
    const isLTR = gc !== undefined ? gc.message.fromX < gc.message.toX : true;
    const halfWidth = gc !== undefined ? gc.participant.width / 2 : 0;
    const renderedFromX = gc !== undefined
      ? gc.message.fromX + (isLTR ? 1 : 0)
      : undefined;
    const renderedToX = gc !== undefined
      ? gc.message.toX + (isLTR ? -halfWidth : halfWidth)
      : undefined;
    compareProps(mismatches, byType, "creation", label, [
      {
        prop: "px",
        expected: normX(fc.px + fc.pw / 2, anchors.fX),
        actual: gc !== undefined ? normX(gc.participant.x, anchors.gX) : undefined,
      },
      {
        prop: "py",
        expected: normY(fc.py, anchors.fY),
        actual: gc !== undefined ? normX(gc.participant.y, anchors.gY) : undefined,
      },
      { prop: "pw", expected: fc.pw, actual: gc?.participant.width },
      { prop: "ph", expected: fc.ph, actual: gc?.participant.height },
      {
        prop: "msgFromX",
        expected: normX(fc.msgFromX, anchors.fX),
        actual: renderedFromX !== undefined ? normX(renderedFromX, anchors.gX) : undefined,
      },
      {
        prop: "msgToX",
        // HTML records arrow tip 1px past participant edge (CSS z-ordering hides overlap).
        // SVG has no z-ordering, so arrow must stop AT the edge. Use participant near
        // edge from fixture (px for LTR, px+pw for RTL) as expected value instead of
        // the raw msgToX which includes HTML's 1px overlap.
        expected: normX(isLTR ? fc.px : fc.px + fc.pw, anchors.fX),
        actual: renderedToX !== undefined ? normX(renderedToX, anchors.gX) : undefined,
      },
      {
        prop: "msgY",
        expected: normY(fc.msgY, anchors.fY),
        actual: gc !== undefined ? normY(gc.message.y, anchors.gY) : undefined,
      },
      // Label center X: creation.ts renders the label at the arrow midpoint,
      // offset 3px toward the sender side (LTR: -3, RTL: +3).
      // Compare with 1-decimal rounding — HTML getBoundingClientRect returns sub-pixel
      // fractions from font metrics that aren't visually meaningful.
      ...(fc.msgLabelCenterX != null && renderedFromX !== undefined && renderedToX !== undefined ? (() => {
        const r1 = (n: number) => Math.round(n * 10) / 10;
        const labelOffset = isLTR ? -3 : 3.5;
        return [{
          prop: "msgLabelCenterX",
          expected: r1(normX(fc.msgLabelCenterX, anchors.fX)),
          actual: r1(normX(renderedFromX + (renderedToX - renderedFromX) / 2 + labelOffset, anchors.gX)),
        }];
      })() : []),
    ]);

  }
}

function scoreFragmentsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureFragments = [...fixture.fragments].sort((a, b) => a.y - b.y);
  const geoFragments = [...geometry.fragments].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureFragments.length; i++) {
    const ff = fixtureFragments[i];
    const gf = geoFragments[i];
    const label = `${ff.kind}[${i}]`;
    compareProps(mismatches, byType, "fragment", label, [
      {
        prop: "x",
        expected: normX(ff.x, anchors.fX),
        actual: gf !== undefined ? normX(gf.x, anchors.gX) : undefined,
      },
      {
        prop: "y",
        expected: normY(ff.y, anchors.fY),
        actual: gf !== undefined ? normY(gf.y, anchors.gY) : undefined,
      },
      { prop: "width", expected: ff.width, actual: gf?.width },
      { prop: "height", expected: ff.height, actual: gf?.height },
    ]);

    // Condition label (e.g., "[true]") — compare text and Y position.
    // HTML positions the condition div directly at headerBottom (no gap).
    // Geometry stores headerY; the fixture conditionY = headerY + HEADER_HEIGHT.
    if (ff.conditionLabel && ff.conditionY !== undefined) {
      const HEADER_HEIGHT = 25;
      const geoCondY = gf !== undefined ? gf.headerY + HEADER_HEIGHT : undefined;
      const geoCondLabel = gf !== undefined && gf.label ? `[${gf.label}]` : undefined;

      // Compare label text
      const condKey = "fragment.condition";
      if (!byType[condKey]) byType[condKey] = { matched: 0, total: 0 };
      byType[condKey].total++;
      if (geoCondLabel !== undefined && ff.conditionLabel !== geoCondLabel) {
        addMismatch(mismatches, condKey, `${label}(expected="${ff.conditionLabel}",actual="${geoCondLabel}")`, "label", 0, 1);
      } else if (geoCondLabel !== undefined) {
        byType[condKey].matched++;
      }

      // Compare Y position and text width
      // Text width: fixture records HTML inline text width ([bracket-to-bracket]);
      // scorer measures SVG text "[label]" at 14px using canvas.
      const geoCondWidth = gf !== undefined && gf.label
        ? measureConditionText(`[${gf.label}]`)
        : undefined;
      const condWidthProps: Array<{ prop: string; expected: number; actual: number | undefined }> = [
        {
          prop: "y",
          expected: normY(ff.conditionY, anchors.fY),
          actual: geoCondY !== undefined ? normY(geoCondY, anchors.gY) : undefined,
        },
      ];
      if (ff.conditionTextWidth !== undefined) {
        // Round to 1 decimal: canvas measureText and Chromium getBoundingClientRect
        // return slightly different float precision for the same font/text.
        const round1 = (n: number) => Math.round(n * 10) / 10;
        condWidthProps.push({
          prop: "textWidth",
          expected: round1(ff.conditionTextWidth),
          actual: geoCondWidth !== undefined ? round1(geoCondWidth) : undefined,
        });
      }
      compareProps(mismatches, byType, "fragment.condition", label, condWidthProps);
    }

    // Sections
    const fixtureSections = [...(ff.sections ?? [])].sort((a, b) => a.y - b.y);
    const geoSections = [...(gf?.sections ?? [])].sort((a, b) => a.y - b.y);

    for (let j = 0; j < fixtureSections.length; j++) {
      const fs = fixtureSections[j];
      const gs = geoSections[j];
      const sLabel = `${label}.section[${j}]`;
      // Compare section label text (not a numeric property)
      if (gs !== undefined && fs.label !== gs.label) {
        // Use hash of labels as dummy numeric values so the mismatch report shows them
        addMismatch(mismatches, "fragment.section", `${sLabel}(expected="${fs.label}",actual="${gs.label}")`, "label", 0, 1);
        const key = "fragment.section";
        if (!byType[key]) byType[key] = { matched: 0, total: 0 };
        byType[key].total++;
      } else if (gs !== undefined) {
        const key = "fragment.section";
        if (!byType[key]) byType[key] = { matched: 0, total: 0 };
        byType[key].matched++;
        byType[key].total++;
      }
      // Compute effective section height: geometry stores height=0 for non-last
      // sections (renderer derives it from next section Y). Reconstruct here.
      let gsHeight = gs?.height;
      if (gs !== undefined && gsHeight === 0 && j + 1 < geoSections.length) {
        gsHeight = geoSections[j + 1].y - gs.y;
      }
      compareProps(mismatches, byType, "fragment.section", sLabel, [
        {
          prop: "y",
          expected: normY(fs.y, anchors.fY),
          actual: gs !== undefined ? normY(gs.y, anchors.gY) : undefined,
        },
        { prop: "height", expected: fs.height, actual: gsHeight },
      ]);
    }
  }
}

function scoreDividersNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureDividers = [...fixture.dividers].sort((a, b) => a.y - b.y);
  const geoDividers = [...geometry.dividers].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureDividers.length; i++) {
    const fd = fixtureDividers[i];
    const gd = geoDividers[i];
    compareProps(mismatches, byType, "divider", fd.label, [
      {
        prop: "y",
        expected: normY(fd.y, anchors.fY),
        actual: gd !== undefined ? normY(gd.y, anchors.gY) : undefined,
      },
    ]);
  }
}

function scoreCommentsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  // SVG text y = baseline; HTML fixture records visual top.
  // buildGeometry adds COMMENT_FONT_ASCENT (15) to convert visual top → baseline.
  // Subtract it back for comparison against the fixture's visual-top Y.
  const COMMENT_FONT_ASCENT = 15;

  const fixtureComments = [...fixture.comments].sort((a, b) => a.y - b.y);
  const geoComments = [...geometry.comments].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureComments.length; i++) {
    const fc = fixtureComments[i];
    const gc = geoComments[i];
    compareProps(mismatches, byType, "comment", fc.text, [
      {
        prop: "x",
        expected: normX(fc.x, anchors.fX),
        actual: gc !== undefined ? normX(gc.x, anchors.gX) : undefined,
      },
      {
        prop: "y",
        expected: normY(fc.y, anchors.fY),
        actual: gc !== undefined ? normY(gc.y - COMMENT_FONT_ASCENT, anchors.gY) : undefined,
      },
    ]);
  }
}

// scoreLifelinesNorm removed — lifelines are derived from participant
// positions and diagram height, not independently positioned elements.

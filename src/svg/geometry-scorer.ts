/**
 * geometry-scorer.ts
 *
 * Compares buildGeometry() output against HTML-measured fixtures.
 * Uses Math.round() on both sides → effective ±0.5px tolerance.
 * Y values are normalized relative to the anchor participant bottom
 * so the HTML and SVG coordinate systems are comparable.
 * X values are normalized relative to the anchor participant center X
 * so the horizontal coordinate origins are comparable.
 */

import { RootContext } from "@/parser";
import { Coordinates } from "@/positioning/Coordinates";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { WidthProviderOnCanvas } from "@/positioning/WidthProviderFunc";
import { buildGeometry } from "./buildGeometry";
import type { DiagramGeometry } from "./geometry";
import type { GeometryFixture } from "./geometry-fixture";

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

function r(v: number): number {
  return Math.round(v);
}

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
    expected: r(expected),
    actual: r(actual),
    delta: Math.abs(r(actual) - r(expected)),
  });
}

/** Check two rounded values; return true if they match */
function match(expected: number, actual: number): boolean {
  return r(expected) === r(actual);
}

function getGeometry(code: string): DiagramGeometry {
  const rootContext = RootContext(code)!;
  const coordinates = new Coordinates(rootContext, WidthProviderOnCanvas);
  const verticalCoordinates = new VerticalCoordinates(rootContext);
  return buildGeometry({
    rootContext,
    coordinates,
    verticalCoordinates,
    title: undefined,
    measureText: WidthProviderOnCanvas,
  });
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
  const geometry = getGeometry(fixture.code);

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
  // Lifelines are excluded from scoring — they are derived from participant
  // positions and diagram height, not independently positioned elements.
  // Their y2 depends on occurrence height which is scored separately.

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
    compareProps(mismatches, byType, "participant", fp.name, [
      {
        prop: "x",
        expected: normX(fp.x + fp.width / 2, anchors.fX),
        actual: gp !== undefined ? normX(gp.x, anchors.gX) : undefined,
      },
      { prop: "y", expected: fp.y, actual: gp?.y },
      { prop: "width", expected: fp.width, actual: gp?.width },
      { prop: "height", expected: fp.height, actual: gp?.height },
    ]);
  }
}

function scoreMessagesNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  anchors: Anchors,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureMessages = [...fixture.messages].sort((a, b) => a.y - b.y);
  const geoMessages = geometry.messages.filter((m) => !m.isSelf).sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureMessages.length; i++) {
    const fm = fixtureMessages[i];
    const gm = geoMessages[i];
    compareProps(mismatches, byType, "message", fm.label, [
      {
        prop: "fromX",
        expected: normX(fm.fromX, anchors.fX),
        actual: gm !== undefined ? normX(gm.fromX, anchors.gX) : undefined,
      },
      {
        prop: "toX",
        expected: normX(fm.toX, anchors.fX),
        actual: gm !== undefined ? normX(gm.toX, anchors.gX) : undefined,
      },
      {
        prop: "y",
        expected: normY(fm.y, anchors.fY),
        actual: gm !== undefined ? normY(gm.y, anchors.gY) : undefined,
      },
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
  const fixtureSelfCalls = [...fixture.selfCalls].sort((a, b) => a.y - b.y);
  const geoSelfCalls = [...geometry.selfCalls].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureSelfCalls.length; i++) {
    const fs = fixtureSelfCalls[i];
    const gs = geoSelfCalls[i];
    compareProps(mismatches, byType, "selfCall", fs.label, [
      {
        prop: "x",
        expected: normX(fs.x, anchors.fX),
        actual: gs !== undefined ? normX(gs.x, anchors.gX) : undefined,
      },
      {
        prop: "y",
        expected: normY(fs.y, anchors.fY),
        actual: gs !== undefined ? normY(gs.y, anchors.gY) : undefined,
      },
      { prop: "width", expected: fs.width, actual: gs?.width },
      { prop: "height", expected: fs.height, actual: gs?.height },
    ]);
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
  const fixtureReturns = [...fixture.returns].sort((a, b) => a.y - b.y);
  const geoReturns = [...geometry.returns].sort((a, b) => a.y - b.y);

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
    compareProps(mismatches, byType, "creation", label, [
      {
        prop: "px",
        expected: normX(fc.px + fc.pw / 2, anchors.fX),
        actual: gc !== undefined ? normX(gc.participant.x, anchors.gX) : undefined,
      },
      {
        prop: "py",
        expected: normY(fc.py, anchors.fY),
        actual: gc !== undefined ? normY(gc.participant.y, anchors.gY) : undefined,
      },
      { prop: "pw", expected: fc.pw, actual: gc?.participant.width },
      { prop: "ph", expected: fc.ph, actual: gc?.participant.height },
      {
        prop: "msgFromX",
        expected: normX(fc.msgFromX, anchors.fX),
        actual: gc !== undefined ? normX(gc.message.fromX, anchors.gX) : undefined,
      },
      {
        prop: "msgToX",
        expected: normX(fc.msgToX, anchors.fX),
        actual: gc !== undefined ? normX(gc.message.toX, anchors.gX) : undefined,
      },
      {
        prop: "msgY",
        expected: normY(fc.msgY, anchors.fY),
        actual: gc !== undefined ? normY(gc.message.y, anchors.gY) : undefined,
      },
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

    // Sections
    const fixtureSections = [...(ff.sections ?? [])].sort((a, b) => a.y - b.y);
    const geoSections = [...(gf?.sections ?? [])].sort((a, b) => a.y - b.y);

    for (let j = 0; j < fixtureSections.length; j++) {
      const fs = fixtureSections[j];
      const gs = geoSections[j];
      const sLabel = `${label}.section[${j}]`;
      compareProps(mismatches, byType, "fragment.section", sLabel, [
        {
          prop: "y",
          expected: normY(fs.y, anchors.fY),
          actual: gs !== undefined ? normY(gs.y, anchors.gY) : undefined,
        },
        { prop: "height", expected: fs.height, actual: gs?.height },
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
        actual: gc !== undefined ? normY(gc.y, anchors.gY) : undefined,
      },
    ]);
  }
}

// scoreLifelinesNorm removed — lifelines are derived from participant
// positions and diagram height, not independently positioned elements.

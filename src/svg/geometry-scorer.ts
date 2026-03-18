/**
 * geometry-scorer.ts
 *
 * Compares buildGeometry() output against HTML-measured fixtures.
 * Uses Math.round() on both sides → effective ±0.5px tolerance.
 * Y values are normalized relative to the anchor participant bottom
 * so the HTML and SVG coordinate systems are comparable.
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

// ─── Main export ────────────────────────────────────────────────────

export function scoreGeometry(fixture: GeometryFixture): ScoreResult {
  const geometry = getGeometry(fixture.code);

  // Find anchor participant in geometry to compute SVG anchor bottom
  const anchorGeo = geometry.participants.find(
    (p) => p.name === fixture.anchor.participant,
  );
  const svgAnchorBottom = anchorGeo
    ? anchorGeo.y + anchorGeo.height
    : fixture.anchor.bottom;

  const fixtureAnchorBottom = fixture.anchor.bottom;

  const mismatches: Mismatch[] = [];
  const byType: Record<string, { matched: number; total: number }> = {};

  // Build normalized comparators. Each scorer gets fixtureAnchorDy for
  // fixture Y normalization, but geometry values are already absolute SVG coords.
  // We inline both normalizations per property comparison.
  scoreParticipantsNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreMessagesNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreSelfCallsNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreOccurrencesNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreReturnsNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreCreationsNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreFragmentsNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreDividersNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreCommentsNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);
  scoreLifelinesNorm(fixture, geometry, fixtureAnchorBottom, svgAnchorBottom, mismatches, byType);

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

function normY(y: number, anchorBottom: number): number {
  return y - anchorBottom;
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
  _fAnchor: number,
  _gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  for (const fp of fixture.participants) {
    const gp = geometry.participants.find((p) => p.name === fp.name);
    compareProps(mismatches, byType, "participant", fp.name, [
      { prop: "x", expected: fp.x, actual: gp?.x },
      { prop: "y", expected: fp.y, actual: gp?.y },
      { prop: "width", expected: fp.width, actual: gp?.width },
      { prop: "height", expected: fp.height, actual: gp?.height },
    ]);
  }
}

function scoreMessagesNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureMessages = [...fixture.messages].sort((a, b) => a.y - b.y);
  const geoMessages = geometry.messages.filter((m) => !m.isSelf).sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureMessages.length; i++) {
    const fm = fixtureMessages[i];
    const gm = geoMessages[i];
    compareProps(mismatches, byType, "message", fm.label, [
      { prop: "fromX", expected: fm.fromX, actual: gm?.fromX },
      { prop: "toX", expected: fm.toX, actual: gm?.toX },
      {
        prop: "y",
        expected: normY(fm.y, fAnchor),
        actual: gm !== undefined ? normY(gm.y, gAnchor) : undefined,
      },
    ]);
  }
}

function scoreSelfCallsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureSelfCalls = [...fixture.selfCalls].sort((a, b) => a.y - b.y);
  const geoSelfCalls = [...geometry.selfCalls].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureSelfCalls.length; i++) {
    const fs = fixtureSelfCalls[i];
    const gs = geoSelfCalls[i];
    compareProps(mismatches, byType, "selfCall", fs.label, [
      { prop: "x", expected: fs.x, actual: gs?.x },
      {
        prop: "y",
        expected: normY(fs.y, fAnchor),
        actual: gs !== undefined ? normY(gs.y, gAnchor) : undefined,
      },
      { prop: "width", expected: fs.width, actual: gs?.width },
      { prop: "height", expected: fs.height, actual: gs?.height },
    ]);
  }
}

function scoreOccurrencesNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
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
        { prop: "x", expected: fo.x, actual: go?.x },
        {
          prop: "y",
          expected: normY(fo.y, fAnchor),
          actual: go !== undefined ? normY(go.y, gAnchor) : undefined,
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
  fAnchor: number,
  gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureReturns = [...fixture.returns].sort((a, b) => a.y - b.y);
  const geoReturns = [...geometry.returns].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureReturns.length; i++) {
    const fr = fixtureReturns[i];
    const gr = geoReturns[i];
    compareProps(mismatches, byType, "return", fr.label, [
      { prop: "fromX", expected: fr.fromX, actual: gr?.fromX },
      { prop: "toX", expected: fr.toX, actual: gr?.toX },
      {
        prop: "y",
        expected: normY(fr.y, fAnchor),
        actual: gr !== undefined ? normY(gr.y, gAnchor) : undefined,
      },
    ]);
  }
}

function scoreCreationsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  for (const fc of fixture.creations) {
    const gc = geometry.creations.find((c) => c.participant.name === fc.participantName);
    const label = fc.participantName;
    compareProps(mismatches, byType, "creation", label, [
      { prop: "px", expected: fc.px, actual: gc?.participant.x },
      {
        prop: "py",
        expected: normY(fc.py, fAnchor),
        actual: gc !== undefined ? normY(gc.participant.y, gAnchor) : undefined,
      },
      { prop: "pw", expected: fc.pw, actual: gc?.participant.width },
      { prop: "ph", expected: fc.ph, actual: gc?.participant.height },
      { prop: "msgFromX", expected: fc.msgFromX, actual: gc?.message.fromX },
      { prop: "msgToX", expected: fc.msgToX, actual: gc?.message.toX },
      {
        prop: "msgY",
        expected: normY(fc.msgY, fAnchor),
        actual: gc !== undefined ? normY(gc.message.y, gAnchor) : undefined,
      },
    ]);
  }
}

function scoreFragmentsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
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
      { prop: "x", expected: ff.x, actual: gf?.x },
      {
        prop: "y",
        expected: normY(ff.y, fAnchor),
        actual: gf !== undefined ? normY(gf.y, gAnchor) : undefined,
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
          expected: normY(fs.y, fAnchor),
          actual: gs !== undefined ? normY(gs.y, gAnchor) : undefined,
        },
        { prop: "height", expected: fs.height, actual: gs?.height },
      ]);
    }
  }
}

function scoreDividersNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
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
        expected: normY(fd.y, fAnchor),
        actual: gd !== undefined ? normY(gd.y, gAnchor) : undefined,
      },
    ]);
  }
}

function scoreCommentsNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  const fixtureComments = [...fixture.comments].sort((a, b) => a.y - b.y);
  const geoComments = [...geometry.comments].sort((a, b) => a.y - b.y);

  for (let i = 0; i < fixtureComments.length; i++) {
    const fc = fixtureComments[i];
    const gc = geoComments[i];
    compareProps(mismatches, byType, "comment", fc.text, [
      { prop: "x", expected: fc.x, actual: gc?.x },
      {
        prop: "y",
        expected: normY(fc.y, fAnchor),
        actual: gc !== undefined ? normY(gc.y, gAnchor) : undefined,
      },
    ]);
  }
}

function scoreLifelinesNorm(
  fixture: GeometryFixture,
  geometry: DiagramGeometry,
  fAnchor: number,
  gAnchor: number,
  mismatches: Mismatch[],
  byType: Record<string, { matched: number; total: number }>,
): void {
  for (const fl of fixture.lifelines) {
    const gl = geometry.lifelines.find((l) => l.participantName === fl.participant);
    const label = fl.participant;
    compareProps(mismatches, byType, "lifeline", label, [
      { prop: "x", expected: fl.x, actual: gl?.x },
      {
        prop: "y1",
        expected: normY(fl.y1, fAnchor),
        actual: gl !== undefined ? normY(gl.topY, gAnchor) : undefined,
      },
      {
        prop: "y2",
        expected: normY(fl.y2, fAnchor),
        actual: gl !== undefined ? normY(gl.bottomY, gAnchor) : undefined,
      },
    ]);
  }
}

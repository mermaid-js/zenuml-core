import { describe, it, expect } from "bun:test";
import CommentClass from "@/components/Comment/Comment";
import { OCCURRENCE_BAR_SIDE_WIDTH } from "@/positioning/Constants";
import {
  buildDividerGeometry,
  buildInlineComment,
  buildMessages,
  buildReturnGeometry,
  enforceMinReturnGap,
  offsetNestedOccurrences,
} from "./buildStatementGeometry";
import type { OccurrenceGeometry, ReturnGeometry } from "./geometry";
import { statementFixture } from "./statementFixture";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";

describe("buildReturnGeometry", () => {
  it("reverse return inside a sync block runs right to left, bottom 45.5 below y when height is 0", () => {
    const fixture = statementFixture("A->B.m() {\n  return r\n}");
    const info = fixture.statements.find((s) => s.kind === "return")!;
    const ctx = fixture.contextFor(info);
    const { geometry, bottom } = buildReturnGeometry(info, ctx);
    expect(geometry).toMatchObject({ label: "r", isReverse: true });
    expect(geometry.y).toBe(ctx.coord.top + ctx.adjust + 16.5);
    expect(bottom).toBe(geometry.y + 45.5);
  });
});

describe("buildDividerGeometry", () => {
  it("strips the = markers from the measured label and spans the diagram", () => {
    const fixture = statementFixture("A.m()\n==== Section ====\nB.n()");
    const info = fixture.statements.find((s) => s.kind === "divider")!;
    const ctx = fixture.contextFor(info);
    const divider = buildDividerGeometry(info, ctx);
    expect(divider.width).toBe(ctx.diagramWidth);
    expect(divider.label).toBe(info.label);
    expect(divider.y).toBe(ctx.coord.top + ctx.adjust + ctx.coord.height / 2);
    expect(divider.labelWidth).toBeGreaterThan(0);
  });
});

describe("buildInlineComment", () => {
  it("sits at the sender lifeline, ascent below the statement top", () => {
    const fixture = statementFixture("// hello\nA->B: x");
    const info = fixture.statements.find((s) => s.kind === "async")!;
    const ctx = fixture.contextFor(info);
    const comment = buildInlineComment(
      info,
      new CommentClass(info.comment!),
      ctx,
    );
    expect(comment.text).toContain("hello");
    expect(comment.x).toBe(fixture.coordinates.getPosition("A") + 1);
    expect(comment.y).toBe(ctx.coord.top + ctx.adjust + 15);
  });
});

describe("enforceMinReturnGap", () => {
  const ret = (y: number): ReturnGeometry => ({
    fromX: 0,
    toX: 10,
    y,
    label: String(y),
    isReverse: false,
    isSelf: false,
  });

  it("sorts by y and pushes overlapping returns 16px apart", () => {
    const returns = [ret(50), ret(10), ret(12)];
    enforceMinReturnGap(returns);
    expect(returns.map((r) => r.y)).toEqual([10, 26, 50]);
  });
});

describe("offsetNestedOccurrences", () => {
  const occ = (y: number, height: number): OccurrenceGeometry => ({
    x: 100,
    y,
    width: 15,
    height,
    participantName: "B",
  });

  it("shifts an occurrence right once per containing occurrence on the same participant", () => {
    const occurrences = [occ(0, 100), occ(10, 50), occ(20, 10)];
    offsetNestedOccurrences(occurrences);
    expect(occurrences.map((o) => o.x)).toEqual([
      100,
      100 + OCCURRENCE_BAR_SIDE_WIDTH,
      100 + 2 * OCCURRENCE_BAR_SIDE_WIDTH,
    ]);
  });

  it("leaves other participants' occurrences alone", () => {
    const other = { ...occ(10, 20), participantName: "C" };
    const occurrences = [occ(0, 100), other];
    offsetNestedOccurrences(occurrences);
    expect(occurrences[1].x).toBe(100);
  });
});

describe("buildMessages", () => {
  it("routes each statement kind to its own geometry array", () => {
    const fixture = statementFixture(
      "// note\nA->B.m() {\n  B->C: hi\n  B.self()\n  b = new D()\n  return r\n}\n== div ==\nif(x) {\n  A.k()\n}",
    );
    const result = buildMessages(
      fixture.rootContext,
      fixture.coordinates,
      new VerticalCoordinates(fixture.rootContext),
      fixture.participants,
    );
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.selfCalls).toHaveLength(1);
    expect(result.creations).toHaveLength(1);
    expect(result.fragments).toHaveLength(1);
    expect(result.dividers).toHaveLength(1);
    expect(result.comments).toHaveLength(1);
    expect(result.returns.length).toBeGreaterThanOrEqual(2);
    expect(result.maxReturnBottom).toBeGreaterThan(0);
  });
});

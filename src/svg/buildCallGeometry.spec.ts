import { describe, it, expect } from "bun:test";
import { OCCURRENCE_BAR_SIDE_WIDTH } from "@/positioning/Constants";
import { buildCallGeometry } from "./buildCallGeometry";
import { statementFixture } from "./statementFixture";

function firstOf(code: string, kind: "sync" | "async", self = false) {
  const fixture = statementFixture(code);
  const info = fixture.statements.find(
    (s) => s.kind === kind && s.isSelf === self,
  )!;
  return { fixture, info, ctx: fixture.contextFor(info) };
}

describe("buildCallGeometry", () => {
  it("sync call: an arrow stopping at the new occurrence, plus the occurrence", () => {
    const { fixture, info, ctx } = firstOf("A->B.m() {\n  B.n()\n}", "sync");
    const call = buildCallGeometry(info, ctx);
    const toX = fixture.coordinates.getPosition("B");
    expect(call.selfCall).toBeUndefined();
    expect(call.assignmentReturn).toBeUndefined();
    expect(call.message).toMatchObject({
      toX: toX - OCCURRENCE_BAR_SIDE_WIDTH,
      arrowStyle: "solid",
      isReverse: false,
      isSelf: false,
    });
    expect(call.occurrence).toMatchObject({
      x: toX - OCCURRENCE_BAR_SIDE_WIDTH,
      participantName: "B",
    });
    expect(call.occurrence!.y).toBe(call.message!.y - 1.5);
  });

  it("async call: open arrow to the lifeline, no occurrence", () => {
    const { fixture, info, ctx } = firstOf("A->B: hello", "async");
    const call = buildCallGeometry(info, ctx);
    expect(call.message).toMatchObject({
      fromX: fixture.coordinates.getPosition("A"),
      toX: fixture.coordinates.getPosition("B"),
      arrowStyle: "open",
      label: "hello",
    });
    expect(call.occurrence).toBeUndefined();
  });

  it("self call: a loop at the sender, no message arrow", () => {
    const { info, ctx } = firstOf("A.m() {\n  A.again()\n}", "sync", true);
    const call = buildCallGeometry(info, ctx);
    expect(call.message).toBeUndefined();
    expect(call.selfCall).toMatchObject({ arrowStyle: "solid" });
    expect(call.occurrence).toBeDefined();
  });

  it("async self call: open arrow, 28px wide", () => {
    const { info, ctx } = firstOf("A->A: loop back", "async", true);
    const call = buildCallGeometry(info, ctx);
    expect(call.selfCall).toMatchObject({ arrowStyle: "open", width: 28 });
    expect(call.occurrence).toBeUndefined();
  });

  it("pushes the arrow down by the inline comment height", () => {
    const { info, fixture } = firstOf("A->B: hello", "async");
    const plain = buildCallGeometry(info, fixture.contextFor(info));
    const withComment = buildCallGeometry(
      info,
      fixture.contextFor(info, { commentHeight: 20 }),
    );
    expect(withComment.message!.y - plain.message!.y).toBe(20);
  });

  it("assignment return: numbered after the block children, with a bottom bound", () => {
    const code = "r = A->B.m() {\n  B.n()\n}";
    const fixture = statementFixture(code);
    const info = fixture.statements.find((s) => s.kind === "sync")!;
    const ctx = fixture.contextFor(info, {
      blockChildCount: new Map([[info.number!, 1]]),
    });
    const call = buildCallGeometry(info, ctx);
    expect(call.assignmentReturn).toMatchObject({
      label: "r",
      isSelf: false,
      isReverse: true,
      number: `${info.number}.2`,
    });
    const occ = call.occurrence!;
    expect(call.assignmentReturn!.y).toBe(occ.y + occ.height - 2);
    expect(call.returnBottom).toBe(call.assignmentReturn!.y + 46);
  });

  it("sender with an occurrence starts the arrow at its near edge", () => {
    const fixture = statementFixture("A->B.m() {\n  B->C.n()\n}");
    const inner = fixture.statements.filter((s) => s.kind === "sync")[1];
    const call = buildCallGeometry(inner, fixture.contextFor(inner));
    expect(call.message!.fromX).toBeGreaterThan(
      fixture.coordinates.getPosition("B"),
    );
  });
});

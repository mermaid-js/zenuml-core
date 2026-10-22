import { describe, it, expect } from "bun:test";
import {
  OCCURRENCE_BAR_SIDE_WIDTH,
  OCCURRENCE_EMPTY_HEIGHT,
} from "@/positioning/Constants";
import { buildCreationGeometry } from "./buildCreationGeometry";
import { PARTICIPANT_VISUAL_HEIGHT } from "./svgConstants";
import { statementFixture } from "./statementFixture";

function creationOf(code: string) {
  const fixture = statementFixture(code);
  const info = fixture.statements.find((s) => s.kind === "creation")!;
  return { fixture, info, ctx: fixture.contextFor(info) };
}

describe("buildCreationGeometry", () => {
  it("centres the open arrow on the created participant box", () => {
    const { fixture, info, ctx } = creationOf("A.m() {\n  new B\n}");
    const created = buildCreationGeometry(info, ctx);
    const target = fixture.participants.find((p) => p.name === "B")!;
    expect(created.creation!.participant).toBe(target);
    expect(created.creation!.message).toMatchObject({
      y: target.y + PARTICIPANT_VISUAL_HEIGHT / 2,
      toX: fixture.coordinates.getPosition("B"),
      arrowStyle: "open",
      isSelf: false,
    });
    expect(created.assignmentReturn).toBeUndefined();
  });

  it("reserves an occurrence under the participant box, at least the empty height", () => {
    const { fixture, info, ctx } = creationOf("new B");
    const created = buildCreationGeometry(info, ctx);
    const target = fixture.participants.find((p) => p.name === "B")!;
    expect(created.occurrence).toMatchObject({
      x: fixture.coordinates.getPosition("B") - OCCURRENCE_BAR_SIDE_WIDTH,
      y: target.y + PARTICIPANT_VISUAL_HEIGHT - 2,
      participantName: "B",
    });
    expect(created.occurrence!.height).toBeGreaterThanOrEqual(
      OCCURRENCE_EMPTY_HEIGHT,
    );
  });

  it("assignment return: leaves the created occurrence bottom and carries a bottom bound", () => {
    const { info, fixture } = creationOf("A.m() {\n  b = new B()\n}");
    const ctx = fixture.contextFor(info, {
      blockChildCount: new Map([[info.number!, 2]]),
    });
    const created = buildCreationGeometry(info, ctx);
    const occ = created.occurrence!;
    expect(created.assignmentReturn).toMatchObject({
      label: "b",
      y: occ.y + occ.height - 2,
      number: `${info.number}.3`,
      isReverse: true,
    });
    expect(created.returnBottom).toBe(created.assignmentReturn!.y + 46);
  });

  it("styles the arrow label from the styling comment", () => {
    const { info, fixture } = creationOf("new B");
    const created = buildCreationGeometry(
      info,
      fixture.contextFor(info, { messageStyle: { fill: "red" } }),
    );
    expect(created.creation!.message.style).toEqual({ fill: "red" });
  });

  it("right-to-left creation points the arrow leftwards", () => {
    const { info, ctx } = creationOf("B A\nA->B: x\nA.m() {\n  new B\n}");
    const created = buildCreationGeometry(info, ctx);
    expect(created.creation!.message.isReverse).toBe(true);
  });
});

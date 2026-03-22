import { _STARTER_ } from "@/parser/OrderedParticipants";
import { Fixture } from "../../../../../../../test/unit/parser/fixture/Fixture";
import { depthOnParticipant } from "./useArrow";

describe("depthOnParticipant", () => {
  it("counts the implicit starter self occurrence for nested root self-sync messages", () => {
    const context = Fixture.firstChild(`selfSync() {
  A.method {
    B.method
  }
}`);

    expect(depthOnParticipant(context, _STARTER_)).toBe(1);
  });

  it("does not shift plain root starter messages", () => {
    const context = Fixture.firstStatement("A.m");

    expect(depthOnParticipant(context, _STARTER_)).toBe(0);
  });
});

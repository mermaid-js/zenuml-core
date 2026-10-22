/**
 * There three sources of participants:
 * 1. Explicit participants from participant declarations
 * 2. @Starter
 * 3. Implicit participants from messages
 *
 * Let's first decide when we are not using @Starter:
 * The order will be _STARTER_, declared participants, implicit participants
 *
 * If we are using @Starter, and the `starter` is included in the declared participants,
 * the order will be declared participants (starter will be at the declared position), implicit participants.
 * If the `starter` is not included in the declared participants, the order will be
 * `starter`, declared participants, implicit participants.
 *
 * Examples:
 * A B C.m                => _STARTER_(invisible), A, B, C
 * A B @Starter(C) C.m    => C, A, B
 * A B @Starter(B) C.m    => A, B, C
 *
 * The concept is that declarations are for explicit positioning.
 * @Starter explicitly declare but still using implicit positioning (left-most).
 *
 * A participant can be either explicitly positioned or implicit positioned.
 *
 * @Starter does NOT explicitly position a participant. It works like `absolute`
 * in CSS. It pulls the participant out of the flow.
 *
 * Participant declaration works like `#id {display: relative}` in CSS. It puts
 * the participants back in the flow and a fixed flow decided by itself.
 */

import { RootContext } from "./index";
import { _STARTER_, OrderedParticipants } from "./OrderedParticipants";
import {
  participantDisplayName,
  participantHasIcon,
  type IParticipantModel,
} from "./IParticipantModel";
import { expect } from "vitest";

function getFlattenedParticipants(code: string) {
  const rootContext = RootContext(code);
  return OrderedParticipants(rootContext);
}

// Helper function to convert participant models to simplified objects for testing
function participantsForTest(
  participants: IParticipantModel[],
): Array<Record<string, any>> {
  return participants.map((p) => {
    const result: Record<string, any> = {
      name: p.name,
      left: p.left,
    };
    if (p.label !== undefined) {
      result.label = p.label;
    }
    return result;
  });
}

function getTestParticipants(code: string) {
  return participantsForTest(getFlattenedParticipants(code));
}

describe("Participants.Order", () => {
  it("@return", () => {
    expect(getTestParticipants("@return A->B:m")).toEqual([
      { name: "A", left: "" },
      { name: "B", left: "A" },
    ]);
  });

  it("return arrow shortcut A-->B:m", () => {
    expect(getTestParticipants("A-->B:m")).toEqual([
      { name: "A", left: "" },
      { name: "B", left: "A" },
    ]);
  });
  it("should return the order of participants", () => {
    expect(getTestParticipants("A as A1 B C.m")).toEqual([
      { name: _STARTER_, left: "" },
      { name: "A", label: "A1", left: _STARTER_ },
      { name: "B", label: undefined, left: "A" },
      { name: "C", left: "B" },
    ]);
  });

  it("should return the order of participants - Starter", () => {
    expect(getTestParticipants("@Starter(A)")).toEqual([
      { name: "A", left: "", label: undefined },
    ]);

    expect(getTestParticipants("A @Starter(B)")).toEqual([
      { name: "A", left: "", label: undefined },
      { name: "B", left: "A", label: undefined },
    ]);

    expect(
      getTestParticipants(`A
@Starter("B")
A.mA {
   self() {
    C.mB()
  }
}`),
    ).toEqual([
      { name: "A", left: "", label: undefined },
      { name: "B", left: "A", label: undefined },
      { name: "C", left: "B", label: undefined },
    ]);

    expect(getTestParticipants("A B @Starter(C) C.m")).toEqual([
      { name: "A", left: "", label: undefined },
      { name: "B", left: "A", label: undefined },
      { name: "C", left: "B", label: undefined },
    ]);

    expect(getTestParticipants("A B->A.m C->D.m")).toEqual([
      { name: "A", left: "", label: undefined },
      { name: "B", left: "A", label: undefined },
      { name: "C", left: "B", label: undefined },
      { name: "D", left: "C", label: undefined },
    ]);
  });

  it("should return the order of participants", () => {
    const testParticipants = getTestParticipants("A B @Starter(B) A.m C.m");
    expect(testParticipants).toEqual([
      { name: "A", left: "" },
      { name: "B", left: "A" },
      { name: "C", left: "B" },
    ]);
  });

  it("should return the order of participants", () => {
    expect(getTestParticipants("A.m")).toEqual([
      { left: "", name: _STARTER_ },
      { left: _STARTER_, name: "A" },
    ]);
  });

  it("should return the order of participants - ignore expression in parameters", () => {
    expect(getTestParticipants("A.m(B.m)")).toEqual([
      { left: "", name: _STARTER_ },
      { left: _STARTER_, name: "A" },
    ]);
  });

  it("should return the order of participants - ignore expression in condition", () => {
    expect(getTestParticipants("if(B.m1){A.m2}")).toEqual([
      { left: "", name: _STARTER_ },
      { left: _STARTER_, name: "A" },
    ]);
  });

  it("should return the order of participants - return", () => {
    expect(
      getTestParticipants(`
A.method(){
  return x
}
`),
    ).toEqual([
      { left: "", name: _STARTER_ },
      { left: _STARTER_, name: "A" },
    ]);
  });
});

describe("OrderedParticipants model fields", () => {
  it("carries every declared field under its own name", () => {
    const p = getFlattenedParticipants("@Actor A as Alice\nA.m").find(
      (x) => x.name === "A",
    );
    expect(p!.label).toBe("Alice");
    expect(p!.type).toBe("Actor");
  });

  it("keeps groupId and emoji apart", () => {
    const models = getFlattenedParticipants("group G {\n A\n}\nB\nA->B: m");
    const a = models.find((x) => x.name === "A")!;
    const b = models.find((x) => x.name === "B")!;
    expect(a.groupId).toBeDefined();
    expect(a.emoji).toBeUndefined();
    expect(b.groupId).toBeUndefined();
  });

  it("keeps isStarter on the injected default starter and on @Starter", () => {
    const implicit = getFlattenedParticipants("A.m");
    expect(implicit[0].name).toBe(_STARTER_);
    expect(implicit[0].isStarter).toBe(true);
    expect(implicit[1].isStarter).toBeFalsy();

    const declared = getFlattenedParticipants("@Starter(A)\nA->B: m");
    expect(declared.find((x) => x.name === "A")!.isStarter).toBe(true);
  });

  it("derives label and icon through the helper functions", () => {
    const [a, b] = getFlattenedParticipants("@Actor A as Alice\nB\nA->B: m");
    expect(participantDisplayName(a)).toBe("Alice");
    expect(participantDisplayName(b)).toBe("B");
    expect(participantHasIcon(a)).toBe(true);
    expect(participantHasIcon(b)).toBe(false);
  });
});

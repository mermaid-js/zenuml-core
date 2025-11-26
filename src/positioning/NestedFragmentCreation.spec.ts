import { RootContext } from "@/parser";
import { VerticalCoordinates } from "@/positioning/VerticalCoordinates";
import { Coordinates } from "@/positioning/Coordinates";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { WidthFunc, TextType } from "@/positioning/Coordinate";

const stubWidthProvider: WidthFunc = (text: string, type: TextType) => {
  const base = type === TextType.ParticipantName ? 10 : 8;
  return Math.max(40, text.length * base);
};

describe("Nested Fragment Creation Tests", () => {
  /**
   * Tests creation positioning in deeply nested structures.
   * These test cases are designed to catch edge cases in the vertical
   * coordinate calculation for creations inside nested fragments.
   */

  it("handles creation inside alt inside par", () => {
    const code = `par {
  if(x) {
    new A
  } else {
    new B
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(2);

    // Verify that creationAltBranchOffset is NOT applied (anchorAdjustment should be 0)
    creations.forEach(([, coord]) => {
      expect((coord.meta as any).anchorAdjustment).toBe(0);
    });

    // Verify altBranchInset is increased for nested alts
    creations.forEach(([, coord]) => {
      expect((coord.meta as any).altBranchInset).toBe(3);
    });
  });

  it("handles creation inside alt inside loop", () => {
    const code = `loop(items) {
  if(x) {
    new A
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation");

    expect(creations.length).toBe(1);
    // Single-branch alt doesn't have altBranchInset applied
    expect((creations[0][1].meta as any).altBranchInset).toBe(0);
  });

  it("handles creation inside alt inside opt", () => {
    const code = `opt {
  if(x) {
    new A
  } else {
    new B
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(2);
    // Both should have increased altBranchInset for nested alts
    creations.forEach(([, coord]) => {
      expect((coord.meta as any).altBranchInset).toBe(3);
      expect((coord.meta as any).anchorAdjustment).toBe(0);
    });
  });

  it("handles creation inside alt inside critical", () => {
    const code = `critical {
  if(x) {
    new A
  } else {
    new B
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(2);
    creations.forEach(([, coord]) => {
      expect((coord.meta as any).altBranchInset).toBe(3);
      expect((coord.meta as any).anchorAdjustment).toBe(0);
    });
  });

  it("handles creation inside alt at root level", () => {
    const code = `if(x) {
  new A
} else {
  new B
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(2);
    // Root level alt uses the standard altBranchInset (1)
    creations.forEach(([, coord]) => {
      expect((coord.meta as any).altBranchInset).toBe(1);
      expect((coord.meta as any).anchorAdjustment).toBe(0);
    });
  });

  it("handles creation inside alt inside sync message occurrence", () => {
    const code = `A.method() {
  if(x) {
    new B
  } else {
    new C
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(2);
    // Alt inside sync message (occurrence) is NOT inside a fragment,
    // so it uses creationAltBranchOffset
    creations.forEach(([, coord]) => {
      expect((coord.meta as any).anchorAdjustment).toBe(11);
      expect((coord.meta as any).altBranchInset).toBe(1);
    });
  });

  it("handles deeply nested creation: alt inside par inside catch inside try", () => {
    const code = `try {
  new A
} catch {
  par {
    new B
    if(x) {
      new C
    } else {
      new D
    }
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(4);

    // A is inside try block
    const [, aCoord] = creations[0];
    expect((aCoord.meta as any).anchorAdjustment).toBe(1); // creationTcfSegmentOffset

    // B is inside par inside catch
    const [, bCoord] = creations[1];
    expect((bCoord.meta as any).anchorAdjustment).toBe(0);

    // C and D are inside alt inside par inside catch
    const [, cCoord] = creations[2];
    const [, dCoord] = creations[3];
    expect((cCoord.meta as any).altBranchInset).toBe(3);
    expect((dCoord.meta as any).altBranchInset).toBe(3);
    expect((cCoord.meta as any).anchorAdjustment).toBe(0);
    expect((dCoord.meta as any).anchorAdjustment).toBe(0);
  });

  it("handles multiple alts at different nesting levels", () => {
    const code = `if(x) {
  new A
}
par {
  if(y) {
    new B
  } else {
    new C
  }
}`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });

    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .sort((a, b) => a[1].top - b[1].top);

    expect(creations.length).toBe(3);

    // A is inside root-level alt (single branch, no inset)
    const [, aCoord] = creations[0];
    expect((aCoord.meta as any).altBranchInset).toBe(0);
    expect((aCoord.meta as any).anchorAdjustment).toBe(0);

    // B and C are inside alt inside par (nested, increased inset)
    const [, bCoord] = creations[1];
    const [, cCoord] = creations[2];
    expect((bCoord.meta as any).altBranchInset).toBe(3);
    expect((cCoord.meta as any).altBranchInset).toBe(3);
  });
});

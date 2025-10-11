import { calculateArrowGeometry } from "@/vm/geometry/arrow";
import type { Coordinates } from "@/positioning/Coordinates";

const coordinatesStub = {
  getPosition(participant: string) {
    if (participant === "A") return 100;
    if (participant === "B") return 300;
    return 0;
  },
  distance(left: string, right: string) {
    return this.getPosition(right) - this.getPosition(left);
  },
  orderedParticipantNames() {
    return ["A", "B", "C"];
  },
} as unknown as Coordinates;

describe("calculateArrowGeometry", () => {
  it("computes translateX and width for simple arrow", () => {
    const statement = {
      from: "A",
      to: "B",
      parent: null, // root level statement
    };
    
    const geometry = calculateArrowGeometry("A", coordinatesStub, statement);

    expect(Number.isFinite(geometry.translateX)).toBe(true);
    expect(geometry.translateX).toBeGreaterThanOrEqual(0);
    expect(geometry.interactionWidth).toBeGreaterThan(0);
  });
});

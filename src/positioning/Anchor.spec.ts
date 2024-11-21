import Anchor from "@/positioning/Anchor";

describe("Anchor", () => {
  describe("calculateEdgeOffset", () => {
    test.each([
      {
        name: "same positions, different offsets",
        anchor1: [100, 10],
        anchor2: [100, 20],
        expected: 10,
        explanation: "0 - 10 + 20",
      },
      {
        name: "positive direction (other is ahead)",
        anchor1: [100, 10],
        anchor2: [200, 20],
        expected: 110,
        explanation: "200-100 - 10 + 20",
      },
      {
        name: "negative direction (other is behind)",
        anchor1: [200, 10],
        anchor2: [100, 20],
        expected: -90,
        explanation: "100-200 - 10 + 20",
      },
      {
        name: "with negative positions",
        anchor1: [-200, 10],
        anchor2: [-100, 20],
        expected: 110,
        explanation: "-100-(-200) - 10 + 20",
      },
      {
        name: "zero offsets",
        anchor1: [100, 0],
        anchor2: [200, 0],
        expected: 100,
        explanation: "200-100 - 0 + 0",
      },
    ])(
      "$name => $explanation = $expected",
      ({ anchor1, anchor2, expected }) => {
        const a1 = new Anchor(anchor1[0], anchor1[1]);
        const a2 = new Anchor(anchor2[0], anchor2[1]);

        expect(a1.calculateEdgeOffset(a2)).toBe(expected);
      },
    );

    it("is not commutative - order affects direction", () => {
      const a1 = new Anchor(100, 10);
      const a2 = new Anchor(200, 20);

      expect(a1.calculateEdgeOffset(a2)).toBe(110); // positive direction
      expect(a2.calculateEdgeOffset(a1)).toBe(-110); // negative direction
    });
  });
});

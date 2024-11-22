import Anchor2 from "@/positioning/Anchor2";

describe("Anchor2", () => {
  describe("Center of Right Wall", () => {
    test.each([
      {
        name: "0 layers",
        position: 100,
        layers: 0,
        expected: 100,
        explanation: "position",
      },
      {
        name: "1 layer",
        position: 100,
        layers: 1,
        expected: 100,
        explanation: "position + WALL_OVERLAP * (layers - 1)",
      },
      {
        name: "2 layers",
        position: 100,
        layers: 2,
        expected: 107,
        explanation: "position + WALL_OVERLAP * (layers - 1)",
      },
    ])(
      "$name => $explanation = $expected",
      ({ position, layers, expected }) => {
        const a = new Anchor2(position, layers);

        expect(a.centerOfRightWall()).toBe(expected);
      },
    );
  });

  describe("Right Edge of Right Wall", () => {
    test.each([
      {
        name: "0 layers",
        position: 100,
        layers: 0,
        expected: 100,
        explanation: "position",
      },
      {
        name: "1 layer",
        position: 100,
        layers: 1,
        expected: 107,
        explanation: "position + WALL_OVERLAP * layers",
      },
      {
        name: "2 layers",
        position: 100,
        layers: 2,
        expected: 114,
        explanation: "position + WALL_OVERLAP * layers",
      },
    ])(
      "$name => $explanation = $expected",
      ({ position, layers, expected }) => {
        const a = new Anchor2(position, layers);

        expect(a.rightEdgeOfRightWall()).toBe(expected);
      },
    );
  });

  describe("Left Edge of Right Wall", () => {
    test.each([
      {
        name: "0 layers",
        position: 100,
        layers: 0,
        expected: 100,
        explanation: "position",
      },
      {
        name: "1 layer",
        position: 100,
        layers: 1,
        expected: 93,
        explanation: "position - WALL_OVERLAP * (layers - 1)",
      },
      {
        name: "2 layers",
        position: 100,
        layers: 2,
        expected: 100,
        explanation: "position - WALL_OVERLAP * (layers - 1)",
      },
    ])(
      "$name => $explanation = $expected",
      ({ position, layers, expected }) => {
        const a = new Anchor2(position, layers);

        expect(a.leftEdgeOfRightWall()).toBe(expected);
      },
    );
  });

  /**
   * centerToEdge is used for translateX calculations.
   */
  describe("centerToEdge", () => {
    test.each([
      {
        name: "0 layer anchors",
        anchor1: { position: 100, layers: 0 },
        anchor2: { position: 200, layers: 0 },
        expectedLtr: 100,
        expectedRtl: -100,
        explanation: "just position difference (200 - 100)",
      },
      {
        name: "0 layer left anchor",
        anchor1: { position: 100, layers: 0 },
        anchor2: { position: 200, layers: 1 },
        expectedLtr: 107,
        expectedRtl: -100,
        explanation: "(200 - 7) - 100 - 1; 100 - 200",
      },
      {
        name: "0 layer right anchor 1",
        anchor1: { position: 100, layers: 1 },
        anchor2: { position: 200, layers: 0 },
        expectedLtr: 100,
        expectedRtl: -93,
        explanation: "200 - 100; 200 - (100 + 7) - 1",
      },
      {
        name: "0 layer right anchor 2",
        anchor1: { position: 100, layers: 2 },
        anchor2: { position: 200, layers: 0 },
        expectedLtr: 93,
        expectedRtl: -86,
        explanation: "200 - 100; 200 - (100 + 7) - 1",
      },
      {
        name: "single layer anchors",
        anchor1: { position: 100, layers: 1 },
        anchor2: { position: 200, layers: 1 },
        expectedLtr: 107,
        expectedRtl: -93,
        explanation: "200 - (100 + 7) - 1; 100 - (200 - 7) + 1",
      },
      {
        name: "single layer anchors same position",
        anchor1: { position: 100, layers: 1 },
        anchor2: { position: 100, layers: 1 },
        expectedLtr: 7,
        expectedRtl: 7,
        explanation: "200 - (100 + 7) - 1; 100 - (200 - 7) + 1",
      },
      {
        name: "multiple layer anchors",
        anchor1: { position: 100, layers: 2 },
        anchor2: { position: 200, layers: 3 },
        expectedLtr: 114,
        expectedRtl: -100,
        explanation: "200 - (100 + 7) - 1; 100 - (200 - 7) + 1",
      },
    ])(
      "$name => $explanation = $expected",
      ({ anchor1, anchor2, expectedLtr, expectedRtl }) => {
        const a1 = new Anchor2(anchor1.position, anchor1.layers);
        const a2 = new Anchor2(anchor2.position, anchor2.layers);

        expect(a1.centerToEdge(a2)).toBe(expectedLtr);
        expect(a2.centerToEdge(a1)).toBe(expectedRtl);
      },
    );
  });

  /**
   * edgeOffset is used for interactionWidth calculations.
   */
  describe("edgeOffset", () => {
    test.each([
      {
        name: "0 layer anchors",
        anchor1: { position: 100, layers: 0 },
        anchor2: { position: 200, layers: 0 },
        expectedLtr: 99,
        expectedRtl: -99,
        explanation: "200 - 100 - 1",
      },
      {
        name: "0 layer at left 1",
        anchor1: { position: 100, layers: 0 },
        anchor2: { position: 200, layers: 1 },
        expectedLtr: 92,
        expectedRtl: -92,
        explanation: "(200 - 7 * 1) - 100 - 1",
      },
      {
        name: "0 layer at left",
        anchor1: { position: 100, layers: 0 },
        anchor2: { position: 200, layers: 2 },
        expectedLtr: 99,
        expectedRtl: -99,
        explanation: "(200 - 7 + 7 + (2-1)) - 100 - 1",
      },
      {
        name: "0 layer at right",
        anchor1: { position: 100, layers: 1 },
        anchor2: { position: 200, layers: 0 },
        expectedLtr: 92,
        expectedRtl: -92,
        explanation: "200 - (100 + 7 * 1) - 1",
      },
      {
        name: "single layer anchors",
        anchor1: { position: 100, layers: 1 },
        anchor2: { position: 200, layers: 1 },
        expectedLtr: 85,
        expectedRtl: -85,
        explanation: "200 - 7 - (100 + 7) - 1",
      },
      {
        name: "multiple layers on first anchor",
        anchor1: { position: 100, layers: 2 },
        anchor2: { position: 200, layers: 1 },
        expectedLtr: 78,
        expectedRtl: -78,
        explanation: "200 - 7 - (100 + 7 * 2) - 1",
      },
      {
        name: "multiple layers on first anchor",
        anchor1: { position: 100, layers: 3 },
        anchor2: { position: 200, layers: 1 },
        expectedLtr: 71,
        expectedRtl: -71,
        explanation: "(200 - 7 + 7 * (1 - 1) - (100 + 7 * 3) - 1",
      },
      {
        name: "multiple layers on second anchor",
        anchor1: { position: 100, layers: 1 },
        anchor2: { position: 200, layers: 2 },
        expectedLtr: 92,
        expectedRtl: -92,
        explanation: "(200 - 7 + 7 * (2 - 1)) - (100 + 7) - 1",
      },
      {
        name: "multiple layers on both anchors",
        anchor1: { position: 100, layers: 3 },
        anchor2: { position: 200, layers: 2 },
        expectedLtr: 78,
        expectedRtl: -78,
        explanation: "(200 - 7 + 7 * (2 - 1)) - (100 + 7 * 3) - 1",
      },
      {
        name: "minimum gap when close",
        anchor1: { position: 100, layers: 2 },
        anchor2: { position: 100, layers: 2 },
        expectedLtr: 0,
        expectedRtl: 0,
        explanation: "walls would overlap, return minimum gap of 0",
      },
    ])(
      "$name => $explanation = $expected",
      ({ anchor1, anchor2, expectedLtr, expectedRtl }) => {
        const a1 = new Anchor2(anchor1.position, anchor1.layers);
        const a2 = new Anchor2(anchor2.position, anchor2.layers);

        expect(a1.edgeOffset(a2)).toBe(expectedLtr);
        expect(a2.edgeOffset(a1)).toBe(expectedRtl);
      },
    );
  });
});

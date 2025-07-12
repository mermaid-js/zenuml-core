import { useArrow } from "./useArrow";
import { Fixture } from "../../../../../../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/parser/OrderedParticipants";

// Mock the utils module
vi.mock("./utils", () => ({
  centerOf: vi.fn((participant: string) => {
    const positions = { [_STARTER_]: 0, A: 100, B: 200, C: 300 };
    return positions[participant] || 0;
  }),
  distance2: vi.fn((source: string, target: string) => {
    const positions = { [_STARTER_]: 0, A: 100, B: 200, C: 300 };
    return (positions[target] || 0) - (positions[source] || 0);
  }),
}));

describe("useArrow", () => {
  test("should return structured arrow data for simple message", () => {
    const context = Fixture.firstStatement("A.method");
    const result = useArrow({
      context,
      origin: _STARTER_,
      source: "A",
      target: "B",
    });

    expect(result).toEqual(
      expect.objectContaining({
        isSelf: false,
        originLayers: 0,
        sourceLayers: 0,
        targetLayers: 0,
        rightToLeft: false,
      }),
    );

    expect(result.anchor2Origin).toBeDefined();
    expect(result.anchor2Source).toBeDefined();
    expect(result.anchor2Target).toBeDefined();
    expect(typeof result.interactionWidth).toBe("number");
    expect(typeof result.translateX).toBe("number");
  });

  test("should handle self message", () => {
    const context = Fixture.firstStatement("A.method");
    const result = useArrow({
      context,
      origin: _STARTER_,
      source: "A",
      target: "A",
    });

    expect(result.isSelf).toBe(true);
    expect(result.rightToLeft).toBe(false);
  });

  test("should handle right to left message", () => {
    const context = Fixture.firstStatement("A.method");
    const result = useArrow({
      context,
      origin: _STARTER_,
      source: "B",
      target: "A",
    });

    expect(result.rightToLeft).toBe(true);
  });

  test("should return correct layers for nested message", () => {
    const context = Fixture.firstStatement("A.method { B.method }");
    const nestedContext = context.children[0].children[0];

    const result = useArrow({
      context: nestedContext,
      origin: _STARTER_,
      source: "A",
      target: "B",
    });

    expect(result.originLayers).toBe(0);
    expect(result.sourceLayers).toBe(1);
    expect(result.targetLayers).toBe(0);
  });
});

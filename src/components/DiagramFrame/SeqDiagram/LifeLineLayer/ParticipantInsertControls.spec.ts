import { describe, expect, it } from "vitest";
import { computeAppendAnchor } from "./ParticipantInsertControls";
import { MARGIN } from "@/positioning/Constants";

const stubCoordinates = (
  edges: Record<string, { left: number; right: number }>,
) =>
  ({
    left: (name: string) => edges[name].left,
    right: (name: string) => edges[name].right,
  }) as unknown as Parameters<typeof computeAppendAnchor>[0];

describe("computeAppendAnchor", () => {
  it("places the button half of the previous gap to the right of the last participant (>=2 participants)", () => {
    // A: [50, 100]   B: [180, 230]   gap A->B = 80
    const coordinates = stubCoordinates({
      A: { left: 50, right: 100 },
      B: { left: 180, right: 230 },
    });
    // expected: right(B) + (left(B) - right(A)) / 2 = 230 + 80/2 = 270
    expect(computeAppendAnchor(coordinates, ["A", "B"])).toBe(270);
  });

  it("falls back to MARGIN/2 to the right when only one participant", () => {
    const coordinates = stubCoordinates({ A: { left: 50, right: 100 } });
    expect(computeAppendAnchor(coordinates, ["A"])).toBe(100 + MARGIN / 2);
  });

  it("returns null when there are no participants", () => {
    const coordinates = stubCoordinates({});
    expect(computeAppendAnchor(coordinates, [])).toBeNull();
  });
});

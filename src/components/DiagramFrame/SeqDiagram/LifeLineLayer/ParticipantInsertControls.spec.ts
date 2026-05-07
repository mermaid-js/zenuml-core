import { describe, expect, it } from "vitest";
import {
  computeAppendAnchor,
  computeGapAnchor,
  computePrependAnchor,
} from "./ParticipantInsertControls";
import { MARGIN } from "@/positioning/Constants";

const stubCoordinates = (
  edges: Record<string, { boxLeft: number; boxRight: number }>,
) =>
  ({
    boxLeft: (name: string) => edges[name].boxLeft,
    boxRight: (name: string) => edges[name].boxRight,
  }) as unknown as Parameters<typeof computeAppendAnchor>[0];

describe("computeGapAnchor", () => {
  it("returns the midpoint of two participants' DOM box edges", () => {
    // A right at 100, B left at 180 → midpoint 140
    const coordinates = stubCoordinates({
      A: { boxLeft: 50, boxRight: 100 },
      B: { boxLeft: 180, boxRight: 230 },
    });
    expect(computeGapAnchor(coordinates, "A", "B")).toBe(140);
  });
});

describe("computeAppendAnchor", () => {
  it("places the button at a fixed MARGIN/2 offset to the right of the last participant (>=2 participants)", () => {
    const coordinates = stubCoordinates({
      A: { boxLeft: 50, boxRight: 100 },
      B: { boxLeft: 180, boxRight: 230 },
    });
    expect(computeAppendAnchor(coordinates, ["A", "B"])).toBe(230 + MARGIN / 2);
  });

  it("uses the same fixed offset for a single participant (consistent with the multi-participant case)", () => {
    const coordinates = stubCoordinates({
      A: { boxLeft: 50, boxRight: 100 },
    });
    expect(computeAppendAnchor(coordinates, ["A"])).toBe(100 + MARGIN / 2);
  });

  it("returns null when there are no participants", () => {
    const coordinates = stubCoordinates({});
    expect(computeAppendAnchor(coordinates, [])).toBeNull();
  });
});

describe("computePrependAnchor", () => {
  it("places the button at a fixed MARGIN/2 offset to the left of the first participant (>=2 participants)", () => {
    const coordinates = stubCoordinates({
      A: { boxLeft: 50, boxRight: 100 },
      B: { boxLeft: 180, boxRight: 230 },
    });
    expect(computePrependAnchor(coordinates, ["A", "B"])).toBe(50 - MARGIN / 2);
  });

  it("uses the same fixed offset for a single participant (consistent with the multi-participant case)", () => {
    const coordinates = stubCoordinates({
      A: { boxLeft: 50, boxRight: 100 },
    });
    expect(computePrependAnchor(coordinates, ["A"])).toBe(50 - MARGIN / 2);
  });

  it("returns null when there are no participants", () => {
    const coordinates = stubCoordinates({});
    expect(computePrependAnchor(coordinates, [])).toBeNull();
  });
});

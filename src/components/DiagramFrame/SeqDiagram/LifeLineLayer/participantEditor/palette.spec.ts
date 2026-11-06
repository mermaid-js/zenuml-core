import { participantTextColor } from "@/utils/Color";
import { ARCHETYPES, PRESET_COLORS } from "./palette";

describe("participant editor palette", () => {
  it("has 10 named colours with valid hexes and no empty entry", () => {
    expect(PRESET_COLORS.map((c) => c.name)).toEqual([
      "Rose",
      "Amber",
      "Emerald",
      "Blue",
      "Violet",
      "Deep rose",
      "Brown",
      "Deep emerald",
      "Deep blue",
      "Deep violet",
    ]);
    for (const c of PRESET_COLORS) expect(c.hex).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("has light colours in the top row and dark colours in the bottom row", () => {
    expect(
      PRESET_COLORS.slice(0, 5).map((c) => participantTextColor(c.hex)),
    ).toEqual(Array(5).fill("#000"));
    expect(
      PRESET_COLORS.slice(5).map((c) => participantTextColor(c.hex)),
    ).toEqual(Array(5).fill("#fff"));
  });

  it("has 6 archetypes and no Default / None entry", () => {
    expect(ARCHETYPES.map((a) => a.label)).toEqual([
      "Actor",
      "Boundary",
      "Control",
      "Entity",
      "Database",
      "Queue",
    ]);
    for (const a of ARCHETYPES) {
      expect(a.key).toBeTruthy();
      expect(a.label).not.toMatch(/default|none/i);
    }
  });
});

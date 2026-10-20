import { describe, expect, it } from "vitest";
import {
  apcaContrast,
  composite,
  formatOklch,
  oklchToHex,
  parseColorAlpha,
  simulateCvd,
  srgbToOklch,
  toHex,
} from "../../scripts/color/index.mjs";

/**
 * Pins for the colour maths behind scripts/audit-theme-contrast.mjs.
 * APCA values are the reference pairs published with apca-w3 0.1.9
 * (README "Testing" table); OKLCH values are the ones the CSS Color 4
 * specification and Ottosson's post give for the sRGB primaries.
 */
describe("APCA-W3 0.1.9", () => {
  const pairs: [string, string, number][] = [
    ["#888", "#fff", 63.056469930209424],
    ["#fff", "#888", -68.54146436644962],
    ["#000", "#aaa", 58.146262578561334],
    ["#aaa", "#000", -56.24113336839742],
    ["#123", "#def", 91.66830811481631],
    ["#def", "#123", -93.06770049484275],
    ["#123", "#444", 8.32326136957393],
    ["#444", "#123", -7.526878460278154],
  ];
  for (const [text, bg, lc] of pairs) {
    it(`${text} on ${bg} = Lc ${lc.toFixed(2)}`, () => {
      expect(apcaContrast(text, bg)).toBeCloseTo(lc, 6);
    });
  }

  it("returns 0 for identical colours", () => {
    expect(apcaContrast("#777", "#777")).toBe(0);
  });
});

describe("OKLCH", () => {
  it("white is L=1 with no chroma", () => {
    const { L, C } = srgbToOklch("#ffffff");
    expect(L).toBeCloseTo(1, 4);
    expect(C).toBeCloseTo(0, 4);
  });

  it("sRGB red is oklch(62.8% 0.258 29.2)", () => {
    const { L, C, h } = srgbToOklch("#ff0000");
    expect(L).toBeCloseTo(0.628, 3);
    expect(C).toBeCloseTo(0.2577, 3);
    expect(h).toBeCloseTo(29.23, 1);
  });

  it("round-trips through hex", () => {
    for (const hex of ["#0f172a", "#dedede", "#1d2125", "#6b7280", "#aaaa33"]) {
      expect(oklchToHex(srgbToOklch(hex))).toBe(hex);
    }
  });

  it("formats for reports", () => {
    expect(formatOklch(srgbToOklch("#ff0000"))).toBe("oklch(62.8% 0.258 29.2)");
  });
});

describe("compositing and parsing", () => {
  it("composites source-over in gamma sRGB", () => {
    expect(toHex(composite("rgba(0, 0, 0, 0.5)", "#ffffff"))).toBe("#808080");
    expect(toHex(composite("#dedede7f", "#ffffff"))).toBe("#efefef");
  });

  it("parses modern and legacy rgb syntax", () => {
    expect(parseColorAlpha("rgb(107 114 128 / 0.1)")).toEqual([107, 114, 128, 0.1]);
    expect(parseColorAlpha("rgba(107, 114, 128, 0.1)")).toEqual([107, 114, 128, 0.1]);
    expect(parseColorAlpha("#abc")).toEqual([170, 187, 204, 1]);
  });
});

describe("colour-vision-deficiency simulation (Machado 2009)", () => {
  it("leaves greys alone", () => {
    expect(simulateCvd("#808080", "deuteranopia")).toBe("#808080");
    expect(simulateCvd("#808080", "protanopia")).toBe("#808080");
  });

  it("pulls pure red and green towards each other", () => {
    const red = srgbToOklch(simulateCvd("#ff0000", "deuteranopia"));
    const green = srgbToOklch(simulateCvd("#00ff00", "deuteranopia"));
    // Both land near the same hue band; only lightness still separates them.
    expect(Math.abs(red.h - green.h)).toBeLessThan(20);
    expect(green.L).toBeGreaterThan(red.L);
  });
});

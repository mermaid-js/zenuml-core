import { brightnessIgnoreAlpha, participantTextColor } from "../utils/Color";
describe("Color", () => {
  it.each([
    ["rgb(255, 255, 255)", 255],
    ["rgb(255, 255, 0)", 225.93],
    ["rgb(255, 0, 0)", 76.245],
  ])(
    "should get the brightnessIgnoreAlpha for rgba values",
    (color, brightnessValue) => {
      expect(brightnessIgnoreAlpha(color)).toEqual(brightnessValue);
    },
  );
});

describe("participantTextColor", () => {
  const light = ["#fda4af", "#fcd34d", "#6ee7b7", "#93c5fd", "#c4b5fd"];
  const dark = ["#be123c", "#92400e", "#047857", "#1d4ed8", "#6d28d9"];

  it.each(light)("gives black text on light colour %s", (hex) => {
    expect(participantTextColor(hex)).toBe("#000");
  });

  it.each(dark)("gives white text on dark colour %s", (hex) => {
    expect(participantTextColor(hex)).toBe("#fff");
  });

  it("accepts rgb() strings", () => {
    expect(participantTextColor("rgb(255, 255, 255)")).toBe("#000");
    expect(participantTextColor("rgb(29, 78, 216)")).toBe("#fff");
  });

  it("ignores the alpha channel of 8-digit hex", () => {
    expect(participantTextColor("#fda4af00")).toBe("#000");
    expect(participantTextColor("#1d4ed8ff")).toBe("#fff");
  });

  it("gives white when brightness is exactly 128", () => {
    expect(brightnessIgnoreAlpha("rgb(128, 128, 128)")).toBe(128);
    expect(participantTextColor("rgb(128, 128, 128)")).toBe("#fff");
  });
});

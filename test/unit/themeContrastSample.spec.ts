import { expect, test } from "bun:test";
import { PNG } from "pngjs";
import { Screenshot, measure } from "../../scripts/theme-contrast/sample.mjs";

function frameBorder(
  border: [number, number, number],
  inside: [number, number, number] = [31, 31, 31],
  outside: [number, number, number] = [255, 255, 255],
) {
  const png = new PNG({ width: 30, height: 30 });
  for (let y = 0; y < 30; y++) {
    for (let x = 0; x < 30; x++) {
      const rgb = x === 5 && y >= 5 && y < 25
        ? border
        : x > 5 && x < 25 && y >= 5 && y < 25
          ? inside
          : outside;
      const i = (y * 30 + x) * 4;
      png.data.set([...rgb, 255], i);
    }
  }
  return measure(
    new Screenshot(png, 1),
    {
      kind: "line", role: "frame-border", edge: "left", strokeWidth: 1,
      rect: { x: 5, y: 5, w: 20, h: 20 },
      color: `rgb(${border.join(", ")})`, opacity: 1,
    },
    { frame: `rgb(${inside.join(", ")})` },
  );
}

test("frame border contrast is measured against its painted frame side", () => {
  const visible = frameBorder([225, 225, 225]);
  expect(visible.bg).toBe("#1f1f1f");
  expect(visible.absLc).toBeGreaterThan(45);

  const invisible = frameBorder([32, 32, 32]);
  expect(invisible.bg).toBe("#1f1f1f");
  expect(invisible.absLc).toBeLessThan(45);

  // A dark host outside cannot rescue a light border on a light frame.
  const lightPaper = frameBorder([225, 225, 225], [230, 230, 230], [31, 31, 31]);
  expect(lightPaper.bg).toBe("#e6e6e6");
  expect(lightPaper.absLc).toBeLessThan(45);
});

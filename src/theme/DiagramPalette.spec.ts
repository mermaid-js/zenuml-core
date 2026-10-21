import { describe, expect, it } from "vitest";
import {
  mapDiagramPalette,
  opaqueCanvasColor,
  paintSvgCanvas,
} from "./DiagramPalette";

const softDark = {
  canvas: "#303944",
  content: "#343F4B",
  pocket: "#424F5E",
  border: "#516071",
  text: "#EEF2F6",
  secondaryText: "#B8C3CF",
};

describe("mapDiagramPalette", () => {
  it("maps one palette to matching DOM and SVG slots", () => {
    const { cssVariables, svgColors } = mapDiagramPalette(softDark);
    expect(cssVariables["--color-bg-canvas"]).toBe(softDark.canvas);
    expect(cssVariables["--color-bg-frame"]).toBe(softDark.content);
    expect(cssVariables["--color-bg-participant"]).toBe(softDark.content);
    expect(cssVariables["--color-bg-occurrence"]).toBe(softDark.pocket);
    expect(cssVariables["--color-border-frame"]).toBe(softDark.border);
    expect(cssVariables["--color-text-number"]).toBe(softDark.secondaryText);
    expect(svgColors.frameBg).toBe(cssVariables["--color-bg-frame"]);
    expect(svgColors.messageArrow).toBe(cssVariables["--color-message-arrow"]);
    expect(svgColors.commentText).toBe(cssVariables["--color-text-comment"]);
    expect(svgColors.fragmentHeaderOpacity).toBe("1");
    expect(svgColors.commentOpacity).toBe("1");
    expect(svgColors.guardOpacity).toBe("1");
  });

  it("requires opaque hex and composites CSS alpha over white", () => {
    expect(() =>
      mapDiagramPalette({ ...softDark, text: "rgba(0,0,0,.5)" }),
    ).toThrow(/DiagramPalette.text/);
    expect(opaqueCanvasColor("rgba(0, 0, 0, 0.5)")).toBe("rgb(128, 128, 128)");
    expect(opaqueCanvasColor("rgba(0, 0, 0, 0)")).toBe("white");
  });

  it("paints the exported SVG viewport before the foreign object", () => {
    const prefix = "data:image/svg+xml;charset=utf-8,";
    const input = `${prefix}${encodeURIComponent('<svg width="20" height="10"><foreignObject/></svg>')}`;
    const output = decodeURIComponent(
      paintSvgCanvas(input, { backgroundColor: "rgb(128, 128, 128)" }).slice(
        prefix.length,
      ),
    );
    expect(output).toContain(
      '<svg width="20" height="10"><rect width="100%" height="100%" fill="rgb(128, 128, 128)"/><foreignObject/>',
    );
  });
});

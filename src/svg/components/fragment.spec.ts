import { describe, expect, it } from "bun:test";
import { renderFragment } from "./fragment";
import type { FragmentGeometry } from "../geometry";
import { renderToSvg } from "../renderToSvg";

const fragment: FragmentGeometry = {
  kind: "loop",
  label: "check",
  x: 100,
  y: 20,
  headerY: 21,
  width: 200,
  height: 100,
  number: "2.1.3",
  depth: 0,
  sections: [],
};

const parse = (geometry: FragmentGeometry) => {
  const container = document.createElement("div");
  container.innerHTML = `<svg>${renderFragment(geometry)}</svg>`;
  return container;
};

describe("SVG fragment header numbering", () => {
  it("preserves the square opt header while rounding other fragment headers", () => {
    expect(
      parse({ ...fragment, kind: "opt", number: undefined })
        .querySelector(".fragment-header")
        ?.getAttribute("style"),
    ).toBeNull();
    expect(
      parse({ ...fragment, kind: "alt", number: undefined })
        .querySelector(".fragment-header")
        ?.getAttribute("style"),
    ).toContain("4px 4px 0 0");
  });
  it("keeps the number inside the header, before the icon and type", () => {
    const view = parse(fragment);
    const number = view.querySelector(".seq-number")!;
    const numberBackground = view.querySelector(".fragment-number-bg")!;
    const label = view.querySelector(".fragment-label")!;
    const numberX = Number(number.getAttribute("x"));
    const backgroundX = Number(numberBackground.getAttribute("x"));
    expect(numberX).toBeGreaterThan(fragment.x);
    expect(number.getAttribute("text-anchor")).not.toBe("end");
    expect(backgroundX).toBeLessThan(numberX);
    expect(Number(numberBackground.getAttribute("width"))).toBeGreaterThan(0);
    expect(numberBackground.getAttribute("height")).toBe("16");
    expect(numberBackground.getAttribute("rx")).toBe("2");
    expect(view.querySelector(".fragment-number-divider")).toBeNull();
    expect(Number(label.getAttribute("x"))).toBeGreaterThan(numberX);
    expect(number.getAttribute("y")).toBe(label.getAttribute("y"));
  });

  it("does not reserve a divider or number gap when the number is absent", () => {
    const view = parse({ ...fragment, number: undefined });
    expect(view.querySelector(".seq-number")).toBeNull();
    expect(view.querySelector(".fragment-number-bg")).toBeNull();
    expect(view.querySelector(".fragment-number-divider")).toBeNull();
    expect(view.querySelector(".fragment-label")?.getAttribute("x")).toBe(
      "127",
    );
  });

  it("widens a narrow header to keep a long number and type inside its border", () => {
    const view = parse({
      ...fragment,
      width: 100,
      number: "12.12.12.12.12.12.12.12",
    });
    const header = view.querySelector(".fragment-header")!;
    const label = view.querySelector(".fragment-label")!;
    const headerRight =
      Number(header.getAttribute("x")) + Number(header.getAttribute("width"));
    expect(headerRight).toBeGreaterThan(Number(label.getAttribute("x")) + 28);
  });

  it("allocates long nested titles in the diagram geometry and enclosing frames", () => {
    const code = "loop(check) {\n".repeat(14) + "A->A:m\n" + "}\n".repeat(14);
    const result = renderToSvg(code);
    const fragments = result.geometry!.fragments;
    expect(fragments).toHaveLength(14);
    expect(fragments[13].width).toBeGreaterThan(160);
    for (let i = 1; i < fragments.length; i++) {
      const outer = fragments[i - 1];
      const inner = fragments[i];
      expect(outer.x + outer.width).toBeGreaterThanOrEqual(
        inner.x + inner.width + 10,
      );
    }
    expect(
      result.geometry!.width + result.geometry!.frameBorderRight,
    ).toBeGreaterThanOrEqual(Math.max(...fragments.map((f) => f.x + f.width)));
  });
});

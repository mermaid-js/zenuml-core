import { describe, expect, it } from "vitest";
import { clientToLocal, elementScale, rectToLocal } from "./diagramCoords";

function fakeElement(
  rect: { left: number; top: number; width: number; height: number },
  offsetWidth: number,
): HTMLElement {
  return {
    offsetWidth,
    getBoundingClientRect: () => ({
      ...rect,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
    }),
  } as unknown as HTMLElement;
}

const box = { left: 100, top: 50, width: 400, height: 200 };

describe("elementScale", () => {
  it("is 1 when the element is not scaled", () => {
    expect(elementScale(fakeElement(box, 400))).toBe(1);
  });
  it("is 0.5 when the element is drawn at half size", () => {
    expect(elementScale(fakeElement(box, 800))).toBe(0.5);
  });
  it("is 2 when the element is drawn at double size", () => {
    expect(elementScale(fakeElement(box, 200))).toBe(2);
  });
  it("is 1 before layout, when offsetWidth is 0", () => {
    expect(elementScale(fakeElement(box, 0))).toBe(1);
  });
  it("is 1 for a zero-size rect", () => {
    expect(elementScale(fakeElement({ ...box, width: 0 }, 0))).toBe(1);
  });
  it("uses a rect passed by the caller", () => {
    expect(
      elementScale(fakeElement(box, 800), { ...box, width: 200 } as DOMRect),
    ).toBe(0.25);
  });
});

describe("clientToLocal", () => {
  it("subtracts the origin at scale 1", () => {
    expect(clientToLocal(fakeElement(box, 400), 150, 80)).toEqual({
      x: 50,
      y: 30,
    });
  });
  it("divides by a 0.5 scale", () => {
    expect(clientToLocal(fakeElement(box, 800), 150, 80)).toEqual({
      x: 100,
      y: 60,
    });
  });
  it("divides by a 2 scale", () => {
    expect(clientToLocal(fakeElement(box, 200), 150, 80)).toEqual({
      x: 25,
      y: 15,
    });
  });
  it("falls back to scale 1 when offsetWidth is 0", () => {
    expect(clientToLocal(fakeElement(box, 0), 150, 80)).toEqual({
      x: 50,
      y: 30,
    });
  });
});

describe("rectToLocal", () => {
  const target = { left: 200, top: 90, width: 40, height: 20 } as DOMRect;
  it("maps a rect and its centre at scale 1", () => {
    expect(rectToLocal(fakeElement(box, 400), target)).toEqual({
      x: 100,
      y: 40,
      width: 40,
      height: 20,
      centerX: 120,
      centerY: 50,
    });
  });
  it("maps a rect and its centre at scale 0.5", () => {
    expect(rectToLocal(fakeElement(box, 800), target)).toEqual({
      x: 200,
      y: 80,
      width: 80,
      height: 40,
      centerX: 240,
      centerY: 100,
    });
  });
  it("falls back to scale 1 when offsetWidth is 0", () => {
    expect(rectToLocal(fakeElement(box, 0), target).centerX).toBe(120);
  });
});

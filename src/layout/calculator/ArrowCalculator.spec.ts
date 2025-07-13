import { describe, it, expect } from "vitest";
import { ArrowCalculator } from "./ArrowCalculator";
import { ArrowGeometry } from "../geometry/ArrowGeometry";

describe("ArrowCalculator", () => {
  const calculator = new ArrowCalculator();

  it("should calculate arrow layout for horizontal arrow", () => {
    const geometry: ArrowGeometry = {
      origin: { name: "A", centerPosition: 100, activationLayers: 1 },
      source: { name: "A", centerPosition: 100, activationLayers: 1 },
      target: { name: "B", centerPosition: 200, activationLayers: 0 },
      isSelfCall: false,
    };

    const result = calculator.calculateArrowLayout(geometry);

    expect(result.isSelf).toBe(false);
    expect(result.rightToLeft).toBe(false);
    expect(result.originLayers).toBe(1);
    expect(result.sourceLayers).toBe(1);
    expect(result.targetLayers).toBe(0);
    expect(result.interactionWidth).toBeGreaterThan(0);
    expect(result.translateX).toBeDefined();
  });

  it("should calculate arrow layout for self call", () => {
    const geometry: ArrowGeometry = {
      origin: { name: "A", centerPosition: 100, activationLayers: 0 },
      source: { name: "A", centerPosition: 100, activationLayers: 0 },
      target: { name: "A", centerPosition: 100, activationLayers: 1 },
      isSelfCall: true,
    };

    const result = calculator.calculateArrowLayout(geometry);

    expect(result.isSelf).toBe(true);
    expect(result.originLayers).toBe(0);
    expect(result.sourceLayers).toBe(0);
    expect(result.targetLayers).toBe(1);
  });

  it("should detect right-to-left arrow direction", () => {
    const geometry: ArrowGeometry = {
      origin: { name: "B", centerPosition: 200, activationLayers: 0 },
      source: { name: "B", centerPosition: 200, activationLayers: 0 },
      target: { name: "A", centerPosition: 100, activationLayers: 0 },
      isSelfCall: false,
    };

    const result = calculator.calculateArrowLayout(geometry);

    expect(result.rightToLeft).toBe(true);
  });

  it("should calculate distance between participants", () => {
    const from = { name: "A", centerPosition: 100, activationLayers: 0 };
    const to = { name: "B", centerPosition: 200, activationLayers: 0 };

    const distance = calculator.calculateDistance(from, to);

    expect(distance).toBe(100);
  });

  it("should detect self call correctly", () => {
    expect(calculator.isSelfCall("A", "A")).toBe(true);
    expect(calculator.isSelfCall("A", "B")).toBe(false);
  });
});
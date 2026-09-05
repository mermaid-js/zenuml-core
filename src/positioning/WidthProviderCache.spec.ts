import { describe, expect, it } from "vitest";
import { createCanvas } from "@napi-rs/canvas";
import {
  WidthProviderOnCanvas,
  measureSvgFragmentLabelWidth,
  measureSvgParticipantLabelWidth,
  setCanvasContext,
} from "./WidthProviderFunc";
import { TextType } from "./Coordinate";
import { clearCache, getCache } from "@/utils/RenderingCache";

/**
 * test-setup.ts installs a @napi-rs/canvas context before any test runs, so
 * these tests restore it after every case that swaps it out.
 */
function realContext() {
  return createCanvas(1, 1).getContext(
    "2d",
  ) as unknown as CanvasRenderingContext2D;
}

describe("width-measurement caching", () => {
  it("does not persist the character-count estimate taken without a canvas", () => {
    // The CLI installs its canvas after module load (src/cli/zenuml.ts), and
    // a persisted estimate could never be corrected afterwards.
    setCanvasContext(null);
    const text = `no-canvas-${Math.floor(performance.now())}`;
    const estimate = WidthProviderOnCanvas(text, TextType.ParticipantName);
    expect(estimate).toBeGreaterThan(0);

    // Persisted values survive clearCache; this estimate must not have been,
    // so a later real measurement of the same text replaces it.
    clearCache();
    setCanvasContext(realContext());
    const measured = WidthProviderOnCanvas(text, TextType.ParticipantName);
    expect(measured).not.toBe(estimate);
  });

  it("re-measures after the canvas context is swapped in", () => {
    setCanvasContext(null);
    const text = `swap-${Math.floor(performance.now())}`;
    const estimate = WidthProviderOnCanvas(text, TextType.ParticipantName);

    setCanvasContext(realContext());
    const measured = WidthProviderOnCanvas(text, TextType.ParticipantName);

    // Same key, different backend: the swap must invalidate the old value.
    expect(measured).not.toBe(estimate);
  });

  it("does not reuse one font size's width for another", () => {
    setCanvasContext(realContext());
    const text = "Fragment label";
    const at14 = measureSvgFragmentLabelWidth(text);
    const at16 = measureSvgParticipantLabelWidth(text);
    expect(at16).toBeGreaterThan(at14);
  });

  it("caches a canvas measurement across clearCache", () => {
    setCanvasContext(realContext());
    const text = `persist-${Math.floor(performance.now())}`;
    const first = WidthProviderOnCanvas(text, TextType.ParticipantName);
    clearCache();
    const second = WidthProviderOnCanvas(text, TextType.ParticipantName);
    expect(second).toBe(first);
    expect(getCache(undefined)).toBeNull();
  });
});

/**
 * Shared test-environment setup: the single source of truth for both runners.
 *
 * - `bun test` loads it through the root `test-setup.ts` preload (bunfig.toml),
 *   which first registers happy-dom and the Bun globals.
 * - Vitest (IDE runs) loads it directly via `test.setupFiles` in vite.config.ts.
 *
 * Keep this file runner-neutral: no `bun:test` or `vitest` imports.
 */

// Set up global test utilities
import "@testing-library/jest-dom";

// Configure Testing Library
import { configure } from "@testing-library/react";

configure({
  // Reduce timeout for faster test failures
  asyncUtilTimeout: 2000,
  // Show better error messages
  getElementError: (message) => {
    const error = new Error(message || "");
    error.name = "TestingLibraryElementError";
    return error;
  },
});

// Mock IntersectionObserver (not available in happy-dom/jsdom by default)
class IntersectionObserverMock {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

// Mock ResizeObserver
class ResizeObserverMock {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

for (const target of [globalThis, (globalThis as any).window].filter(Boolean)) {
  Object.defineProperty(target, "IntersectionObserver", {
    writable: true,
    configurable: true,
    value: IntersectionObserverMock,
  });
  Object.defineProperty(target, "ResizeObserver", {
    writable: true,
    configurable: true,
    value: ResizeObserverMock,
  });
}

// Inject @napi-rs/canvas for accurate text measurement in all tests.
// happy-dom's/jsdom's canvas doesn't do real text measurement, which causes
// WidthProviderOnCanvas to return inaccurate widths.
import { createCanvas } from "@napi-rs/canvas";
import { setCanvasContext } from "../src/positioning/WidthProviderFunc";
const _napiCanvas = createCanvas(1, 1);
setCanvasContext(_napiCanvas.getContext("2d") as unknown as CanvasRenderingContext2D);

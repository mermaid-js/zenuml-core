/**
 * Bun-specific test preload (see bunfig.toml): happy-dom + Bun globals + `vi` shim.
 * Shared setup lives in test/setup.ts, which Vitest also uses.
 */

// Set up DOM environment using happy-dom (faster than jsdom)
import { GlobalRegistrator } from "@happy-dom/global-registrator";

// Register happy-dom globals (document, window, navigator, etc.)
GlobalRegistrator.register();

// Add missing globals that happy-dom doesn't provide but tests expect
if (!global.origin) {
  global.origin = "http://localhost";
}

// Import Bun's test globals to make them available everywhere
import { describe, test, it, expect, beforeEach, afterEach, beforeAll, afterAll, jest, mock } from "bun:test";

// Make test globals available
global.describe = describe;
global.test = test;
global.it = it;
global.expect = expect;
global.beforeEach = beforeEach;
global.afterEach = afterEach;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.jest = jest;

// Add Vitest-compatible mocking utilities for Bun
// Map 'vi' to Bun's jest-compatible APIs
const stubbedGlobals = new Map();

global.vi = {
  fn: (impl?: any) => jest.fn(impl),
  spyOn: jest.spyOn,
  clearAllMocks: jest.clearAllMocks,
  resetAllMocks: jest.resetAllMocks,
  restoreAllMocks: jest.restoreAllMocks,
  stubGlobal: (name: string, value: any) => {
    // Store original value if not already stored
    if (!stubbedGlobals.has(name)) {
      stubbedGlobals.set(name, (global as any)[name]);
    }
    (global as any)[name] = value;
    return vi;
  },
  unstubAllGlobals: () => {
    // Restore all stubbed globals
    stubbedGlobals.forEach((originalValue, name) => {
      if (originalValue === undefined) {
        delete (global as any)[name];
      } else {
        (global as any)[name] = originalValue;
      }
    });
    stubbedGlobals.clear();
    return vi;
  },
  mocked: (fn: any) => fn as jest.Mock,
};

// Runner-neutral setup shared with Vitest (Testing Library, observers, canvas).
// Dynamic import so it runs after happy-dom is registered (static imports hoist).
await import("./test/setup");

// Add custom matchers or global test utilities here
// For example:
// expect.extend({
//   toBeWithinRange(received, floor, ceiling) {
//     const pass = received >= floor && received <= ceiling;
//     return { pass };
//   },
// });

// Clean up after all tests
if (typeof afterAll !== "undefined") {
  afterAll(() => {
    if (GlobalRegistrator.isRegistered) {
      GlobalRegistrator.unregister();
    }
  });
}
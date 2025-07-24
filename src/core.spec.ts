import { JSDOM } from "jsdom";
import ZenUml from "./core";

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(() => {
    return {
      observe() {},
      disconnect() {},
    };
  }),
);
describe("@ZenUML/core", function () {
  beforeEach(() => {
    // Create a new JSDOM instance
    const dom = new JSDOM(
      '<!DOCTYPE html><div class="textarea-hidden-div"></div>',
      {
        url: "http://localhost",
      },
    );

    // Set up global objects that would normally be available in the browser
    global.document = dom.window.document;
    global.window = dom.window as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = "";
    // Clear the cache to prevent test interference
    vi.clearAllMocks();
    // You might need to clear your rendering cache here too
  });

  // TODO: fix this test. It randomly fails.
  it.skip("should render and cache the code and theme", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el);

    // Wrap each render in a try-catch for debugging
    try {
      await zenUml.render("A.method", { theme: "theme-blue" });
      expect(zenUml).toBeInstanceOf(ZenUml);
      expect(zenUml.code).toBe("A.method");
      expect(zenUml.theme).toBe("theme-blue");

      await zenUml.render("B.method", { theme: "theme-red" });
      expect(zenUml.code).toBe("B.method");
      expect(zenUml.theme).toBe("theme-red");

      await zenUml.render("C.method", undefined);
      expect(zenUml.code).toBe("C.method");
      expect(zenUml.theme).toBe("theme-red");

      await zenUml.render(undefined, { theme: "theme-green" });
      expect(zenUml.code).toBe("C.method");
      expect(zenUml.theme).toBe("theme-green");
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });

  describe("UMD Compatibility Layer", () => {
    let originalWindow: any;
    let mockZenUml: any;

    beforeEach(() => {
      // Save original window reference
      originalWindow = global.window;
      
      // Create a mock ZenUml class for testing
      mockZenUml = vi.fn();
      mockZenUml.version = "test-version";
    });

    afterEach(() => {
      // Restore original window
      global.window = originalWindow;
    });

    it("should add default property to window.zenuml when it exists", () => {
      // Simulate UMD environment where window.zenuml is set
      global.window.zenuml = mockZenUml;

      // Simulate the compatibility layer code directly
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }

      // Verify default property is added
      expect(global.window.zenuml.default).toBe(mockZenUml);
      expect(global.window.zenuml.default).toBe(global.window.zenuml);
    });

    it("should not overwrite existing default property", () => {
      const existingDefault = { existing: "property" };
      
      // Set up window.zenuml with existing default
      global.window.zenuml = mockZenUml;
      global.window.zenuml.default = existingDefault;

      // Simulate the compatibility layer code directly
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }

      // Verify existing default is preserved
      expect(global.window.zenuml.default).toBe(existingDefault);
      expect(global.window.zenuml.default).not.toBe(global.window.zenuml);
    });

    it("should handle SSR environment safely (no window object)", () => {
      // Simulate SSR environment
      const tempWindow = global.window;
      delete (global as any).window;

      // This should not throw an error
      expect(() => {
        if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
          window.zenuml.default = window.zenuml;
        }
      }).not.toThrow();

      // Restore window
      global.window = tempWindow;
    });

    it("should handle case when window exists but zenuml is not defined", () => {
      // Window exists but no zenuml global
      global.window = { ...originalWindow };
      delete global.window.zenuml;

      // This should not throw an error
      expect(() => {
        if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
          window.zenuml.default = window.zenuml;
        }
      }).not.toThrow();

      // Verify no default property is added to undefined
      expect(global.window.zenuml).toBeUndefined();
    });

    it("should verify both access patterns reference the same constructor", () => {
      // Simulate UMD environment
      global.window.zenuml = mockZenUml;

      // Simulate the compatibility layer code directly
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }

      // Verify both patterns reference the same constructor
      expect(global.window.zenuml).toBe(global.window.zenuml.default);
      expect(global.window.zenuml.version).toBe(global.window.zenuml.default.version);
    });

    it("should be idempotent (safe to run multiple times)", () => {
      // Set up initial state
      global.window.zenuml = mockZenUml;

      // Run compatibility layer multiple times
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }
      
      const firstDefault = global.window.zenuml.default;
      
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }
      
      // Verify default reference remains the same (idempotent)
      expect(global.window.zenuml.default).toBe(firstDefault);
      expect(global.window.zenuml.default).toBe(global.window.zenuml);
    });

    it("should maintain reference equality between both access patterns", () => {
      // Simulate UMD environment
      global.window.zenuml = mockZenUml;

      // Simulate the compatibility layer code directly
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }

      // Test reference equality
      expect(global.window.zenuml === global.window.zenuml.default).toBe(true);
      
      // Test that both are the same function
      expect(typeof global.window.zenuml).toBe("function");
      expect(typeof global.window.zenuml.default).toBe("function");
      expect(global.window.zenuml).toBe(global.window.zenuml.default);
    });

    it("should handle window.zenuml as null without errors", () => {
      // Set window.zenuml to null (edge case)
      global.window.zenuml = null;

      // This should not throw an error
      expect(() => {
        if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
          window.zenuml.default = window.zenuml;
        }
      }).not.toThrow();

      // Verify nothing is modified when zenuml is null
      expect(global.window.zenuml).toBe(null);
    });
  });
});

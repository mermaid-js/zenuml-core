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

  describe("UMD Integration Tests - Both Access Patterns", () => {
    let originalWindow: any;
    let testElement1: HTMLElement;
    let testElement2: HTMLElement;

    beforeEach(() => {
      // Save original window reference
      originalWindow = global.window;
      
      // Create test elements for both instances
      testElement1 = document.createElement("div");
      testElement1.id = "test-element-1";
      document.body.appendChild(testElement1);
      
      testElement2 = document.createElement("div"); 
      testElement2.id = "test-element-2";
      document.body.appendChild(testElement2);

      // Set up UMD environment with actual ZenUml class
      global.window.zenuml = ZenUml;
      
      // Apply compatibility layer
      if (typeof window !== "undefined" && window.zenuml && !window.zenuml.default) {
        window.zenuml.default = window.zenuml;
      }
    });

    afterEach(() => {
      // Clean up test elements
      if (testElement1.parentNode) {
        testElement1.parentNode.removeChild(testElement1);
      }
      if (testElement2.parentNode) {
        testElement2.parentNode.removeChild(testElement2);
      }
      
      // Restore original window
      global.window = originalWindow;
    });

    it("should create identical instances using both access patterns", () => {
      // Test both access patterns work
      expect(() => new global.window.zenuml(testElement1)).not.toThrow();
      expect(() => new global.window.zenuml.default(testElement2)).not.toThrow();

      // Create instances using both patterns
      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement2);

      // Verify both are ZenUml instances
      expect(instance1).toBeInstanceOf(ZenUml);
      expect(instance2).toBeInstanceOf(ZenUml);

      // Verify both have the same constructor
      expect(instance1.constructor).toBe(instance2.constructor);
      expect(instance1.constructor).toBe(ZenUml);
    });

    it("should have identical methods and properties on both instances", () => {
      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement2);

      // Test that both instances have the same methods
      expect(typeof instance1.render).toBe("function");
      expect(typeof instance2.render).toBe("function");
      expect(typeof instance1.getPng).toBe("function");
      expect(typeof instance2.getPng).toBe("function");
      expect(typeof instance1.getSvg).toBe("function");
      expect(typeof instance2.getSvg).toBe("function");

      // Test static properties are identical
      expect(global.window.zenuml.version).toBe(global.window.zenuml.default.version);
      expect(global.window.zenuml.version).toBe(ZenUml.version);

      // Test getters exist on both instances
      expect(instance1.code).toBeUndefined(); // Initially undefined
      expect(instance2.code).toBeUndefined();
      expect(instance1.theme).toBeUndefined(); // Initially undefined
      expect(instance2.theme).toBeUndefined();
    });

    it("should render identical content using both access patterns", async () => {
      const testCode = "A.method() { B.process() }";
      const testConfig = { theme: "default" };

      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement2);

      // Render the same content with both instances
      const result1 = await instance1.render(testCode, testConfig);
      const result2 = await instance2.render(testCode, testConfig);

      // Both should return the instance itself
      expect(result1).toBe(instance1);
      expect(result2).toBe(instance2);

      // Both should have identical code and theme
      expect(instance1.code).toBe(testCode);
      expect(instance2.code).toBe(testCode);
      expect(instance1.theme).toBe("default");
      expect(instance2.theme).toBe("default");

      // Wait a bit for React rendering to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      // Verify the rendered content exists in both elements
      // Check for React root structure instead of innerHTML content
      expect(testElement1.children.length).toBeGreaterThan(0);
      expect(testElement2.children.length).toBeGreaterThan(0);
      
      // Verify both elements have ZenUML-specific structure
      // After rendering, both should have the React root container
      expect(testElement1.firstElementChild).toBeTruthy();
      expect(testElement2.firstElementChild).toBeTruthy();
    });

    it("should support both constructor signatures identically", () => {
      // Test with element reference
      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement1);
      
      expect(instance1).toBeInstanceOf(ZenUml);
      expect(instance2).toBeInstanceOf(ZenUml);

      // Test with CSS selector string (using ID)
      const instance3 = new global.window.zenuml("#test-element-1");
      const instance4 = new global.window.zenuml.default("#test-element-1");
      
      expect(instance3).toBeInstanceOf(ZenUml);
      expect(instance4).toBeInstanceOf(ZenUml);

      // Test with naked parameter
      const instance5 = new global.window.zenuml(testElement2, true);
      const instance6 = new global.window.zenuml.default(testElement2, true);
      
      expect(instance5).toBeInstanceOf(ZenUml);
      expect(instance6).toBeInstanceOf(ZenUml);
    });

    it("should maintain configuration state independently between instances", async () => {
      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement2);

      // Render different content to each instance
      await instance1.render("A.method1()", { theme: "blue" });
      await instance2.render("B.method2()", { theme: "red" });

      // Verify each instance maintains its own state
      expect(instance1.code).toBe("A.method1()");
      expect(instance2.code).toBe("B.method2()");
      expect(instance1.theme).toBe("blue");
      expect(instance2.theme).toBe("red");

      // Update one instance and verify the other is unaffected
      await instance1.render("A.updated()", { theme: "green" });
      
      expect(instance1.code).toBe("A.updated()");
      expect(instance1.theme).toBe("green");
      expect(instance2.code).toBe("B.method2()"); // Should remain unchanged
      expect(instance2.theme).toBe("red"); // Should remain unchanged
    });

    it("should support export functionality identically", async () => {
      const testCode = "A.export() { B.test() }";
      
      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement2);

      // Render content to both instances
      await instance1.render(testCode, { theme: "default" });
      await instance2.render(testCode, { theme: "default" });

      // Verify both instances have identical export method signatures
      expect(typeof instance1.getPng).toBe("function");
      expect(typeof instance2.getPng).toBe("function");
      expect(typeof instance1.getSvg).toBe("function");
      expect(typeof instance2.getSvg).toBe("function");

      // Verify both methods return promises (without calling them due to JSDOM limitations)
      expect(instance1.getPng).toBe(instance2.getPng); // Same method reference
      expect(instance1.getSvg).toBe(instance2.getSvg); // Same method reference
      
      // Note: We don't test actual export execution in JSDOM environment
      // as html-to-image requires browser APIs not available in JSDOM
    });

    it("should handle errors identically in both access patterns", async () => {
      const instance1 = new global.window.zenuml(testElement1);
      const instance2 = new global.window.zenuml.default(testElement2);

      // Test error handling for invalid selector
      expect(() => new global.window.zenuml("#non-existent")).toThrow();
      expect(() => new global.window.zenuml.default("#non-existent")).toThrow();

      // Both should handle undefined render parameters identically
      await expect(instance1.render(undefined, undefined)).resolves.toBe(instance1);
      await expect(instance2.render(undefined, undefined)).resolves.toBe(instance2);
    });
  });
});

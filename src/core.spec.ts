import { JSDOM } from "jsdom";
import ZenUml from "./core";

// IntersectionObserver is already mocked globally by the test setup files
// (test-setup.ts for `bun test`, test/setup.ts for vitest). Do NOT re-stub it
// here with vi.stubGlobal: Bun >=1.3 injects a native `vi` that shadows the
// preload shim and does not implement stubGlobal, which throws at import time
// and breaks `bun run test` on newer Bun (see issue #395).
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
});

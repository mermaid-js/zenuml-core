import { waitFor } from "@testing-library/react";
import ZenUml from "./core";
import { createStore } from "jotai";
import { enableNumberingAtom } from "./store/Store";

// IntersectionObserver is already mocked globally by the test setup files
// (test-setup.ts for `bun test`, test/setup.ts for vitest). Do NOT re-stub it
// here with vi.stubGlobal: Bun >=1.3 injects a native `vi` that shadows the
// preload shim and does not implement stubGlobal, which throws at import time
// and breaks `bun run test` on newer Bun (see issue #395).
describe("@ZenUML/core", function () {
  beforeEach(() => {
    createStore().set(enableNumberingAtom, true);
    document.body.innerHTML = '<div class="textarea-hidden-div"></div>';
  });

  afterEach(() => {
    createStore().set(enableNumberingAtom, true);
    // Clean up after each test
    document.body.innerHTML = "";
    // Clear the cache to prevent test interference
    vi.clearAllMocks();
    // You might need to clear your rendering cache here too
  });

  const renderDiagram = async (config: Record<string, unknown> = {}) => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el, true);

    await zenUml.render("Alice->Bob: Hello", config);
    await waitFor(() => {
      expect(el.textContent).toContain("Hello");
    });

    return el;
  };

  it("shows message numbering by default", async () => {
    const el = await renderDiagram();

    expect(el.querySelector(".message-layer")?.textContent).toContain("1");
  });

  it("lets the host hide message numbering", async () => {
    const el = await renderDiagram({ enableNumbering: false });

    expect(el.querySelector(".message-layer")?.textContent).not.toContain("1");
  });

  it("preserves stored numbering when the option is omitted", async () => {
    createStore().set(enableNumberingAtom, false);
    const el = await renderDiagram();

    expect(el.querySelector(".message-layer")?.textContent).not.toContain("1");
  });

  it("lets an explicit true override stored numbering", async () => {
    createStore().set(enableNumberingAtom, false);
    const el = await renderDiagram({ enableNumbering: true });

    expect(el.querySelector(".message-layer")?.textContent).toContain("1");
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

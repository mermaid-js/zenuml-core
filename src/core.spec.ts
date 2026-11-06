import { waitFor } from "@testing-library/react";
import ZenUml from "./core";
import { createStore } from "jotai";
import { enableNumberingAtom } from "./store/Store";

// IntersectionObserver is already mocked globally by the test setup files
// (test/setup.ts, loaded by both `bun test` and vitest). Do NOT re-stub it
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

  it("renders when the page blocks the embedded font", async () => {
    // A Content-Security-Policy without data: in font-src makes FontFace.load()
    // reject. The diagram must still render, with the fallback fonts.
    const g = globalThis as any;
    const originalFontFace = g.FontFace;
    const originalFonts = Object.getOwnPropertyDescriptor(document, "fonts");
    g.FontFace = class {
      load() {
        return Promise.reject(new Error("A network error occurred."));
      }
    };
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { add() {} },
    });
    try {
      await renderDiagram();
    } finally {
      g.FontFace = originalFontFace;
      if (originalFonts)
        Object.defineProperty(document, "fonts", originalFonts);
      else delete (document as any).fonts;
    }
  });

  it("adds no element to document.body when a ZenUml is constructed", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const bodyChildren = () => Array.from(document.body.children);
    const before = bodyChildren();

    new ZenUml(el);

    const after = bodyChildren();
    expect(after.length).toBe(before.length);
    expect(after.every((child, i) => child === before[i])).toBe(true);
  });

  it("leaves no portal root of its own in document.body after rendering", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const before = new Set(Array.from(document.body.children));

    const zenUml = new ZenUml(el);
    await zenUml.render("Alice->Bob: Hello", {});
    await waitFor(() => {
      expect(el.textContent).toContain("Hello");
    });

    // Rendering may add floating-ui portals (the popovers) and the shared
    // intersection detector. Nothing else, and in particular no empty
    // headlessui portal root.
    const added = Array.from(document.body.children).filter(
      (child) => !before.has(child),
    );
    const unexpected = added.filter(
      (child) =>
        !child.hasAttribute("data-floating-ui-portal") &&
        child.id !== "zenuml-intersection-detector-container",
    );
    expect(unexpected).toEqual([]);
    expect(document.getElementById("headlessui-portal-root")).toBeNull();
  });

  it("shows message numbering by default", async () => {
    const el = await renderDiagram();

    expect(el.querySelector(".message-layer")?.textContent).toContain("1");
  });

  it("returns the committed canvas surface and rereads author CSS", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el);
    await zenUml.render("A->B: Hello", { theme: "theme-default" });
    expect(el.querySelector(".bg-skin-canvas")).not.toBeNull();
    expect(zenUml.getSurface().backgroundColor).toBe("rgba(0, 0, 0, 0)");

    const style = document.createElement("style");
    style.textContent =
      ".zenuml .bg-skin-canvas { background-color: rgb(20, 40, 60) !important; }";
    document.head.append(style);
    try {
      expect(zenUml.getSurface().backgroundColor).toBe("rgb(20, 40, 60)");
    } finally {
      style.remove();
    }
  });

  it("resolves a debounced render after its new tree commits", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el);
    await zenUml.render("A->B: first", {});
    await zenUml.render("A->B: second", {});
    expect(el.textContent).toContain("second");
  });

  it("uses the initial theme and semantic palette on the first commit", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el, false, {
      theme: "theme-dark",
      palette: {
        canvasBg: "#343f4b",
        frameBg: "#424f5e",
        participantText: "#eef2f6",
      },
    });
    await zenUml.render("A->B: Hi", {});
    const canvas = el.querySelector<HTMLElement>(".bg-skin-canvas")!;
    expect(canvas.classList.contains("theme-dark")).toBe(true);
    expect(canvas.style.getPropertyValue("--color-bg-canvas")).toBe("#343f4b");
    expect(canvas.style.getPropertyValue("--color-bg-frame")).toBe("#424f5e");
    expect(zenUml.getSurface().backgroundColor).toBe("rgb(52, 63, 75)");
  });

  it("settles superseded renders on the latest committed tree", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el);
    await zenUml.render("A->B: first", {});
    const oldRender = zenUml.render("A->B: old", { theme: "theme-default" });
    const latestRender = zenUml.render("A->B: latest", { theme: "theme-dark" });
    await Promise.all([oldRender, latestRender]);
    expect(el.textContent).toContain("latest");
    expect(el.textContent).not.toContain("old");
    expect(zenUml.getSurface().backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("ignores stale lifeline readiness from a replaced participant set", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el);
    await zenUml.render("A->B: first", {});
    const oldRender = zenUml.render("C->D: old", {});
    const latestRender = zenUml.render("E->F: latest", {});
    await Promise.all([oldRender, latestRender]);
    expect(el.querySelector('[data-participant-id="E"]')).not.toBeNull();
    expect(el.querySelector('[data-participant-id="C"]')).toBeNull();
    expect(el.textContent).toContain("latest");
  });

  it("clears a palette when an explicit undefined accompanies a theme switch", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el, false, {
      theme: "theme-dark",
      palette: { canvasBg: "#343f4b" },
    });
    await zenUml.render("A->B: Hi", {});
    expect(zenUml.getSurface().backgroundColor).toBe("rgb(52, 63, 75)");
    await zenUml.render(undefined, {
      theme: "theme-default",
      palette: undefined,
    });
    expect(zenUml.getSurface().backgroundColor).toBe("rgba(0, 0, 0, 0)");
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

describe("font API exports", () => {
  it("exposes the font URL setter as a named export and a ZenUml static", async () => {
    const core = await import("./core");
    expect(typeof core.setDiagramFontUrl).toBe("function");
    expect(ZenUml.setDiagramFontUrl).toBe(core.setDiagramFontUrl);
  });

  it("exports getDiagramFontFaceCss and ensureDiagramFontsLoaded", async () => {
    const core = await import("./core");
    expect(await core.getDiagramFontFaceCss()).toContain(
      'font-family: "IBM Plex Sans"',
    );
    expect(typeof core.ensureDiagramFontsLoaded).toBe("function");
  });
});

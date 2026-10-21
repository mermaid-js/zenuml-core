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
  const palette = {
    canvas: "#303944",
    content: "#343F4B",
    pocket: "#424F5E",
    border: "#516071",
    text: "#EEF2F6",
    secondaryText: "#B8C3CF",
  };

  it("stages the first mount and resolves after the palette reaches both surfaces", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const diagram = new ZenUml(el);
    expect(el.querySelector(".bg-skin-canvas")).toBeNull();
    await diagram.render("A->B: hello", { palette });
    const frame = el.querySelector<HTMLElement>(".bg-skin-canvas")!;
    const sequence = el.querySelector<HTMLElement>(".sequence-diagram")!;
    expect(frame.style.getPropertyValue("--color-bg-canvas")).toBe(
      palette.canvas,
    );
    expect(sequence.style.getPropertyValue("--color-bg-canvas")).toBe(
      palette.canvas,
    );
    expect(el.textContent).toContain("hello");
    expect(Object.keys(diagram)).not.toContain("root");
  });

  it("keeps the historical implicit HTML theme while honoring an explicit named default", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const diagram = new ZenUml(el, true);
    await diagram.render("A->B: hello", undefined);
    expect(el.querySelector(".sequence-diagram")?.classList.contains("default")).toBe(true);
    await diagram.render(undefined, { theme: "theme-default" });
    expect(el.querySelector(".sequence-diagram")?.classList.contains("theme-default")).toBe(true);
  });

  it("coalesces debounced renders and settles every caller after the latest commit", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const diagram = new ZenUml(el, true);
    await diagram.render("A->B: first", undefined);
    const first = diagram.render("A->B: second", { palette });
    const second = diagram.render("A->B: final", {
      palette,
      enableNumbering: false,
    });
    await Promise.all([first, second]);
    expect(el.textContent).toContain("final");
    expect(el.textContent).not.toContain("second");
    expect(
      el
        .querySelector<HTMLElement>(".sequence-diagram")
        ?.style.getPropertyValue("--color-bg-canvas"),
    ).toBe(palette.canvas);
  });

  it("waits for a same-code palette change and an empty diagram", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const diagram = new ZenUml(el, true);
    await diagram.render("A->B: hello", undefined);
    await diagram.render(undefined, { palette });
    expect(
      el
        .querySelector<HTMLElement>(".sequence-diagram")
        ?.style.getPropertyValue("--color-bg-canvas"),
    ).toBe(palette.canvas);
    await diagram.render("", { palette });
    expect(el.textContent).not.toContain("hello");
  });

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

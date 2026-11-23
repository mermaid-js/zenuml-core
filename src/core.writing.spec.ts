import { createStore } from "jotai";
import ZenUml from "./core";
import {
  codeAtom,
  enableWritingAnimationAtom,
  modeAtom,
  renderCodeAtom,
  RenderMode,
} from "./store/Store";
import { interactionAtom } from "./store/interaction/interactionAtom";

// ADR 0009, Decisions 1, 2 and 5: the writing gate runs in render(), off by
// default. With the option off nothing about render() changes.

type Store = ReturnType<typeof createStore>;

const mount = () => {
  const el = document.createElement("div");
  document.body.appendChild(el);
  const zenUml = new ZenUml(el);
  const store = (zenUml as unknown as { store: Store }).store;
  return { el, zenUml, store };
};

/** Resolves once `check` holds, polling every few ms (no fake timers). */
const until = async (check: () => boolean, ms = 3000) => {
  const end = Date.now() + ms;
  while (!check()) {
    if (Date.now() > end) throw new Error("timed out");
    await new Promise((r) => setTimeout(r, 5));
  }
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("enableWritingAnimation", () => {
  it("is off by default and renders raw text", async () => {
    const { zenUml, store } = mount();
    await zenUml.render("A.m()", {});
    await zenUml.render("A.m()\nre", {});
    expect(store.get(enableWritingAnimationAtom)).toBe(false);
    expect(store.get(codeAtom)).toBe("A.m()\nre");
    expect(store.get(renderCodeAtom)).toBeNull();
  });

  it("is written in render() itself and keeps its value when omitted", () => {
    const { zenUml, store } = mount();
    void zenUml.render("A.m()", { enableWritingAnimation: true });
    expect(store.get(enableWritingAnimationAtom)).toBe(true);
    void zenUml.render("A.m()", {});
    expect(store.get(enableWritingAnimationAtom)).toBe(true);
    void zenUml.render("A.m()", { enableWritingAnimation: false });
    expect(store.get(enableWritingAnimationAtom)).toBe(false);
  });

  it("holds an incomplete line, keeps editing off, and resolves on the raw frame", async () => {
    const { zenUml, store } = mount();
    await zenUml.render("A.m()", { enableWritingAnimation: true });
    const start = Date.now();
    let resolved = false;
    const done = zenUml.render("A.m()\nre", {}).then(() => {
      resolved = true;
    });

    await until(() => store.get(renderCodeAtom) === "A.m()\n");
    expect(store.get(codeAtom)).toBe("A.m()\nre");
    expect(store.get(interactionAtom).kind).toBe("writingHeld");
    expect(resolved).toBe(false);

    await done;
    // The idle flush renders the raw text after 1,200 ms without input.
    expect(Date.now() - start).toBeGreaterThanOrEqual(1100);
    expect(store.get(renderCodeAtom)).toBeNull();
    expect(store.get(codeAtom)).toBe("A.m()\nre");
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("closes an open call and resolves once the raw text is complete", async () => {
    const { el, zenUml, store } = mount();
    await zenUml.render("A.m()", { enableWritingAnimation: true });
    void zenUml.render("A.m()\nA.n(", {});
    await until(() => store.get(renderCodeAtom) === "A.m()\nA.n()");
    await zenUml.render("A.m()\nA.n()", {});
    expect(store.get(renderCodeAtom)).toBeNull();
    expect(el.textContent).toContain("n()");
  });

  it("skips the gate for the first render", async () => {
    const { zenUml, store } = mount();
    await zenUml.render("A.m()\nre", { enableWritingAnimation: true });
    expect(store.get(renderCodeAtom)).toBeNull();
  });

  it("skips the gate in RenderMode.Static", async () => {
    const { zenUml, store } = mount();
    const config = { enableWritingAnimation: true, mode: RenderMode.Static };
    await zenUml.render("A.m()", config);
    await zenUml.render("A.m()\nre", config);
    expect(store.get(modeAtom)).toBe(RenderMode.Static);
    expect(store.get(renderCodeAtom)).toBeNull();
  });

  it("skips the gate for a paste of two or more lines", async () => {
    const { zenUml, store } = mount();
    await zenUml.render("A.m()", { enableWritingAnimation: true });
    const start = Date.now();
    await zenUml.render("A.m()\nre\nBo\nA.n(", {});
    expect(Date.now() - start).toBeLessThan(1000);
    expect(store.get(renderCodeAtom)).toBeNull();
  });

  it("renders raw text at once when the option is switched off", async () => {
    const { zenUml, store } = mount();
    await zenUml.render("A.m()", { enableWritingAnimation: true });
    void zenUml.render("A.m()\nre", {});
    await until(() => store.get(renderCodeAtom) === "A.m()\n");
    const start = Date.now();
    await zenUml.render("A.m()\nre", { enableWritingAnimation: false });
    expect(Date.now() - start).toBeLessThan(1000);
    expect(store.get(renderCodeAtom)).toBeNull();
  });

  it("never calls onContentChange for a gated frame", async () => {
    const { zenUml } = mount();
    const onContentChange = vi.fn();
    await zenUml.render("A.m()", {
      enableWritingAnimation: true,
      onContentChange,
    });
    await zenUml.render("A.m()\nre", { onContentChange });
    expect(onContentChange).not.toHaveBeenCalled();
  });
});

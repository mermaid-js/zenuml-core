import { describe, expect, it } from "vitest";
import {
  CLICK_LIMIT_MS,
  CLICK_NEWEST,
  collectCandidates,
  classifyDevice,
  DeviceDetector,
  drawArmOrder,
  HiddenTimer,
  loadClarity,
  maskForClarity,
  newSessionId,
  orderCode,
  judgeClick,
  NewestTracker,
  timeoutAnswer,
} from "./trial-flow";
import { Recorder, armOrder } from "./trial";

// A tiny seeded generator, so a distribution test is repeatable.
const lcg = (seed: number) => () => {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

describe("drawArmOrder", () => {
  it("maps the random number to one of the three Latin-square rows", () => {
    expect(drawArmOrder(() => 0)).toEqual(["A", "B", "C"]);
    expect(drawArmOrder(() => 0.3333)).toEqual(["A", "B", "C"]);
    expect(drawArmOrder(() => 0.3334)).toEqual(["B", "C", "A"]);
    expect(drawArmOrder(() => 0.6666)).toEqual(["B", "C", "A"]);
    expect(drawArmOrder(() => 0.6667)).toEqual(["C", "A", "B"]);
    expect(drawArmOrder(() => 0.999999)).toEqual(["C", "A", "B"]);
  });

  it("only ever returns a row of armOrder", () => {
    const rows = [1, 2, 3].map((n) => armOrder(n).join(""));
    const random = lcg(7);
    for (let i = 0; i < 200; i++)
      expect(rows).toContain(orderCode(drawArmOrder(random)));
  });

  it("draws the three rows about equally often", () => {
    const random = lcg(42);
    const counts: Record<string, number> = {};
    for (let i = 0; i < 3000; i++) {
      const code = orderCode(drawArmOrder(random));
      counts[code] = (counts[code] ?? 0) + 1;
    }
    expect(Object.keys(counts).sort()).toEqual(["ABC", "BCA", "CAB"]);
    for (const n of Object.values(counts)) {
      expect(n).toBeGreaterThan(900);
      expect(n).toBeLessThan(1100);
    }
  });

  it("works with the default random source", () => {
    expect(orderCode(drawArmOrder())).toMatch(/^(ABC|BCA|CAB)$/);
  });
});

describe("device classification", () => {
  it("is touch without a fine pointer, or when a touch comes before any key", () => {
    expect(classifyDevice(true, false)).toBe("desktop");
    expect(classifyDevice(false, false)).toBe("touch");
    expect(classifyDevice(true, true)).toBe("touch");
    expect(classifyDevice(false, true)).toBe("touch");
  });

  it("DeviceDetector: a touch before any key makes the device touch", () => {
    const d = new DeviceDetector(true);
    expect(d.device()).toBe("desktop");
    d.touch();
    expect(d.device()).toBe("touch");
  });

  it("DeviceDetector: a touch after the first key is ignored", () => {
    const d = new DeviceDetector(true);
    d.key();
    d.touch();
    expect(d.device()).toBe("desktop");
  });

  it("DeviceDetector: no fine pointer is touch even with keys", () => {
    const d = new DeviceDetector(false);
    d.key();
    expect(d.device()).toBe("touch");
  });
});

describe("HiddenTimer", () => {
  it("adds up the time the tab was hidden, as a whole number", () => {
    const h = new HiddenTimer();
    h.change(true, 1000.4);
    h.change(false, 3500.9);
    h.change(true, 5000);
    h.change(false, 5100);
    expect(h.total(9000)).toBe(2601);
    expect(Number.isInteger(h.total(9000))).toBe(true);
  });

  it("counts a hidden span that is still open", () => {
    const h = new HiddenTimer();
    h.change(true, 100);
    expect(h.total(10100)).toBe(10000);
  });

  it("ignores a repeated hidden or visible event", () => {
    const h = new HiddenTimer();
    h.change(false, 5);
    h.change(true, 100);
    h.change(true, 200);
    h.change(false, 300);
    expect(h.total(1000)).toBe(200);
  });

  it("is 0 when the tab was never hidden", () => {
    expect(new HiddenTimer().total(5000)).toBe(0);
  });
});

describe("newSessionId", () => {
  it("is 22 URL-safe characters, the shape the collector accepts", () => {
    const id = newSessionId();
    expect(id).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(newSessionId()).not.toBe(id);
  });
});

describe("Recorder header", () => {
  const rec = (editor?: "textarea" | "smart") =>
    new Recorder("", { task: "t1", arm: "C" }, 1000, editor);

  it("keeps the old header when no extras are given", () => {
    const r = new Recorder("", { task: "t1", arm: "A", participant: 3 }, 0);
    r.input("a", 5);
    expect(JSON.parse(r.toJsonl().split("\n")[0])).toEqual({
      start: "",
      task: "t1",
      arm: "A",
      participant: 3,
      editor: "textarea",
    });
  });

  it("writes editor smart when asked", () => {
    const r = rec("smart");
    r.input("a", 1010);
    expect(JSON.parse(r.toJsonl().split("\n")[0]).editor).toBe("smart");
  });

  it("adds paste, hiddenMs, durationMs and detect to the header", () => {
    const r = rec();
    r.input("a", 1010);
    r.input("ab", 1050);
    const detect = [{ q: "Q", answer: "a line", correct: true }];
    const lines = r
      .toJsonl({ paste: false, hiddenMs: 0, durationMs: 61234, detect })
      .split("\n");
    expect(JSON.parse(lines[0])).toEqual({
      start: "",
      task: "t1",
      arm: "C",
      editor: "textarea",
      paste: false,
      hiddenMs: 0,
      durationMs: 61234,
      detect,
    });
    // The events are untouched.
    expect(JSON.parse(lines[1])).toEqual({ t: 10, pos: 0, del: 0, ins: "a" });
    expect(JSON.parse(lines[2])).toEqual({ t: 50, pos: 1, del: 0, ins: "b" });
  });

  it("rounds hiddenMs and durationMs to whole numbers", () => {
    const r = rec();
    r.input("a", 1010);
    const head = JSON.parse(
      r
        .toJsonl({
          paste: true,
          hiddenMs: 12.6,
          durationMs: 999.5,
          detect: [],
        })
        .split("\n")[0],
    );
    expect(head.hiddenMs).toBe(13);
    expect(head.durationMs).toBe(1000);
    expect(head.paste).toBe(true);
  });

  it("calling toJsonl twice gives the same text", () => {
    const r = rec();
    r.input("a", 1010);
    const extras = { paste: false, hiddenMs: 0, durationMs: 5, detect: [] };
    expect(r.toJsonl(extras)).toBe(r.toJsonl(extras));
  });
});

describe("newest-element tracker", () => {
  const c = (key: string, label = key) => ({ key, label });

  it("calls the elements of the latest frame that added something the newest", () => {
    const t = new NewestTracker();
    t.observe([c("p:A")]);
    expect(t.newest()).toEqual(["p:A"]);
    t.observe([c("p:A"), c("m:go#0")]);
    expect(t.newest()).toEqual(["m:go#0"]);
    t.observe([c("p:A"), c("m:go#0")]);
    expect(t.newest()).toEqual(["m:go#0"]);
  });

  it("keeps all elements that appeared together", () => {
    const t = new NewestTracker();
    t.observe([c("p:A")]);
    t.observe([c("p:A"), c("p:B"), c("m:x#0")]);
    expect(t.newest().sort()).toEqual(["m:x#0", "p:B"]);
  });

  it("a changed label is a new element: the line being typed is the newest", () => {
    const t = new NewestTracker();
    t.observe([c("p:A"), c("m:go(c#0")]);
    t.observe([c("p:A"), c("m:go(ca#0")]);
    expect(t.newest()).toEqual(["m:go(ca#0"]);
  });

  it("an element that goes away and comes back is new again", () => {
    const t = new NewestTracker();
    t.observe([c("p:A"), c("p:B")]);
    t.observe([c("p:A")]);
    expect(t.newest()).toEqual(["p:A"]);
    t.observe([c("p:A"), c("p:B")]);
    expect(t.newest()).toEqual(["p:B"]);
  });

  it("has no newest element on an empty diagram", () => {
    const t = new NewestTracker();
    t.observe([]);
    expect(t.newest()).toEqual([]);
    expect(t.hasElements()).toBe(false);
  });
});

describe("collectCandidates", () => {
  it("finds participants, messages and fragment headers, with labels and keys", () => {
    const root = document.createElement("div");
    root.innerHTML = `
      <div class="participant" data-participant-id="Shop">Shop</div>
      <div class="participant" data-participant-id="Cart">Cart</div>
      <div class="message">checkout(cart)1</div>
      <div class="message">total()1.1</div>
      <div class="message">total()1.1</div>
      <div class="message">1.1.1return amount</div>
      <div class="fragment fragment-alt"><div class="header">1.2Alt</div><div class="name">1.2Alt</div></div>`;
    const found = collectCandidates(root);
    expect(found.map((f) => f.key)).toEqual([
      "p:Shop",
      "p:Cart",
      "m:checkout(cart)#0",
      "m:total()#0",
      "m:total()#1",
      "m:return amount#0",
      "f:Alt#0",
    ]);
    expect(found.map((f) => f.label)).toEqual([
      "Shop",
      "Cart",
      "checkout(cart)",
      "total()",
      "total()",
      "return amount",
      "Alt",
    ]);
    expect(found.every((f) => f.el instanceof Element)).toBe(true);
  });

  it("returns nothing for an empty diagram", () => {
    expect(collectCandidates(document.createElement("div"))).toEqual([]);
  });
});

describe("judgeClick", () => {
  const box = (l: number, t: number, r: number, b: number) => ({
    left: l,
    top: t,
    right: r,
    bottom: b,
  });
  const hits = [
    { label: "Shop", newest: false, box: box(0, 0, 80, 40) },
    { label: "go()", newest: true, box: box(100, 100, 300, 116) },
    { label: "Alt", newest: false, box: box(90, 90, 400, 200) },
  ];

  it("is correct for a click inside the newest element's box", () => {
    expect(judgeClick(150, 108, hits)).toEqual({
      q: CLICK_NEWEST,
      answer: "go()",
      correct: true,
    });
  });

  it("is correct on the box edge", () => {
    expect(judgeClick(100, 100, hits).correct).toBe(true);
    expect(judgeClick(300, 116, hits).correct).toBe(true);
  });

  it("is wrong for a click on another element, and names it", () => {
    expect(judgeClick(10, 10, hits)).toEqual({
      q: CLICK_NEWEST,
      answer: "Shop",
      correct: false,
    });
    // Inside the fragment but outside the newest message: the fragment.
    expect(judgeClick(350, 150, hits).answer).toBe("Alt");
  });

  it("is wrong, answer none, for a click on empty space", () => {
    expect(judgeClick(500, 500, hits)).toEqual({
      q: CLICK_NEWEST,
      answer: "none",
      correct: false,
    });
  });

  it("is wrong, answer none, for a timeout", () => {
    expect(timeoutAnswer()).toEqual({
      q: CLICK_NEWEST,
      answer: "none",
      correct: false,
    });
  });

  it("the probe time limit is 10 s", () => {
    expect(CLICK_LIMIT_MS).toBe(10_000);
  });
});

describe("loadClarity", () => {
  const fakeDoc = () => {
    const added: { src: string }[] = [];
    const first = {
      parentNode: { insertBefore: (el: { src: string }) => added.push(el) },
    };
    return {
      added,
      doc: {
        createElement: () => ({ src: "", async: false }),
        getElementsByTagName: () => [first],
      } as unknown as Document,
      win: {} as Record<string, unknown>,
    };
  };

  it("does nothing without a project id", () => {
    const f = fakeDoc();
    expect(loadClarity("", f.doc, f.win)).toBe(false);
    expect(loadClarity(undefined, f.doc, f.win)).toBe(false);
    expect(f.added).toHaveLength(0);
    expect(f.win.clarity).toBeUndefined();
  });

  it("rejects an id that is not a plain token", () => {
    const f = fakeDoc();
    expect(loadClarity('x"><script>', f.doc, f.win)).toBe(false);
    expect(f.added).toHaveLength(0);
  });

  it("injects the Clarity tag once, for a configured id", () => {
    const f = fakeDoc();
    expect(loadClarity("abc123xyz9", f.doc, f.win)).toBe(true);
    expect(f.added).toHaveLength(1);
    expect(f.added[0].src).toBe("https://www.clarity.ms/tag/abc123xyz9");
    expect(typeof f.win.clarity).toBe("function");
    expect(loadClarity("abc123xyz9", f.doc, f.win)).toBe(false);
    expect(f.added).toHaveLength(1);
  });

  it("masks an element for Clarity", () => {
    const attrs: Record<string, string> = {};
    maskForClarity({
      setAttribute: (k: string, v: string) => (attrs[k] = v),
    } as unknown as Element);
    expect(attrs["data-clarity-mask"]).toBe("True");
  });
});

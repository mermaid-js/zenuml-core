import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import { shownOf } from "./shown";
import { IDLE_FLUSH_MS, LOSS_HOLD_MS, Tempo, WritingGate } from "./WritingGate";

const make = (code: string) => {
  const g = new WritingGate((text) => shownOf(RootContext(text)));
  g.reset(code);
  g.committed(code);
  return g;
};

describe("Tempo", () => {
  it("keeps the dwell between 250 and 500 ms", () => {
    const fast = new Tempo();
    for (let t = 0; t < 2000; t += 20) fast.key(t);
    expect(fast.dwell).toBe(250);
    const slow = new Tempo();
    for (let t = 0; t < 20000; t += 1000) slow.key(t);
    expect(slow.dwell).toBe(500);
  });
});

describe("Tempo.stroke", () => {
  it("is the motion stroke time D for the current tempo", () => {
    const fast = new Tempo();
    for (let t = 0; t < 2000; t += 20) fast.key(t);
    expect(fast.stroke).toBe(110);
    const mid = new Tempo();
    for (let t = 0; t < 4000; t += 100) mid.key(t);
    expect(mid.stroke).toBe(160);
    expect(new Tempo().stroke).toBe(240);
  });
});

describe("WritingGate", () => {
  it("does not parse on commit (the option-off path only commits)", () => {
    let parses = 0;
    const g = new WritingGate(() => {
      parses++;
      return { names: new Set(), statements: [] };
    });
    g.reset("A.m()");
    g.committed("A.m()");
    g.committed("A.m()\nB.n()");
    expect(parses).toBe(0);
  });

  // G4: an empty diagram is wider than a small one, so a partial first line
  // made the width fall, then grow (ADR 0009, G1).
  it("keeps the empty frame while the only drawn line is the one being typed", () => {
    const g = make("");
    g.input("group x {", 100);
    expect(g.frame(200)).toEqual({ text: null, wait: null });
    g.input("Production.", 300);
    expect(g.frame(400).text).toBeNull();
    expect(g.settle(900).text).toBeNull();
    g.input("// a note\nA.", 1000);
    expect(g.frame(1100).text).toBeNull();
  });

  it("leaves the empty frame once a finished line draws", () => {
    const g = make("");
    g.input("group x {a}\n", 100);
    expect(g.frame(200).text).toBe("group x {a}\n");
  });

  // Trial feedback: in arm C a finished title line stayed hidden until a
  // third line was typed, because a title alone counted as an empty frame.
  it("leaves the empty frame once a finished title line draws", () => {
    const g = make("");
    g.input("title Order checkout\n", 100);
    expect(g.frame(200).text).toBe("title Order checkout\n");
    g.input("title Order checkout\n@Actor Cus", 300);
    expect(g.frame(400).text).not.toBeNull();
  });

  it("leaves the empty frame at the idle flush", () => {
    const g = make("");
    g.input("Production.", 100);
    expect(g.frame(100 + IDLE_FLUSH_MS).text).toBe("Production.");
  });

  it("renders a complete line as typed", () => {
    const g = make("A.m()");
    g.input("A.m()\nB.n()", 100);
    expect(g.frame(200)).toEqual({ text: "A.m()\nB.n()", wait: null });
  });

  it("closes an open call", () => {
    const g = make("A.m()");
    g.input("A.m()\nA.n(", 100);
    expect(g.frame(200).text).toBe("A.m()\nA.n()");
  });

  it("holds a bare name, then releases it after the dwell", () => {
    const g = make("A.m()");
    g.input("A.m()\nBo", 100);
    const first = g.frame(200);
    expect(first.text).toBe("A.m()\n");
    expect(first.wait).toBeGreaterThanOrEqual(250);
    expect(g.settle(200 + first.wait!).text).toBe("A.m()\nBo");
  });

  it("holds a keyword prefix after the dwell, until the idle flush", () => {
    const g = make("A.m()");
    g.input("A.m()\nre", 100);
    expect(g.frame(200).text).toBe("A.m()\n");
    expect(g.settle(600).text).toBe("A.m()\n");
    expect(g.idleAt).toBe(100 + IDLE_FLUSH_MS);
    expect(g.frame(100 + IDLE_FLUSH_MS).text).toBe("A.m()\nre");
  });

  it("holds a frame that would drop an element, then forces it after 1,200 ms", () => {
    const g = new WritingGate((text) => shownOf(RootContext(text)));
    g.reset("A.m()");
    // On screen: `A.m()` and `B.n()`; the next frame drops `B.n()` although
    // the edit only adds text.
    g.committed("A.m()\nB.n()");
    g.input("A.m()\nX", 100);
    const held = g.frame(200);
    expect(held.text).toBeNull();
    expect(held.wait).toBeGreaterThan(0);
    expect(g.frame(100 + LOSS_HOLD_MS - 1).text).toBeNull();
    expect(g.force(100 + LOSS_HOLD_MS).text).toBe("A.m()\nX");
  });

  it("does not hold a frame after a deletion", () => {
    const g = make("A.m()\nB.n()");
    g.input("A.m()\n", 100);
    expect(g.frame(200).text).not.toBeNull();
  });

  it("passes a paste of two or more lines through ungated", () => {
    const g = make("");
    g.input("A.m(\nBo\nre", 100);
    expect(g.frame(200).text).toBe("A.m(\nBo\nre");
  });

  it("knows when the committed frame is the raw text", () => {
    const g = make("A.m()");
    g.input("A.m()\nBo", 100);
    const r = g.frame(200);
    g.committed(r.text!);
    expect(g.settled).toBe(false);
    g.committed("A.m()\nBo");
    expect(g.settled).toBe(true);
  });
});

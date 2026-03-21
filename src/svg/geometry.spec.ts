import { describe, it, expect } from "bun:test";
import { renderToSvg } from "./renderToSvg";
import type { DiagramGeometry } from "./geometry";

function geo(dsl: string): DiagramGeometry {
  const r = renderToSvg(dsl);
  if (!r.geometry) throw new Error("No geometry for: " + dsl);
  return r.geometry;
}

describe("geometry: participants", () => {
  it("positions starter + one participant for A.m", () => {
    const g = geo("A.m");
    expect(g.participants).toHaveLength(2);
    const [starter, a] = g.participants;
    expect(starter.isStarter).toBe(true);
    expect(a.name).toBe("A");
    expect(a.isStarter).toBe(false);
    // Structural: both same y, same height, starter left of A
    expect(starter.y).toBe(a.y);
    expect(starter.height).toBe(a.height);
    expect(starter.x).toBeLessThan(a.x);
  });

  it("positions 3 participants left-to-right", () => {
    const g = geo("A -> B: hello\nB -> C: msg");
    expect(g.participants).toHaveLength(3);
    const [a, b, c] = g.participants;
    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);
    // All same y and height
    expect(a.y).toBe(b.y);
    expect(b.y).toBe(c.y);
    expect(a.height).toBe(b.height);
  });
});

describe("geometry: messages", () => {
  it("positions a simple LTR message", () => {
    const g = geo("A -> B: hello");
    expect(g.messages).toHaveLength(1);
    const m = g.messages[0];
    expect(m.label).toBe("hello");
    expect(m.fromX).toBeLessThan(m.toX);
    expect(m.y).toBeGreaterThan(0);
  });

  it("positions a RTL message (fromX > toX)", () => {
    const g = geo("A\nB -> A: reverse");
    const m = g.messages[0];
    expect(m.label).toBe("reverse");
    expect(m.isReverse).toBe(true);
    expect(m.fromX).toBeGreaterThan(m.toX);
  });
});

describe("geometry: self-calls", () => {
  it("positions a self-call (A->A syntax)", () => {
    const g = geo("A->A: self");
    expect(g.selfCalls).toHaveLength(1);
    const s = g.selfCalls[0];
    expect(s.label).toBe("self");
    expect(s.width).toBeGreaterThan(0);
    expect(s.height).toBeGreaterThan(0);
    expect(s.x).toBeGreaterThan(0);
    expect(s.y).toBeGreaterThan(0);
  });
});

describe("geometry: occurrences", () => {
  it("positions occurrence bars for nested calls", () => {
    const g = geo("A.method() { B.inner() }");
    expect(g.occurrences.length).toBeGreaterThanOrEqual(2);
    const [occA, occB] = g.occurrences;
    // A's occurrence should be left of B's
    expect(occA.x).toBeLessThan(occB.x);
    // A's occurrence should be taller (wraps B's call)
    expect(occA.height).toBeGreaterThan(occB.height);
    // Both have positive dimensions
    expect(occA.width).toBeGreaterThan(0);
    expect(occB.width).toBeGreaterThan(0);
  });
});

describe("geometry: fragments", () => {
  it("positions an if fragment", () => {
    const g = geo("if(x) { A -> B: msg }");
    expect(g.fragments).toHaveLength(1);
    const f = g.fragments[0];
    expect(f.kind).toBe("alt");
    expect(f.width).toBeGreaterThan(0);
    expect(f.height).toBeGreaterThan(0);
  });

  it("positions if/else fragment with correct dimensions", () => {
    const g = geo("if(x) { A->B: a } else { A->B: b }");
    expect(g.fragments).toHaveLength(1);
    const f = g.fragments[0];
    expect(f.kind).toBe("alt");
    expect(f.width).toBeGreaterThan(0);
    expect(f.height).toBeGreaterThan(0);
  });
});

describe("geometry: returns", () => {
  it("positions a return line", () => {
    const g = geo("A->B.method() { return result }");
    expect(g.returns).toHaveLength(1);
    const r = g.returns[0];
    expect(r.label).toBe("result");
    // Return goes from B back to A (right to left)
    expect(r.fromX).toBeGreaterThan(r.toX);
    expect(r.y).toBeGreaterThan(0);
  });
});

describe("geometry: creations", () => {
  it("creation participant has lower y than normal participants", () => {
    const g = geo("A.m { new B() }");
    const normal = g.participants.find(p => p.name === "A")!;
    const created = g.creations[0].participant;
    expect(created.y).toBeGreaterThan(normal.y);
    expect(created.width).toBeGreaterThan(0);
  });
});

describe("geometry: lifelines", () => {
  it("positions lifelines at participant centers", () => {
    const g = geo("A -> B: hello");
    expect(g.lifelines.length).toBeGreaterThanOrEqual(2);
    const [lineA, lineB] = g.lifelines;
    expect(lineA.participantName).toBe("A");
    expect(lineB.participantName).toBe("B");
    // Lifeline x should match participant center
    expect(lineA.x).toBeLessThan(lineB.x);
    expect(lineA.topY).toBeLessThan(lineA.bottomY);
  });
});

describe("geometry: dividers", () => {
  it("positions a divider between messages", () => {
    const g = geo("A->B: first\n== Phase 2 ==\nA->B: second");
    expect(g.dividers).toHaveLength(1);
    const d = g.dividers[0];
    expect(d.label).toBe("== Phase 2 ==");
    expect(d.y).toBeGreaterThan(0);
    expect(d.width).toBeGreaterThan(0);
  });
});

describe("geometry: comments", () => {
  it("positions a comment", () => {
    const g = geo("// comment\nA.method()");
    expect(g.comments).toHaveLength(1);
    const c = g.comments[0];
    expect(c.text).toBe("comment");
    expect(c.x).toBeGreaterThan(0);
    expect(c.y).toBeGreaterThan(0);
  });
});

describe("geometry: dimensions", () => {
  it("reports overall width, height, and frame borders", () => {
    const g = geo("A.m");
    expect(g.width).toBeGreaterThan(0);
    expect(g.height).toBeGreaterThan(0);
    expect(g.frameBorderLeft).toBeDefined();
    expect(g.frameBorderRight).toBeDefined();
  });
});

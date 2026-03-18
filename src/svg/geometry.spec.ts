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
    expect({
      starter: { x: starter.x, y: starter.y, width: starter.width, height: starter.height },
      a: { x: a.x, y: a.y, width: a.width, height: a.height },
    }).toMatchSnapshot();
  });

  it("positions 3 participants left-to-right", () => {
    const g = geo("A -> B: hello\nB -> C: msg");
    expect(g.participants).toHaveLength(3); // A + B + C (no starter for direct messages)
    const [a, b, c] = g.participants;
    expect(a.x).toBeLessThan(b.x);
    expect(b.x).toBeLessThan(c.x);
    expect({
      a: { x: a.x, y: a.y, width: a.width, height: a.height },
      b: { x: b.x, y: b.y, width: b.width, height: b.height },
      c: { x: c.x, y: c.y, width: c.width, height: c.height },
    }).toMatchSnapshot();
  });
});

describe("geometry: messages", () => {
  it("positions a simple LTR message", () => {
    const g = geo("A -> B: hello");
    expect(g.messages).toHaveLength(1);
    const m = g.messages[0];
    expect(m.label).toBe("hello");
    expect(m.fromX).toBeLessThan(m.toX);
    expect({ fromX: m.fromX, toX: m.toX, y: m.y }).toMatchSnapshot();
  });

  it("positions a RTL message (fromX > toX)", () => {
    const g = geo("A\nB -> A: reverse");
    const m = g.messages[0];
    expect(m.label).toBe("reverse");
    expect(m.isReverse).toBe(true);
    expect({ fromX: m.fromX, toX: m.toX, y: m.y }).toMatchSnapshot();
  });
});

describe("geometry: self-calls", () => {
  it("positions a self-call (A->A syntax)", () => {
    const g = geo("A->A: self");
    expect(g.selfCalls).toHaveLength(1);
    const s = g.selfCalls[0];
    expect(s.label).toBe("self");
    expect({ x: s.x, y: s.y, width: s.width, height: s.height }).toMatchSnapshot();
  });
});

describe("geometry: occurrences", () => {
  it("positions occurrence bars for nested calls", () => {
    const g = geo("A.method() { B.inner() }");
    expect(g.occurrences.length).toBeGreaterThanOrEqual(2);
    const occs = g.occurrences.map(o => ({
      participant: o.participantName,
      x: o.x,
      y: o.y,
      width: o.width,
      height: o.height,
    }));
    expect(occs).toMatchSnapshot();
  });
});

describe("geometry: fragments", () => {
  it("positions an if fragment", () => {
    const g = geo("if(x) { A -> B: msg }");
    expect(g.fragments).toHaveLength(1);
    const f = g.fragments[0];
    expect(f.kind).toBe("alt");
    expect({
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      headerY: f.headerY,
    }).toMatchSnapshot();
  });

  it("positions if/else fragment with correct dimensions", () => {
    const g = geo("if(x) { A->B: a } else { A->B: b }");
    expect(g.fragments).toHaveLength(1);
    const f = g.fragments[0];
    expect(f.kind).toBe("alt");
    // Snapshot the whole fragment dimensions (sections may be empty depending on buildGeometry impl)
    expect({
      x: f.x,
      y: f.y,
      width: f.width,
      height: f.height,
      headerY: f.headerY,
      sectionsCount: f.sections.length,
    }).toMatchSnapshot();
  });
});

describe("geometry: returns", () => {
  it("positions a return line", () => {
    const g = geo("A->B.method() { return result }");
    expect(g.returns).toHaveLength(1);
    const r = g.returns[0];
    expect(r.label).toBe("result");
    expect({ fromX: r.fromX, toX: r.toX, y: r.y }).toMatchSnapshot();
  });
});

describe("geometry: creations", () => {
  it("creation participant has lower y than normal participants", () => {
    const g = geo("A.m { new B() }");
    const normal = g.participants.find(p => p.name === "A")!;
    const created = g.creations[0].participant;
    expect(created.y).toBeGreaterThan(normal.y);
    expect({
      normalY: normal.y,
      createdY: created.y,
      createdX: created.x,
      createdWidth: created.width,
    }).toMatchSnapshot();
  });
});

describe("geometry: lifelines", () => {
  it("positions lifelines at participant centers", () => {
    const g = geo("A -> B: hello");
    expect(g.lifelines.length).toBeGreaterThanOrEqual(2);
    const lines = g.lifelines.map(l => ({
      participant: l.participantName,
      x: l.x,
      topY: l.topY,
      bottomY: l.bottomY,
    }));
    expect(lines).toMatchSnapshot();
  });
});

describe("geometry: dividers", () => {
  it("positions a divider between messages", () => {
    const g = geo("A->B: first\n== Phase 2 ==\nA->B: second");
    expect(g.dividers).toHaveLength(1);
    const d = g.dividers[0];
    expect(d.label).toBe("== Phase 2 ==");
    expect({ y: d.y, width: d.width }).toMatchSnapshot();
  });
});

describe("geometry: comments", () => {
  it("positions a comment", () => {
    const g = geo("// comment\nA.method()");
    expect(g.comments).toHaveLength(1);
    const c = g.comments[0];
    expect(c.text).toBe("comment");
    expect({ x: c.x, y: c.y }).toMatchSnapshot();
  });
});

describe("geometry: dimensions", () => {
  it("reports overall width, height, and frame borders", () => {
    const g = geo("A.m");
    expect({
      width: g.width,
      height: g.height,
      frameBorderLeft: g.frameBorderLeft,
      frameBorderRight: g.frameBorderRight,
    }).toMatchSnapshot();
  });
});

import { describe, expect, it } from "vitest";
import { planMotion, strokeMs, type Box } from "./motion";

// ADR 0009, Decision 4 and the design note, section 4: motion rules.

const box = (
  kind: Box["kind"],
  x: number,
  y: number,
  parent: string | null = null,
): Box => ({ kind, x, y, parent });

const frame = (entries: [string, Box][]) => new Map(entries);

describe("strokeMs", () => {
  it("is 1.6 x the key interval, between 110 and 240 ms", () => {
    expect(strokeMs(100)).toBe(160);
    expect(strokeMs(10)).toBe(110);
    expect(strokeMs(500)).toBe(240);
  });
});

describe("planMotion", () => {
  // Trial feedback: on an empty diagram the first participant popped in
  // without motion. The hook skips only the initial render; an empty frame
  // before content is a real frame.
  it("reveals everything that appears on an empty diagram", () => {
    const next = frame([
      ["A", box("participant", 0, 0)],
      ["m", box("statement", 0, 50)],
    ]);
    expect(planMotion(new Map(), next, 160)).toEqual({
      moves: [],
      reveals: [
        { key: "A", delay: 0, duration: 160 },
        { key: "m", delay: 48, duration: 160 },
      ],
      removals: [],
    });
  });

  it("moves a kept element from its old place (FLIP)", () => {
    const prev = frame([["s1", box("statement", 0, 10)]]);
    const next = frame([["s1", box("statement", 0, 40)]]);
    expect(planMotion(prev, next, 160).moves).toEqual([
      { key: "s1", dx: 0, dy: -30 },
    ]);
  });

  it("moves a child only by what its parent's move does not cover", () => {
    const prev = frame([
      ["f", box("statement", 0, 10)],
      ["c", box("statement", 20, 30, "f")],
    ]);
    const next = frame([
      ["f", box("statement", 0, 40)],
      ["c", box("statement", 20, 60, "f")],
    ]);
    expect(planMotion(prev, next, 160).moves).toEqual([
      { key: "f", dx: 0, dy: -30 },
    ]);
  });

  it("reveals a new participant and starts its message 0.3 D later", () => {
    const prev = frame([["A", box("participant", 0, 0)]]);
    const next = frame([
      ["A", box("participant", 0, 0)],
      ["B", box("participant", 100, 0)],
      ["m", box("statement", 0, 50)],
    ]);
    expect(planMotion(prev, next, 200).reveals).toEqual([
      { key: "B", delay: 0, duration: 200 },
      { key: "m", delay: 60, duration: 200 },
    ]);
  });

  it("reveals a message at once when no participant is new", () => {
    const prev = frame([["A", box("participant", 0, 0)]]);
    const next = frame([
      ["A", box("participant", 0, 0)],
      ["m", box("statement", 0, 50)],
    ]);
    expect(planMotion(prev, next, 200).reveals).toEqual([
      { key: "m", delay: 0, duration: 200 },
    ]);
  });

  it("does not reveal a child of a new element on its own", () => {
    const prev = frame([["A", box("participant", 0, 0)]]);
    const next = frame([
      ["A", box("participant", 0, 0)],
      ["f", box("statement", 0, 50)],
      ["c", box("statement", 10, 60, "f")],
    ]);
    expect(planMotion(prev, next, 200).reveals.map((r) => r.key)).toEqual([
      "f",
    ]);
  });

  it("staggers 5 or more new elements over 240 ms, 120 ms each", () => {
    const prev = frame([["A", box("participant", 0, 0)]]);
    const next = frame([
      ["A", box("participant", 0, 0)],
      ...[0, 1, 2, 3, 4].map(
        (i) => [`m${i}`, box("statement", 0, 50 + i * 30)] as [string, Box],
      ),
    ]);
    expect(planMotion(prev, next, 200).reveals).toEqual([
      { key: "m0", delay: 0, duration: 120 },
      { key: "m1", delay: 30, duration: 120 },
      { key: "m2", delay: 60, duration: 120 },
      { key: "m3", delay: 90, duration: 120 },
      { key: "m4", delay: 120, duration: 120 },
    ]);
  });

  it("fades out a removed element, not its removed children", () => {
    const prev = frame([
      ["A", box("participant", 0, 0)],
      ["f", box("statement", 0, 50)],
      ["c", box("statement", 10, 60, "f")],
      ["m", box("statement", 0, 90)],
    ]);
    const next = frame([
      ["A", box("participant", 0, 0)],
      ["m", box("statement", 0, 50)],
    ]);
    expect(planMotion(prev, next, 200).removals).toEqual([
      { key: "f", duration: 90 },
    ]);
  });

  it("plans no motion at all when more than 120 elements are new", () => {
    const prev = frame([["A", box("participant", 0, 0)]]);
    const next = frame([
      ["A", box("participant", 0, 5)],
      ...Array.from(
        { length: 121 },
        (_, i) => [`m${i}`, box("statement", 0, i)] as [string, Box],
      ),
    ]);
    expect(planMotion(prev, next, 200)).toEqual({
      moves: [],
      reveals: [],
      removals: [],
    });
  });
});

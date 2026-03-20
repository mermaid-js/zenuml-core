import { describe, it, expect } from "bun:test";
import { scoreGeometry } from "./geometry-scorer";
import type { GeometryFixture } from "./geometry-fixture";

describe("scoreGeometry", () => {
  it("returns 100% when geometry matches fixture exactly", () => {
    const fixture: GeometryFixture = {
      case: "empty",
      code: "A B",
      anchor: { participant: "A", bottom: 48 },
      participants: [],
      messages: [],
      selfCalls: [],
      occurrences: [],
      returns: [],
      creations: [],
      fragments: [],
      dividers: [],
      comments: [],
      lifelines: [],
    };
    const result = scoreGeometry(fixture);
    expect(result.score).toBe(100);
    expect(result.mismatches).toEqual([]);
  });

  it("reports mismatches when geometry differs from fixture", () => {
    const fixture: GeometryFixture = {
      case: "simple-message",
      code: "A -> B: hello",
      anchor: { participant: "A", bottom: 48 },
      participants: [],
      messages: [{ label: "hello", fromX: 100, toX: 999, y: 999 }],
      selfCalls: [],
      occurrences: [],
      returns: [],
      creations: [],
      fragments: [],
      dividers: [],
      comments: [],
      lifelines: [],
    };
    const result = scoreGeometry(fixture);
    expect(result.score).toBeLessThan(100);
    const elementTypes = result.mismatches.map((m) => m.elementType);
    expect(elementTypes).toContain("message");
  });
});

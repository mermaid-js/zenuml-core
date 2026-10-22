import { describe, expect, it } from "vitest";
import { RootContext as AntlrRootContext } from "@/parser";
import ToCollector from "@/parser/ToCollector";
import {
  LangiumToCollector,
  RootContext as LangiumRootContext,
} from "@/parser-langium/compat";

// `GetNamePositions` lists every occurrence of a participant's name token.
// Rename uses it; `GetPositions` keeps the display (label) ranges used by
// inline canvas editing. Both collectors must record the same ranges.
const engines = [
  {
    engine: "ANTLR",
    collect: (code: string) =>
      ToCollector.getParticipants(AntlrRootContext(code)),
  },
  {
    engine: "Langium",
    collect: (code: string) =>
      LangiumToCollector.getParticipants(LangiumRootContext(code)),
  },
];

describe.each(engines)("GetNamePositions ($engine)", ({ collect }) => {
  const names = (code: string, name: string) => {
    const ranges = [...(collect(code).GetNamePositions(name) ?? [])];
    return ranges
      .sort((a, b) => a[0] - b[0])
      .map(([start, end]) => [start, end, code.slice(start, end)]);
  };

  it("records the declared identifier, not the `as` label", () => {
    const code = '@Actor A as "Alice"\nA->B: hi';
    expect(names(code, "A")).toEqual([
      [7, 8, "A"],
      [20, 21, "A"],
    ]);
    // The display range still points at the label.
    expect([...(collect(code).GetPositions("A") ?? [])]).toContainEqual([
      12, 19,
    ]);
  });

  it("records from and to endpoints", () => {
    const code = "A->B: hi\nB->A: back";
    expect(names(code, "A")).toEqual([
      [0, 1, "A"],
      [12, 13, "A"],
    ]);
    expect(names(code, "B")).toEqual([
      [3, 4, "B"],
      [9, 10, "B"],
    ]);
  });

  it("records only the name when an endpoint carries an emoji", () => {
    const code = "[rocket] A->B: hi";
    expect(names(code, "A")).toEqual([[9, 10, "A"]]);
  });

  it("records the starter", () => {
    const code = "@Starter(A)\nA->B.m()";
    expect(names(code, "A")).toEqual([
      [9, 10, "A"],
      [12, 13, "A"],
    ]);
  });

  it("records a creation without an assignee, even when labelled", () => {
    const code = 'C as "Cee"\nA->B.m() {\n  new C()\n}';
    expect(names(code, "C")).toEqual([
      [0, 1, "C"],
      [28, 29, "C"],
    ]);
    // The display ranges skip the constructor because of the label.
    expect([...(collect(code).GetPositions("C") ?? [])]).not.toContainEqual([
      28, 29,
    ]);
  });

  it("does not record the constructor of a creation with an assignee", () => {
    const code = "A->B.m() {\n  c = new C()\n}";
    // The display range still covers the constructor.
    expect([...(collect(code).GetPositions("c:C") ?? [])]).toContainEqual([
      21, 22,
    ]);
    expect(names(code, "c:C")).toEqual([]);
  });

  it("records every participant of a ref, but not its title", () => {
    const code = "A->B: hi\nref(T, A, B)";
    expect(names(code, "A")).toEqual([
      [0, 1, "A"],
      [16, 17, "A"],
    ]);
    expect(names(code, "B")).toEqual([
      [3, 4, "B"],
      [19, 20, "B"],
    ]);
    expect(collect(code).GetNamePositions("T")).toBeUndefined();
  });

  it("ignores names inside parameters and conditions", () => {
    const code = "A.m(B.foo(), new C())\nif (A.ok(D)) {\n  A->E: hi\n}";
    expect(names(code, "A")).toEqual([
      [0, 1, "A"],
      [39, 40, "A"],
    ]);
    expect(collect(code).GetNamePositions("B")).toBeUndefined();
    expect(collect(code).GetNamePositions("C")).toBeUndefined();
    expect(collect(code).GetNamePositions("D")).toBeUndefined();
  });
});

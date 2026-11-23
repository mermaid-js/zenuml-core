import { describe, expect, it } from "vitest";
import { gate, gateLine, locateEdit } from "./gate";

// Ported from the spike (ADR 0009, branch claude/animation-improvement-spike-a9009f
// at 7de6c3be): measure/gate-block-head.test.mjs and measure/gate-open-quote.test.mjs.

const ctx = (dwell: boolean, names: string[] = ["A"]) => ({
  names: new Set(names),
  dwell,
});

describe("locateEdit", () => {
  it("finds the line and the inserted text", () => {
    expect(locateEdit("A.m(", "A.m(x")).toEqual({
      line: 0,
      inserted: "x",
      removed: "",
      bulk: false,
    });
  });

  it("marks a paste of two or more lines as bulk", () => {
    expect(locateEdit("", "A\nB\nC").bulk).toBe(true);
    expect(locateEdit("A\nB", "A\nB\n").bulk).toBe(false);
  });

  it("reports the line of the caret after the edit", () => {
    expect(locateEdit("A\nB", "A\nBo").line).toBe(1);
  });
});

describe("a block head that already has `{` gets no second one", () => {
  it.each([
    ["  if(ok) { }", "  if(ok) { }"],
    ["  if(ok) {   }", "  if(ok) {   }"],
    ["  while(x) { A.b() }", "  while(x) { A.b() }"],
    ["  if(ok) {", "  if(ok) {"],
    ["  if(ok", "  if(ok) {"],
    ["  if(ok)", "  if(ok) {"],
    ['  if(s == "{")', '  if(s == "{") {'],
  ])("%j -> %j", (input, want) => {
    expect(gateLine(input, ctx(true)).text).toBe(want);
  });

  it("leaves a joined line alone after the gate", () => {
    const code = "A.m() {\n  if(ok) { }\n}";
    const edit = locateEdit("A.m() {\n  if(ok) { \n  }\n}", code);
    expect(gate(code, edit, ctx(true)).code).toBe(code);
  });
});

describe("an open quote keeps what its complete prefix draws", () => {
  describe.each([false, true])("dwell %s", (dwell) => {
    it.each([
      ['"space in name"->"', '"space in name"->'],
      ['"space in name"->"bg col', '"space in name"->'],
      ['"spa', ""],
      ['A.b("x', 'A.b("x")'],
    ])("%j -> %j", (input, want) => {
      expect(gateLine(input, ctx(dwell)).text).toBe(want);
    });

    it("draws what the prefix draws", () => {
      expect(gateLine('  "A"->"B', ctx(dwell)).text).toBe(
        gateLine('  "A"->', ctx(dwell)).text,
      );
    });
  });
});

describe("incomplete lines from the ADR", () => {
  it("holds a bare name while it is typed", () => {
    expect(gateLine("Bo", ctx(false))).toEqual({ text: "", reason: "bare" });
  });

  // G4, demo1-smoke: `"ret:CreatAndAssign"` alone drew a self-call that the
  // next key removed. Punctuation inside quotes is part of a name.
  it("holds a bare quoted name, even with punctuation inside the quotes", () => {
    expect(gateLine('  "ret:CreatAndAssign"', ctx(false))).toEqual({
      text: "",
      reason: "bare",
    });
    expect(gateLine('"a.b(c)"', ctx(false)).reason).toBe("bare");
    expect(gateLine('"a b".m', ctx(false))).toEqual({
      text: '"a b".m',
      reason: null,
    });
    expect(gateLine('"ret:C".m(a', ctx(false)).text).toBe('"ret:C".m(a)');
  });

  it("holds a keyword prefix, even after the dwell", () => {
    expect(gateLine("re", ctx(true))).toEqual({ text: "", reason: "keyword" });
  });

  it("closes an open call", () => {
    expect(gateLine("A.m(", ctx(false))).toEqual({
      text: "A.m()",
      reason: null,
    });
  });

  it("holds a message to a participant that does not exist yet", () => {
    expect(gateLine("Alice->Bo", ctx(false, ["Alice"])).reason).toBe("target");
    expect(gateLine("Alice->Bob", ctx(false, ["Alice", "Bob"])).reason).toBe(
      null,
    );
  });

  it("releases a held line after the dwell, closing its parens", () => {
    expect(gateLine("Alice->Bo", ctx(true, ["Alice"]))).toEqual({
      text: "Alice->Bo",
      reason: null,
    });
  });

  it("opens a block for a fragment head and closes it below", () => {
    const code = "if(x";
    const g = gate(code, locateEdit("if(", code), ctx(false));
    expect(g).toEqual({ code: "if(x) {\n}", reason: null });
  });

  it("reads an assignment with a generic type", () => {
    expect(gateLine("List<A> xs = new", ctx(false)).reason).toBe("new-name");
    expect(gateLine("Map<K,V> m = A.get(", ctx(false)).text).toBe(
      "Map<K,V> m = A.get()",
    );
  });

  it("leaves a comment and an empty line alone", () => {
    expect(gateLine("// note", ctx(false)).text).toBe("// note");
    expect(gateLine("", ctx(false)).text).toBe("");
  });

  it("does not gate a bulk edit", () => {
    const code = "A.m(\nB\nC";
    expect(gate(code, locateEdit("", code), ctx(false))).toEqual({
      code,
      reason: null,
    });
  });
});

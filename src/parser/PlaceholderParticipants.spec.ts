import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import ToCollector from "@/parser/ToCollector";
import { renderToSvg } from "@/svg/renderToSvg";
import { walkStatements } from "@/svg/walkStatements";

const names = (dsl: string) =>
  ToCollector.getParticipants(RootContext(dsl))
    .Array()
    .map((p) => p.name);

describe("incomplete DSL makes no placeholder participant (#673)", () => {
  it.each([
    ["@"],
    ["<<S>>"],
    ["@Actor"],
    ["new"],
    ["r = new"],
    ["group G {@"],
  ])("%s collects no participant", (dsl) => {
    expect(names(dsl)).toEqual([]);
  });

  it.each([["@"], ["<<S>>"], ["new"], ["r = new"], ["group G {@"]])(
    "%s draws no placeholder text or box",
    (dsl) => {
      const { svg } = renderToSvg(dsl);
      expect(svg.includes("Missing")).toBe(false);
      expect(svg.includes("create")).toBe(false);
    },
  );

  it("group G {@ collects the same members as group G {", () => {
    expect(names("group G {@")).toEqual(names("group G {"));
  });
});

describe("complete participants and creations are unchanged (#673)", () => {
  it.each([
    ["<<S>> A", ["A"]],
    ["@Actor A", ["A"]],
    ["new B()", ["B"]],
    ["r = new B()", ["r:B"]],
    ["A.m { new }", ["A"]],
    ["group G {@Actor A", ["A"]],
  ])("%s collects %j", (dsl, expected) => {
    expect(names(dsl)).toEqual(expected);
  });

  it("a named stereotype participant still renders", () => {
    expect(renderToSvg("<<S>> A").svg.includes(">A<")).toBe(true);
  });
});

const messages = (dsl: string) =>
  walkStatements(RootContext(dsl) as any)
    .filter((s) => s.kind === "sync")
    .map((s) => `${s.number} ${s.from}>${s.to}:${s.label}`);

describe("a nameless creation is transparent (#673)", () => {
  it.each([
    ["new\nA.b()", ["1 _STARTER_>A:b()"]],
    ["A.a()\nnew\nA.b()", ["1 _STARTER_>A:a()", "2 _STARTER_>A:b()"]],
    ["if(x) {\n  new\n  A.b()\n}", ["1.1 _STARTER_>A:b()"]],
    [
      "A.a()\nnew {\n  B.c()\n}\nA.d()",
      ["1 _STARTER_>A:a()", "2 _STARTER_>B:c()", "3 _STARTER_>A:d()"],
    ],
    ["new { A.b() }", ["1 _STARTER_>A:b()"]],
  ])("%j numbers and keeps its body", (dsl, expected) => {
    expect(messages(dsl)).toEqual(expected);
  });

  it("body participants belong to a visible message", () => {
    const dsl = "A.a()\nnew {\n  B.c()\n}\nA.d()";
    expect(names(dsl).sort()).toEqual(["A", "B"]);
    expect(renderToSvg(dsl).svg.includes("c()")).toBe(true);
  });
});

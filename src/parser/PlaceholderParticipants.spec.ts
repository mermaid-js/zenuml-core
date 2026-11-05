import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import ToCollector from "@/parser/ToCollector";
import { renderToSvg } from "@/svg/renderToSvg";

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
    ["new { m }"],
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

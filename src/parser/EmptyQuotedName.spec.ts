import { describe, expect, it } from "bun:test";
import { RootContext } from "./index";
import ToCollector from "./ToCollector";
import { renderToSvg } from "../svg/renderToSvg";

// Issue #674: an empty quoted name used as an arrow endpoint, call target or
// starter made `Participants.Add` throw, which replaced the whole diagram with
// an error. An editor that auto-closes quotes produces this text on the way to
// `A->"Bob"`.
const collect = (code: string) =>
  ToCollector.getParticipants(RootContext(code));
const names = (code: string) =>
  collect(code)
    .ImplicitArray()
    .map((p) => p.name);

describe("empty quoted name does not throw", () => {
  it.each([
    '@Starter("")',
    '"".m()',
    '""->B: x',
    'A->""',
    'A->"":',
    'A->"": x',
    'A->"".m()',
    'r = "".m()',
    '"A"->""',
  ])("%s", (code) => {
    expect(() => collect(code)).not.toThrow();
    expect(() => renderToSvg(code)).not.toThrow();
  });

  it("keeps earlier statements when the target is an empty name", () => {
    const { svg } = renderToSvg('A.a()\nA.b()\nB->""');
    expect(svg).toContain(">a()<");
    expect(svg).toContain(">b()<");
  });

  it("keeps the statement before and after an empty call target", () => {
    const { svg } = renderToSvg('A.a()\n"".m()\nA.c()');
    expect(svg).toContain(">a()<");
    expect(svg).toContain(">c()<");
  });

  it("renders an empty starter as if no starter were declared", () => {
    expect(names('@Starter("")\nA.a()')).toEqual(names("A.a()"));
    expect(collect('@Starter("")\nA.a()').Starter()).toBeUndefined();
  });

  it("registers no participant for the empty name", () => {
    expect(names('A->""')).toEqual(["A"]);
  });
});

describe("neighbouring valid and already tolerated input is unchanged", () => {
  it.each([
    ["A->B: x", ["A", "B"]],
    ['"A B"->C: x', ["A B", "C"]],
    ['@Starter("S")\nA.a()', ["S", "A"]],
    ['""', null],
    ['"" as x', null],
    ['A.""', null],
    ['A as ""', null],
  ])("%s", (code, expected) => {
    expect(() => collect(code)).not.toThrow();
    if (expected) expect(names(code)).toEqual(expected as string[]);
  });
});

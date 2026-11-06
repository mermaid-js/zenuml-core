import { describe, expect, it } from "bun:test";
import { RootContext } from "./index";
import ToCollector from "./ToCollector";
import { renderToSvg } from "../svg/renderToSvg";
import { AllMessages } from "./MessageCollector";

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

// An arrow to an empty name with no label is a dangling arrow, the same as
// `B->` (#672): the source participant stays and no message is drawn.
// Message numbers are SVG text nodes that hold only digits.
const numbers = (code: string) =>
  [...renderToSvg(code).svg.matchAll(/<text[^>]*>(\d+(?:\.\d+)*)</g)].map((m) => m[1]);
const messageCount = (code: string) => AllMessages(RootContext(code)).length;

describe("an arrow to an empty name without a label draws no message", () => {
  it.each([
    ['A.a()\nB->""', ["1"]],
    ['A.a()\nA.b()\nB->""', ["1", "2"]],
    ['A.a()\nB->"":', ["1"]],
    ["A.a()\nB->", ["1"]],
  ])("%s", (code, expected) => {
    expect(numbers(code)).toEqual(expected);
  });

  it("keeps the source participant, like B->", () => {
    expect(names('A.a()\nB->""')).toEqual(names("A.a()\nB->"));
    expect(names('A.a()\nB->""')).toContain("B");
  });

  it("collects the same messages as B->", () => {
    expect(messageCount('A.a()\nB->""')).toBe(messageCount("A.a()\nB->"));
  });

  it("drops it in a nested block too", () => {
    // "1" is the number of the if fragment itself.
    expect(numbers('if(x) {\n  A.a()\n  B->""\n}').sort()).toEqual([
      "1",
      "1.1",
    ]);
    expect(numbers('A.b() {\n  A.a()\n  B->""\n}').sort()).toEqual([
      "1",
      "1.1",
    ]);
  });

  it.each([
    ['A.a()\nB->"": x', ["1", "2"]],
    ['A.a()\nB->"".m()', ["1", "2"]],
    ["A.a()\nB->C: x", ["1", "2"]],
    ['A.a()\nB->"C D": x', ["1", "2"]],
  ])("still draws a message for %s", (code, expected) => {
    expect(numbers(code)).toEqual(expected);
  });
});

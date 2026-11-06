import { describe, it, expect } from "bun:test";
import { RootContext, Participants, validate } from "./index";
import { renderToSvg } from "@/svg/renderToSvg";

// Issue #672, the examples that need a token-level repair: `@return x`,
// `A.b: x` and a bare `@return` before a closing brace.

function statements(code: string): any[] {
  return RootContext(code).block?.()?.stat?.() ?? [];
}

function participantNames(code: string): string[] {
  return Participants(RootContext(code)).Names();
}

function svgTexts(code: string): string[] {
  const { svg } = renderToSvg(code);
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
}

function numbers(code: string): string[] {
  const { svg } = renderToSvg(code);
  return [
    ...svg.matchAll(/<text[^>]*class="seq-number"[^>]*>([^<]*)<\/text>/g),
  ].map((m) => m[1]);
}

describe("`@return x` is not a return, and `x` is not a self-call (#672)", () => {
  it("leaves the next message as number 1", () => {
    const code = "@return x\nA.c()";
    expect(statements(code)).toHaveLength(1);
    expect(numbers(code)).toEqual(["1"]);
    expect(svgTexts(code)).toEqual(svgTexts("A.c()"));
    expect(participantNames(code)).toEqual(["A"]);
  });

  it.each(["@return x y", "@Reply x", "@return x\n", "@return x"])(
    "%j draws nothing",
    (code) => {
      expect(statements(code)).toHaveLength(0);
      expect(numbers(code)).toEqual([]);
    },
  );

  it("drops it inside a block as well", () => {
    expect(numbers("A.m() {\n  @return x\n  B.n()\n}")).toEqual(
      numbers("A.m() {\n  B.n()\n}"),
    );
    expect(svgTexts("A.m() {\n  @return x\n  B.n()\n}")).toEqual(
      svgTexts("A.m() {\n  B.n()\n}"),
    );
  });

  it("keeps the valid forms of `@return`", () => {
    expect(numbers("A.m() {\n  @return B->A: ok\n}")).toEqual(["1", "1.1"]);
    expect(numbers("A.m() {\n  @return B: ok\n}")).toEqual(["1", "1.1"]);
    expect(svgTexts("A.m() {\n  @return B->A: ok\n}")).toContain("ok");
    // `@return` and its message may be on two lines.
    expect(numbers("A.m() {\n  @return\n  B->A: ok\n}")).toEqual(["1", "1.1"]);
  });
});

describe("`A.b: x` is one message, `A->b: x` (#672)", () => {
  it("is read as an async message from A to b", () => {
    expect(statements("A.b: x")).toHaveLength(1);
    expect(numbers("A.b: x")).toEqual(["1"]);
    expect(participantNames("A.b: x")).toEqual(["A", "b"]);
    expect(renderToSvg("A.b: x").svg).toEqual(renderToSvg("A->b: x").svg);
  });

  it("stays a valid document", () => {
    expect(validate("A.b: x").pass).toBe(true);
  });

  it.each([
    ["X->Y: m\nA.b: x", "X->Y: m\nA->b: x"],
    ["A.b: x\nB.c: y", "A->b: x\nB->c: y"],
    ["== d ==\nA.b: x", "== d ==\nA->b: x"],
    ["A.b:", "A->b:"],
    ['"A B".b: x', '"A B"->b: x'],
    ["X\nA.b: x", "X\nA->b: x"],
  ])("reads %j like %j", (code, arrow) => {
    expect(renderToSvg(code).svg).toEqual(renderToSvg(arrow).svg);
  });

  it("reads it the same way inside a block and after a statement", () => {
    expect(renderToSvg("A.m() {\n  C.b: x\n}").svg).toEqual(
      renderToSvg("A.m() {\n  C->b: x\n}").svg,
    );
    expect(renderToSvg("A.n()\nC.b: x").svg).toEqual(
      renderToSvg("A.n()\nC->b: x").svg,
    );
  });

  it("changes nothing outside that shape", () => {
    // Two lines: `A.` is still the half-typed call of #671.
    expect(statements("A.\nb: x")).toHaveLength(2);
    // A longer chain has no `->` reading.
    expect(statements("A.b.c: x")).toHaveLength(3);
    expect(statements("r = A.b: x")).toHaveLength(2);
    expect(statements("[rocket] A.b: x")).toHaveLength(2);
    expect(statements("A.b(x)")).toHaveLength(1);
    expect(svgTexts("A.b(x)")).toContain("b(x)");
    expect(participantNames("A.b(x)")).toEqual(["A"]);
    expect(statements("A->B: x")).toHaveLength(1);
    expect(statements("r = A.m()")).toHaveLength(1);
    expect(numbers("r = A.m()")).toEqual(["1", "1.1"]);
  });
});

describe("a bare `@return` before `}` keeps the brace (#672)", () => {
  it.each([
    ["A.m() {\n  @return\n}\nB.c()", "A.m() {\n}\nB.c()"],
    ["A.m() {\n  B.n()\n  @return\n}\nB.c()", "A.m() {\n  B.n()\n}\nB.c()"],
    ["if(x) {\n  @return\n}\nB.c()", "if(x) {\n}\nB.c()"],
    ["if(x) {\n  @return\n} else {\n  B.n()\n}", "if(x) {\n} else {\n  B.n()\n}"],
    [
      "A.m() {\n  while(y) {\n    @return\n  }\n  B.n()\n}",
      "A.m() {\n  while(y) {\n  }\n  B.n()\n}",
    ],
    ["A.m() {\n  @return\n}", "A.m() {\n}"],
  ])("%j renders like %j", (code, empty) => {
    expect(svgTexts(code)).toEqual(svgTexts(empty));
    expect(numbers(code)).toEqual(numbers(empty));
  });

  it("makes no Section and no extra statement", () => {
    const code = "A.m() {\n  @return\n}\nB.c()";
    expect(statements(code)).toHaveLength(2);
    expect(statements(code).every((s: any) => !s.section?.())).toBe(true);
  });

  it("keeps a `@return` that has a message", () => {
    expect(numbers("A.m() {\n  @return B->A: ok\n}\nB.c()").sort()).toEqual([
      "1",
      "1.1",
      "2",
    ]);
  });
});

import { describe, it, expect } from "bun:test";
import { RootContext } from "./index";
import { renderToSvg } from "@/svg/renderToSvg";

// Issue #672: a dangling `->`, `=`, `@return` or unclosed `"` must not draw an
// element that the DSL does not contain.

function statements(code: string): any[] {
  return RootContext(code).block?.()?.stat?.() ?? [];
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

describe("dangling tokens draw nothing (#672)", () => {
  it.each(["A->", "A ->", "A -", "r =", "@return", "@return\n"])(
    "%j has no statement",
    (code) => {
      expect(statements(code)).toHaveLength(0);
    },
  );

  it("does not number or draw a dangling arrow", () => {
    expect(numbers("A->")).toEqual([]);
    expect(numbers("r =")).toEqual([]);
  });

  it("a dangling `@return` leaves the next message as number 1", () => {
    expect(statements("@return\nA.c()")).toHaveLength(1);
    expect(numbers("@return\nA.c()")).toEqual(["1"]);
    expect(svgTexts("@return\nA.c()")).toContain("c()");
  });

  it("drops the dangling statement inside a block as well", () => {
    const withoutDangling = "A.m() {\n  B.n()\n}";
    for (const dangling of ["B->", "r ="]) {
      const code = `A.m() {\n  B.n()\n  ${dangling}\n}`;
      expect(numbers(code)).toEqual(numbers(withoutDangling));
    }
  });
});

describe("unclosed quote is not kept in names and labels (#672)", () => {
  it("participant name has no raw quote", () => {
    const texts = svgTexts('"Bob Sm');
    expect(texts).toContain("Bob Sm");
    expect(texts.join("|")).not.toContain("&quot;");
  });

  it("method label has no raw quote", () => {
    const texts = svgTexts('A."b');
    expect(texts).toContain("b");
    expect(texts.join("|")).not.toContain("&quot;");
  });
});

describe("valid DSL close to the dangling forms is unchanged (#672)", () => {
  it("keeps complete async messages", () => {
    expect(statements("A->B: x")).toHaveLength(1);
    expect(statements("A - B")).toHaveLength(1);
    expect(statements("B: x")).toHaveLength(1);
    expect(numbers("A->B: x")).toEqual(["1"]);
  });

  it("keeps assignments with a call", () => {
    expect(statements("r = A.m()")).toHaveLength(1);
    expect(statements("r = A->B.m()")).toHaveLength(1);
    expect(numbers("r = A.m()")).toEqual(["1", "1.1"]);
  });

  it("keeps a return with a message and the plain `return`", () => {
    expect(statements("A.m() {\n  @return B->A: ok\n}")).toHaveLength(1);
    expect(numbers("A.m() {\n  @return B->A: ok\n}")).toEqual(["1", "1.1"]);
    expect(numbers("A.m() {\n  return x\n}")).toEqual(["1", "1.1"]);
    expect(statements("return")).toHaveLength(1);
  });

  it("keeps quotes that belong to the text", () => {
    expect(svgTexts('"Bob Smith"')).toContain("Bob Smith");
    expect(svgTexts('A->B: "hello')).toContain("&quot;hello");
  });
});

import { describe, it, expect } from "bun:test";
import { RootContext, parse } from "./index";
import { renderToSvg } from "@/svg/renderToSvg";
import sequenceParser from "../generated-parser/sequenceParser";

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

describe("a lone quote is not stripped to an empty name (#672)", () => {
  // Stripping would give an empty participant name, which throws
  // "Participant name is required" and replaces the whole diagram.
  it.each(['A->"', '"', 'A."', '@Starter("', 'r = "', 'A.a()\nB->"'])(
    "%j renders without throwing",
    (code) => {
      expect(() => renderToSvg(code)).not.toThrow();
    },
  );

  it("keeps the quote as the name when nothing follows it", () => {
    expect(svgTexts('A->"')).toContain("&quot;");
    expect(svgTexts('A.a()\nB->"')).toContain("&quot;");
  });

  it("an unclosed string that holds more text loses only its opening quote", () => {
    // `".m()` is one unclosed string, so the participant is `.m()`.
    expect(svgTexts('".m()')).toContain(".m()");
  });
});

describe("dangling statements are dropped at any depth (#672)", () => {
  it.each([
    ["if(x) {\n  A->\n}", "if(x) {\n}"],
    ["A.b() {\n  r =\n}", "A.b() {\n}"],
    ["if(x) {\n  while(y) {\n    A->\n  }\n}", "if(x) {\n  while(y) {\n  }\n}"],
  ])("%j renders like %j", (code, empty) => {
    expect(numbers(code)).toEqual(numbers(empty));
    expect(svgTexts(code)).toEqual(svgTexts(empty));
  });

  it("parse() returns the same pruned tree", () => {
    const block = parse("if(x) {\n  A->\n}").rootContext.block();
    const ifBlock = block.stat()[0].alt().ifBlock();
    expect(ifBlock.braceBlock().block().stat()).toHaveLength(0);
    const call = parse("A.b() {\n  r =\n}").rootContext.block().stat()[0];
    expect(call.message().braceBlock().block().stat()).toHaveLength(0);
  });

  it("two bare `@return` lines leave nothing", () => {
    expect(statements("@return\n@return")).toHaveLength(0);
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

describe("pruning survives minified class names (#672)", () => {
  // A production bundle renames the generated classes, so the prune must not
  // look at `constructor.name`.
  const classes: any[] = [
    sequenceParser.BlockContext,
    sequenceParser.StatContext,
  ];
  const original = classes.map((c) => c.name);

  function minify() {
    classes.forEach((c, i) =>
      Object.defineProperty(c, "name", { value: `m${i}`, configurable: true }),
    );
  }
  function restore() {
    classes.forEach((c, i) =>
      Object.defineProperty(c, "name", {
        value: original[i],
        configurable: true,
      }),
    );
  }

  it.each(["A->", "r =", "@return", "if(x) {\n  A->\n}", "A.b() {\n  r =\n}"])(
    "%j is still dropped",
    (code) => {
      minify();
      try {
        // RootContext caches by text; a comment line keeps this parse fresh.
        const fresh = `// minified\n${code}`;
        const empty = code.includes("{")
          ? code.replace(/\n {2}[^\n]*\n/, "\n")
          : "";
        expect(numbers(fresh)).toEqual(empty ? numbers(empty) : []);
        if (!code.includes("{")) expect(statements(fresh)).toHaveLength(0);
      } finally {
        restore();
      }
    },
  );
});

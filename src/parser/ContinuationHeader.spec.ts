import { describe, expect, it } from "vitest";
import { renderToSvg } from "@/svg/renderToSvg";

// Issue #714: while `} else`, `} else if(y` or `} catch` is still being typed
// inside a block, its `{` is missing but the branch's `}` is already there.
// That `}` must close the new branch, not the enclosing block.

/** `label caller>callee` of every message, in document order. */
function calls(code: string): string[] {
  const g = renderToSvg(code).geometry!;
  const who = (x: number) =>
    g.lifelines.reduce((b, l) =>
      Math.abs(l.x - x) < Math.abs(b.x - x) ? l : b,
    ).participantName;
  return g.messages.map((m) => `${m.label} ${who(m.fromX)}>${who(m.toX)}`);
}

const wrap = (header: string) =>
  `A.m() {\n  if(x) {\n    B.a()\n  ${header}\n    B.b()\n  }\n  B.c()\n}\nB.d()`;

describe("an unfinished continuation header keeps later statements in their block (#714)", () => {
  const complete = calls(wrap("} else {"));

  it("control: the complete else keeps c() inside m()", () => {
    expect(complete).toContain("c() A>B");
  });

  it.each(["} else", "} else ", "} else if(y", "} else if(y)"])(
    "%j draws the same calls as the complete header",
    (header) => {
      expect(calls(wrap(header))).toEqual(complete);
    },
  );

  it("`} catch` keeps c() inside m()", () => {
    const code =
      "A.m() {\n  try {\n    B.a()\n  } catch\n    B.b()\n  }\n  B.c()\n}";
    expect(calls(code)).toContain("c() A>B");
  });

  it("`} finally` keeps c() inside m()", () => {
    const code =
      "A.m() {\n  try {\n    B.a()\n  } finally\n    B.b()\n  }\n  B.c()\n}";
    expect(calls(code)).toContain("c() A>B");
  });

  it("puts the branch body in the new else section", () => {
    const g = renderToSvg(wrap("} else")).geometry!;
    expect(g.fragments).toHaveLength(1);
    expect(g.fragments[0].sections.length).toBe(2);
  });
});

describe("balanced documents keep the #670 recovery", () => {
  it("a fresh `try` before statements takes none of them", () => {
    expect(calls("A.a()\ntry\nA.b()\nA.c()")).toEqual([
      "a() _STARTER_>A",
      "b() _STARTER_>A",
      "c() _STARTER_>A",
    ]);
  });

  it("a stray `}` before a header does not open a block for it", () => {
    expect(calls("A.a()\n}\ntry\nA.b()\nA.c()")).toEqual([
      "a() _STARTER_>A",
      "b() _STARTER_>A",
      "c() _STARTER_>A",
    ]);
  });

  it("a trailing `else` in a balanced document stays a bare else", () => {
    expect(calls("if(x) {\n  A.a()\n} else\nA.b()")).toEqual([
      "a() _STARTER_>A",
      "b() _STARTER_>A",
    ]);
  });
});

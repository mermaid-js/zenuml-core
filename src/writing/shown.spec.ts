import { describe, expect, it } from "vitest";
import { RootContext } from "@/parser";
import { lostElements, shownOf } from "./shown";

const shown = (code: string) => shownOf(RootContext(code));

describe("shownOf", () => {
  it("lists the participant names the diagram draws", () => {
    expect([...shown("A.m()\nB.n()").names]).toEqual(
      expect.arrayContaining(["A", "B"]),
    );
  });

  it("holds plain data, not parse contexts", () => {
    // A ZenUml instance holds this; hosts serialize the instance that
    // `render()` resolves with (Playwright's page.evaluate does).
    const plain = shownOf(RootContext("A.m() {\n  if(x) {\n    B.n()\n  }\n}"));
    expect(() => JSON.stringify(plain.statements)).not.toThrow();
    expect(JSON.stringify(plain.statements)).not.toContain("ctx");
  });

  it("is empty for no diagram", () => {
    expect(shownOf(null).names.size).toBe(0);
  });
});

describe("lostElements: what a frame would remove from the screen", () => {
  it("counts a statement and a participant that disappear", () => {
    expect(lostElements(shown("A.m()\nB.n()"), shown("A.m()"))).toBe(2);
  });

  it("is zero when the frame only adds", () => {
    expect(lostElements(shown("A.m()"), shown("A.m()\nB.n()"))).toBe(0);
  });

  it("is zero when a label is edited in place", () => {
    expect(lostElements(shown("A.m()"), shown("A.mm()"))).toBe(0);
  });

  it("counts a statement lost inside a fragment", () => {
    expect(
      lostElements(
        shown("if(x) {\n  A.m()\n  A.n()\n}"),
        shown("if(x) {\n  A.m()\n}"),
      ),
    ).toBe(1);
  });
});

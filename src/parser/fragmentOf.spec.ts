import { describe, expect, it } from "vitest";
import { RootContext } from "./index";
import { fragmentOf } from "./fragmentOf";
import type { StatNode } from "./AntlrTypes";

function firstStat(code: string): StatNode {
  const root = RootContext(code);
  const stat = root?.block?.()?.stat?.()?.[0];
  if (!stat) throw new Error("no statement parsed");
  return stat as StatNode;
}

describe("fragmentOf", () => {
  it.each(["loop", "opt", "par", "critical", "section"] as const)(
    "classifies %s as a single-block fragment",
    (kind) => {
      const view = fragmentOf(firstStat(`${kind}(x) {\n  A.m\n}`));
      expect(view?.kind).toBe(kind);
      expect(view?.context).toBeTruthy();
      expect(view?.sections).toHaveLength(1);
      expect(view?.sections[0].isLeading).toBe(true);
      expect(view?.sections[0].block?.stat?.()).toHaveLength(1);
    },
  );

  it("reads the condition and the while keyword of a loop", () => {
    const view = fragmentOf(firstStat("while(x > 1) {\n  A.m\n}"));
    expect(view?.kind).toBe("loop");
    expect(view?.sections[0].guardKeyword).toBe("while");
    expect(view?.sections[0].condition).toBe("x > 1");
  });

  it("enumerates if / else if / else sections of alt", () => {
    const view = fragmentOf(
      firstStat(
        "if (a) {\n  A.one\n} else if (b) {\n  A.two\n} else if (c) {\n  A.three\n} else {\n  A.four\n}",
      ),
    );
    expect(view?.kind).toBe("alt");
    expect(view?.sections.map((s) => s.guardKeyword)).toEqual([
      "if",
      "else if",
      "else if",
      "else",
    ]);
    expect(view?.sections.map((s) => s.condition)).toEqual([
      "a",
      "b",
      "c",
      undefined,
    ]);
    expect(view?.sections.map((s) => s.isLeading)).toEqual([
      true,
      false,
      false,
      false,
    ]);
    expect(view?.sections.every((s) => s.block?.stat?.()?.length === 1)).toBe(
      true,
    );
  });

  it("enumerates try / catch / finally sections of tcf", () => {
    const view = fragmentOf(
      firstStat(
        "try {\n  A.one\n} catch (e) {\n  A.two\n} finally {\n  A.three\n}",
      ),
    );
    expect(view?.kind).toBe("tcf");
    expect(view?.sections.map((s) => s.guardKeyword)).toEqual([
      "try",
      "catch",
      "finally",
    ]);
    expect(view?.sections[1].condition).toBe("e");
    expect(view?.sections.map((s) => s.isLeading)).toEqual([
      true,
      false,
      false,
    ]);
    expect(view?.sections.every((s) => !!s.block)).toBe(true);
  });

  it("classifies ref with no sections", () => {
    const view = fragmentOf(firstStat('ref(A, B, "Some reference")'));
    expect(view?.kind).toBe("ref");
    expect(view?.sections).toEqual([]);
  });

  it.each(["A.m", "A -> B: hi", "new A()", "return x"])(
    "returns null for non-fragment statement %s",
    (code) => {
      expect(fragmentOf(firstStat(code))).toBeNull();
    },
  );
});

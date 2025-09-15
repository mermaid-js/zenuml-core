import { describe, it, expect } from "bun:test";
import { StatContextFixture } from "@/parser/ContextsFixture";
import { labelRangeOfCondition } from "@/parser/helpers";

function sliceInclusive(code: string, start: number, stop: number) {
  if (start < 0 || stop < 0) return "";
  return code.substring(start, stop + 1);
}

describe("labelRangeOfCondition", () => {
  it("if(x==y){...} -> selects 'x==y'", () => {
    const code = "if(x==y){a()}";
    const stat = StatContextFixture(code);
    const alt = stat.alt();
    const ifBlock = alt.ifBlock();
    const [start, stop] = labelRangeOfCondition(ifBlock);
    expect(sliceInclusive(code, start, stop)).toBe("x==y");
  });

  it("loop(condition) -> selects condition text", () => {
    const code = "loop(x>0){a()}";
    const stat = StatContextFixture(code);
    const loop = stat.loop();
    const [start, stop] = labelRangeOfCondition(loop);
    expect(sliceInclusive(code, start, stop)).toBe("x>0");
  });

  it("invalid condition -> returns null", () => {
    const code = "if(){a()}"; // missing condition, will recover
    const stat = StatContextFixture(code);
    const alt = stat.alt();
    const cond = alt.ifBlock()?.parExpr()?.condition();
    expect(cond == null).toBeTrue();
    const range = labelRangeOfCondition(cond);
    expect(range).toBeNull();
  });
});

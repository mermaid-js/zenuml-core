import { describe, it, expect } from "bun:test";
import { StatContextFixture } from "@/parser/ContextsFixture";
import { labelRangeOfRef } from "@/parser/helpers";

function sliceInclusive(code: string, start: number, stop: number) {
  if (start < 0 || stop < 0) return "";
  return code.substring(start, stop + 1);
}

describe("labelRangeOfRef", () => {
  it("ref(a) -> selects 'a'", () => {
    const code = "ref(a)";
    const stat = StatContextFixture(code);
    const refCtx = stat.ref();
    const [start, stop] = labelRangeOfRef(refCtx);
    expect(sliceInclusive(code, start, stop)).toBe("a");
  });

  it("ref(a,b,c) -> selects first name 'a'", () => {
    const code = "ref(a,b,c)";
    const stat = StatContextFixture(code);
    const refCtx = stat.ref();
    const [start, stop] = labelRangeOfRef(refCtx);
    expect(sliceInclusive(code, start, stop)).toBe("a");
  });

  it("ref() -> returns null under error recovery", () => {
    const code = "ref()";
    const stat = StatContextFixture(code);
    const refCtx = stat.ref();
    const range = labelRangeOfRef(refCtx);
    expect(range).toBeNull();
  });
});

import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { labelRangeOfRef } from "@/parser/RefContext";

function findRef(node: any): any {
  if (!node) return null;
  if (typeof node.ref === "function") {
    const r = node.ref();
    if (r) return r;
  }
  const count = node.getChildCount ? node.getChildCount() : 0;
  for (let i = 0; i < count; i++) {
    const found = findRef(node.getChild(i));
    if (found) return found;
  }
  return null;
}

function refOf(code: string): any {
  return findRef(RootContext(code));
}

describe("RefContext.Content / labelRangeOfRef", () => {
  it("returns the first name as content for ref(a)", () => {
    const ref = refOf("ref(a)");
    expect(ref.Content()).toBeTruthy();
    expect(ref.Content().getFormattedText()).toBe("a");
    expect(labelRangeOfRef(ref)).toEqual([4, 4]);
  });

  it("uses the first name as the label for ref(a,b,c)", () => {
    const ref = refOf("ref(a,b,c)");
    expect(ref.Content().getFormattedText()).toBe("a");
    // The remaining names are participants, not part of the label.
    expect(ref.Participants().length).toBe(2);
    expect(labelRangeOfRef(ref)).toEqual([4, 4]);
  });

  it("handles quoted names containing whitespace", () => {
    const ref = refOf('ref("a b")');
    expect(ref.Content().getFormattedText()).toBe("a b");
    expect(labelRangeOfRef(ref)).toEqual([4, 8]);
  });

  it("returns no content and a non-editable range for empty ref()", () => {
    const ref = refOf("ref()");
    expect(ref.Content()).toBeUndefined();
    expect(labelRangeOfRef(ref)).toEqual([-1, -1]);
  });

  it("returns no content for ref(  ) with only whitespace (error recovery)", () => {
    const ref = refOf("ref(  )");
    expect(ref.Content()).toBeUndefined();
    expect(labelRangeOfRef(ref)).toEqual([-1, -1]);
  });

  it("keeps participant detection intact for ref(someId, A, B)", () => {
    const ref = refOf("ref(someId, A, B)");
    expect(ref.Content().getFormattedText()).toBe("someId");
    expect(ref.Participants().length).toBe(2);
  });
});

import { describe, it, expect } from "bun:test";
import {
  AsyncMessageContextFixture,
  CreationContextFixture,
  RetContextFixture,
  SyncMessageContextFixture,
} from "@/parser/ContextsFixture";
import { labelRangeOfMessage } from "@/parser/helpers";

function sliceInclusive(code: string, start: number, stop: number) {
  return code.substring(start, stop + 1);
}

describe("labelRangeOfMessage", () => {
  it("sync: selects the first signature segment (may include invocation)", () => {
    const code = "A.method()";
    const ctx = SyncMessageContextFixture(code);
    const [start, stop] = labelRangeOfMessage(ctx, "sync");
    // Expect to select the method identifier (not parentheses)
    const selected = sliceInclusive(code, start, stop);
    expect(selected).toBe("method()");
  });

  it("async: selects content payload including leading space after colon", () => {
    const code = "Alice->Bob: Hello World";
    const ctx = AsyncMessageContextFixture(code);
    const [start, stop] = labelRangeOfMessage(ctx, "async");
    const selected = sliceInclusive(code, start, stop);
    expect(selected).toBe(" Hello World");
  });

  it("creation: selects parameters (inside parentheses only)", () => {
    const code = "new A(x, y)";
    const ctx = CreationContextFixture(code);
    const [start, stop] = labelRangeOfMessage(ctx, "creation");
    const selected = sliceInclusive(code, start, stop);
    expect(selected).toBe("x, y");
  });

  it("return (expr): selects returned expression", () => {
    const code = "return 12345;";
    const ret = RetContextFixture(code);
    const exprCtx = ret.expr();
    const [start, stop] = labelRangeOfMessage(exprCtx, "return");
    const selected = sliceInclusive(code, start, stop);
    expect(selected).toBe("12345");
  });

  it("return (async): selects async payload including leading space", () => {
    const code = "@return Alice->Bob: OK";
    const ret = RetContextFixture(code);
    const contentCtx = ret.asyncMessage().content();
    const [start, stop] = labelRangeOfMessage(contentCtx, "return");
    const selected = sliceInclusive(code, start, stop);
    expect(selected).toBe(" OK");
  });
});

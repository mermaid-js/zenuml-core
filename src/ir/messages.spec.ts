import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { buildMessagesModel } from "@/ir/messages";

function collectIR(code: string) {
  const ctx = RootContext(code);
  return buildMessagesModel(ctx);
}

describe("buildMessagesModel", () => {
  it("sync and async and creation", () => {
    const code = `
      A.method(E.m) {
        B->C.method
      }
      new B
      C->D: message
    `;

    const ir = collectIR(code).map((m) => ({
      from: m.from,
      to: m.to,
      signature: m.signature,
      type: m.type,
    }));
    expect(ir).toStrictEqual([
      { from: undefined, signature: "method(E.m)", to: "A", type: 0 },
      { from: "B", signature: "method", to: "C", type: 0 },
      { from: undefined, signature: "«create»", to: "B", type: 2 },
      { from: "C", signature: " message", to: "D", type: 1 },
    ]);
  });

  it("return variants", () => {
    const code = `
      return result
      @return A->B:m
    `;
    const ir = collectIR(code).map((m) => ({
      from: m.from,
      to: m.to,
      signature: m.signature,
      type: m.type,
    }));
    expect(ir).toStrictEqual([
      { from: undefined, signature: "result", to: undefined, type: 3 },
      { from: "A", signature: "m", to: "B", type: 1 },
    ]);
  });
});

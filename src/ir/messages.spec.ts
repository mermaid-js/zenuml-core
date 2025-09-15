import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { AllMessages } from "@/parser/MessageCollector";
import { buildMessagesModel } from "@/ir/messages";

function collectIR(code: string) {
  const ctx = RootContext(code);
  return buildMessagesModel(ctx);
}

function collectLegacy(code: string) {
  const ctx = RootContext(code);
  return ctx ? AllMessages(ctx) : [];
}

describe("buildMessagesModel parity", () => {
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
    const legacy = collectLegacy(code);
    expect(ir).toStrictEqual(legacy);
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
    const legacy = collectLegacy(code);
    expect(ir).toStrictEqual(legacy);
  });
});


import antlr4 from "antlr4";
import { MessageCollector } from "@/parser/MessageCollector";
import { RootContext } from "@/parser";

describe("MessageCollector", () => {
  let messageCollector: MessageCollector;
  let walker: typeof antlr4.tree.ParseTreeWalker.DEFAULT;

  // Helper function to parse code and collect messages
  const collectMessages = (code: string) => {
    const rootContext = RootContext(code);
    walker = antlr4.tree.ParseTreeWalker.DEFAULT;
    messageCollector = new MessageCollector();
    // @ts-ignore
    walker.walk(messageCollector, rootContext);
    return messageCollector.result();
  };

  describe("message collection", () => {
    it("should collect messages with starter annotation", () => {
      const code = `A
@Starter("B")
A.mA {
  self() {
    C.mB()
  }
}`;

      expect(collectMessages(code)).toStrictEqual([
        {
          from: "B",
          signature: "mA",
          to: "A",
          type: 0,
        },
        {
          from: "A",
          signature: "self()",
          to: "A",
          type: 0,
        },
        {
          from: "A",
          signature: "mB()",
          to: "C",
          type: 0,
        },
      ]);
    });

    it("should handle different message types and object creation", () => {
      const code = `
      A.method(E.m) {
        B->C.method
      }
      new B
      C->D: message
      `;

      expect(collectMessages(code)).toStrictEqual([
        {
          from: undefined,
          signature: "method(E.m)",
          to: "A",
          type: 0,
        },
        {
          from: "B",
          signature: "method",
          to: "C",
          type: 0,
        },
        {
          from: undefined,
          signature: "«create»",
          to: "B",
          type: 2,
        },
        {
          from: "C",
          signature: " message",
          to: "D",
          type: 1,
        },
      ]);
    });
  });

  describe("expression handling", () => {
    it("should ignore expressions in method parameters", () => {
      const code = `A.m(new B, C.m)`;

      expect(collectMessages(code)).toStrictEqual([
        {
          from: undefined,
          signature: "m(new B,C.m)",
          to: "A",
          type: 0,
        },
      ]);
    });

    it("should ignore expressions in conditional statements", () => {
      const code = `if(A.isGood()) {B.m}`;

      expect(collectMessages(code)).toStrictEqual([
        {
          from: undefined,
          signature: "m",
          to: "B",
          type: 0,
        },
      ]);
    });
  });
});

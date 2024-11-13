import antlr4 from "antlr4";
import { MessageContextListener } from "./MessageContextListener";
import { RootContext } from "@/parser/index";
import { OwnableMessageType } from "@/parser/OwnableMessage";

describe("MessageContextListener", () => {
  // Helper function to parse code and get results
  const parseCode = (code: string) => {
    const rootContext = RootContext(code);
    const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
    const listener = new MessageContextListener();
    walker.walk(listener, rootContext);
    return listener.result();
  };

  describe("message parsing", () => {
    it("parses various message types and creation statements", () => {
      const code = `
      res = A.method(E.m) {
        B->C.method
      }
      var = res
      new B
      C->D: message
      `;

      expect(parseCode(code)).toStrictEqual([
        {
          from: "_STARTER_",
          label: "method(E.m)",
          signature: "method(E.m)",
          to: "A",
          type: OwnableMessageType.SyncMessage,
        },
        {
          from: "B",
          label: "method",
          signature: "method",
          to: "C",
          type: OwnableMessageType.SyncMessage,
        },
        {
          from: "_STARTER_",
          label: "var=res",
          signature: "res",
          to: "_STARTER_",
          type: OwnableMessageType.SyncMessage,
        },
        {
          from: "_STARTER_",
          label: "«create»",
          signature: "«create»",
          to: "B",
          type: OwnableMessageType.CreationMessage,
        },
        {
          from: "C",
          label: " message",
          signature: " message",
          to: "D",
          type: OwnableMessageType.AsyncMessage,
        },
      ]);
    });

    it("handles parameter expressions without creating additional messages", () => {
      const code = `A.m(new B, C.m)`;

      expect(parseCode(code)).toStrictEqual([
        {
          from: "_STARTER_",
          signature: "m(new B,C.m)",
          label: "m(new B,C.m)",
          to: "A",
          type: 0,
        },
      ]);
    });

    it("parses messages in conditional blocks while ignoring condition expressions", () => {
      const code = `if(A.isGood()) {B.m}`;

      expect(parseCode(code)).toStrictEqual([
        {
          from: "_STARTER_",
          signature: "m",
          label: "m",
          to: "B",
          type: 0,
        },
      ]);
    });
  });
});

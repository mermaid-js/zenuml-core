import antlr4 from "antlr4";
import { MessageCollector } from "@/parser/MessageCollector";
import { RootContext } from "@/parser";

describe("MessageListener", () => {
  it("with starter", () => {
    const code = `A
@Starter("B")
A.mA {
   self() {
    C.mB()
  }
}`;
    const rootContext = RootContext(code);
    const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

    const messageContextListener = new MessageCollector();
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
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

  it("can handle Message and Creation", () => {
    const code = `
    A.method(E.m) {
      B->C.method
    }
    new B
    C->D: message
    `;
    const rootContext = RootContext(code);
    const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

    const messageContextListener = new MessageCollector();
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
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

  it("ignores expression in parameters", () => {
    const code = `A.m(new B,
     C.m)`;
    const rootContext = RootContext(code);
    const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

    const messageContextListener = new MessageCollector();
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
      {
        from: undefined,
        signature: "m(new B,C.m)",
        to: "A",
        type: 0,
      },
    ]);
  });

  it("ignores expression in conditions", () => {
    const code = `if(A.isGood()) {B.m}`;
    const rootContext = RootContext(code);
    const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

    const messageContextListener = new MessageCollector();
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
      {
        from: undefined,
        signature: "m",
        to: "B",
        type: 0,
      },
    ]);
  });
});
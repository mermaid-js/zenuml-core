import antlr4 from "antlr4";
import { MessageContextListener } from "../../../src/parser/MessageContextListener";
import { RootContext } from "../../../src/parser/index";

describe("MessageListener", () => {
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

    const messageContextListener = new MessageContextListener();
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

    const messageContextListener = new MessageContextListener();
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

    const messageContextListener = new MessageContextListener();
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

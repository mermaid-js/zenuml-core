import antlr4 from "antlr4";
import { MessageContextListener } from "./MessageContextListener";
import { RootContext } from "@/parser";

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
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
      {
        from: "_STARTER_",
        label: "method(E.m)",
        signature: "method(E.m)",
        to: "A",
        type: 0,
      },
      {
        from: "B",
        label: "method",
        signature: "method",
        to: "C",
        type: 0,
      },
      {
        from: "_STARTER_",
        label: "«create»",
        signature: "«create»",
        to: "B",
        type: 2,
      },
      {
        from: "C",
        label: " message",
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
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
      {
        from: "_STARTER_",
        signature: "m(new B,C.m)",
        label: "m(new B,C.m)",
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
    // @ts-ignore
    walker.walk(messageContextListener, rootContext);

    expect(messageContextListener.result()).toStrictEqual([
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

import { describe, it, expect } from "bun:test";
import { VerticalCoordinates } from "./VerticalCoordinates";
import { RootContext } from "@/parser/index";
import { createStatementKey } from "./vertical/StatementIdentifier";

describe("VerticalCoordinates", () => {
  it.each(["if", "loop", "opt"])("reserves the 28px padded guard row in %s fragments", (kind) => {
    const root = RootContext(`${kind}(check) {\n A->B:work\n}`)!;
    const stat = root.block().stat()[0];
    const fragment = kind === "if" ? stat.alt().ifBlock() : stat[kind]();
    const child = fragment.braceBlock().block().stat()[0];
    const positions = new VerticalCoordinates(root);
    const outer = positions.getStatementCoordinate(createStatementKey(stat)!);
    const inner = positions.getStatementCoordinate(createStatementKey(child)!);
    // Border1 + title25 + guard28 + statement margin16.
    expect(inner!.top - outer!.top).toBe(70);
  });
  it("should not throw on sync message with nested block", () => {
    const rootContext = RootContext("A.a(){B.b()}");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  it("should not throw on creation with nested block", () => {
    const rootContext = RootContext("A=new A(){ B.c() }");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  it("should not throw on simple sync message", () => {
    const rootContext = RootContext("A.method()");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  it("should not throw on fragment (alt)", () => {
    const rootContext = RootContext("if(x) { A.a() } else { B.b() }");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  it("should not throw on try-catch-finally", () => {
    const rootContext = RootContext(
      "try { A.a() } catch(e) { B.b() } finally { C.c() }",
    );
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  it("should not throw on creation with assignment", () => {
    const rootContext = RootContext("A=new A()");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  describe("public API", () => {
    it("getTotalHeight() returns a positive number", () => {
      const rootContext = RootContext("A.method()");
      const vc = new VerticalCoordinates(rootContext);
      expect(vc.getTotalHeight()).toBeGreaterThan(0);
    });

    it("getStatementCoordinate() returns undefined for unknown key", () => {
      const rootContext = RootContext("A.method()");
      const vc = new VerticalCoordinates(rootContext);
      expect(vc.getStatementCoordinate("nonexistent")).toBeUndefined();
    });
  });
});

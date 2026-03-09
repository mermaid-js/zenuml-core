import { describe, it, expect } from "bun:test";
import { VerticalCoordinates } from "./VerticalCoordinates";
import { RootContext } from "@/parser/index";

describe("VerticalCoordinates", () => {
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
    const rootContext = RootContext("try { A.a() } catch(e) { B.b() } finally { C.c() }");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  it("should not throw on creation with assignment", () => {
    const rootContext = RootContext("A=new A()");
    expect(() => new VerticalCoordinates(rootContext)).not.toThrow();
  });

  describe("public API", () => {
    it("entries() returns statement coordinates", () => {
      const rootContext = RootContext("A.method()");
      const vc = new VerticalCoordinates(rootContext);
      const entries = vc.entries();
      expect(entries.length).toBeGreaterThan(0);
      for (const [key, coord] of entries) {
        expect(typeof key).toBe("string");
        expect(typeof coord.top).toBe("number");
        expect(typeof coord.height).toBe("number");
        expect(typeof coord.kind).toBe("string");
      }
    });

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

    it("entries() are stable across calls", () => {
      const rootContext = RootContext("A.a()\nB.b()");
      const vc = new VerticalCoordinates(rootContext);
      const first = vc.entries();
      const second = vc.entries();
      expect(first).toEqual(second);
    });

    it("entries() returns a new snapshot each call (caller mutations don't affect internals)", () => {
      const rootContext = RootContext("A.method()");
      const vc = new VerticalCoordinates(rootContext);
      const first = vc.entries();
      first.length = 0; // mutate the returned array
      const second = vc.entries();
      expect(second.length).toBeGreaterThan(0);
    });

    it("getTotalHeight() matches layout return value", () => {
      const rootContext = RootContext("A.a(){B.b()}");
      const vc = new VerticalCoordinates(rootContext);
      const entries = vc.entries();
      const maxBottom = Math.max(...entries.map(([, c]) => c.top + c.height));
      // totalHeight comes from layout() which includes trailing margin
      expect(vc.getTotalHeight()).toBeGreaterThanOrEqual(maxBottom);
    });
  });
});

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
});

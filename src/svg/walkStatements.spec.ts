import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { walkStatements } from "./walkStatements";

function spuriousLoops(dsl: string): number {
  const root = RootContext(dsl) as any;
  return walkStatements(root).filter(
    (s) => s.kind === "fragment" && s.fragmentKind === "loop" && s.label === "",
  ).length;
}

describe("walkStatements — stray icon tokens do not create spurious Loop fragments (#367)", () => {
  it("icon-only if-condition: if([check]) { A.m() }", () => {
    expect(spuriousLoops("if([check]) {\n  A.m()\n}")).toBe(0);
  });

  it("icon + participant in if-condition with icon body: if([check] a) { [rocket] }", () => {
    expect(spuriousLoops("if([check] a) {\n  [rocket]\n}")).toBe(0);
  });

  it("icon participant with icon method: [rocket]A.[]method() {}", () => {
    expect(spuriousLoops("[rocket]A.[]method() {}")).toBe(0);
  });

  it("still emits a real Loop fragment for a genuine while/loop", () => {
    const root = RootContext("while(x) {\n  A.m()\n}") as any;
    const loops = walkStatements(root).filter(
      (s) => s.kind === "fragment" && s.fragmentKind === "loop",
    );
    expect(loops.length).toBe(1);
    expect(loops[0].label).toBe("x");
  });
});

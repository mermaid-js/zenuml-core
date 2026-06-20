import { describe, it, expect } from "bun:test";
import { RootContext } from "@/parser";
import { parseZen } from "@/parser-langium/services";

// Issue #400: PlantUML/ZenUML wrapper directives (@startuml/@enduml/
// @startzenuml/@endzenuml and `!theme …`) must be ignored as no-ops rather
// than triggering parse errors or leaking into the diagram.

function tree(code: string): string {
  const t = RootContext(code) as any;
  return t.toStringTree(null, t.parser);
}

describe("wrapper directives are ignored (#400)", () => {
  const bare = tree("A.m");

  it("@startuml/@enduml wrapper parses identically to the bare content", () => {
    expect(tree("@startuml\nA.m\n@enduml")).toBe(bare);
  });

  it("@startzenuml/@endzenuml wrapper parses identically to the bare content", () => {
    expect(tree("@startzenuml\nA.m\n@endzenuml")).toBe(bare);
  });

  it("`!theme …` directive at line start is ignored", () => {
    expect(tree("!theme plain\nA.m")).toBe(bare);
  });

  it("does not break the `!` (NOT) operator mid-line", () => {
    // `!x` must still lex as NOT x, not get swallowed by the theme directive.
    const code = "if(!x){\n A.m\n}";
    expect(() => RootContext(code)).not.toThrow();
    const r = parseZen(code) as any;
    expect(r.parserErrors).toHaveLength(0);
    // The if-condition still renders as an alt fragment with `!x`.
    expect(tree(code)).not.toBe(bare);
  });

  it("the Langium side-car parser agrees (no lexer/parser errors)", () => {
    for (const code of [
      "@startuml\nA.m\n@enduml",
      "@startzenuml\nA.m\n@endzenuml",
      "!theme plain\nA.m",
    ]) {
      const r = parseZen(code) as any;
      expect(r.lexerErrors).toHaveLength(0);
      expect(r.parserErrors).toHaveLength(0);
    }
  });
});

import { Fixture } from "../../test/unit/parser/fixture/Fixture";

describe("Emoji in identifiers", () => {
  // BMP symbols (U+0000–U+FFFF) work directly as identifiers via \p{So}
  it("should parse BMP symbol as participant name", () => {
    const stmt = Fixture.firstStatement("⭐Service.method");
    expect(stmt.message().To()).toBe("⭐Service");
  });

  it("should parse BMP symbol-only identifier", () => {
    const stmt = Fixture.firstStatement("⭐.method");
    expect(stmt.message().To()).toBe("⭐");
  });

  it("should parse BMP symbols in from->to", () => {
    const stmt = Fixture.firstStatement("✅A->⚡B.method");
    expect(stmt.message().From()).toBe("✅A");
    expect(stmt.message().To()).toBe("⚡B");
  });

  it("should parse BMP symbols in async messages", () => {
    const stmt = Fixture.firstStatement("✅A->⚡B: hello");
    expect(stmt.asyncMessage().From()).toBe("✅A");
    expect(stmt.asyncMessage().To()).toBe("⚡B");
  });

  // SMP emoji (U+10000+) like 🦄 require quoted strings due to ANTLR4 JS UTF-16 limitation
  it("should parse SMP emoji in quoted participant names", () => {
    const stmt = Fixture.firstStatement('"🦄Service".method');
    expect(stmt.message().To()).toBe("🦄Service");
  });

  it("should parse SMP emoji in quoted from->to", () => {
    const stmt = Fixture.firstStatement('"🔥A"->"🚀B".method');
    expect(stmt.message().From()).toBe("🔥A");
    expect(stmt.message().To()).toBe("🚀B");
  });
});

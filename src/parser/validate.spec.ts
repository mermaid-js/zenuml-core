import { describe, expect, it } from "vitest";
import Parser, { parse, validate } from "@/parser";

const VALID = "A.method() {\n  B.reply()\n}";
const INVALID = "A.method() {\n  @@@ ))) {{{\n";

describe("reentrant parser API: validate()", () => {
  it("passes valid ZenUML with no error details", () => {
    const result = validate(VALID);
    expect(result.pass).toBe(true);
    expect(result.errorDetails).toEqual([]);
  });

  it("fails invalid ZenUML with structured {line, column, msg} errors", () => {
    const result = validate(INVALID);
    expect(result.pass).toBe(false);
    expect(result.errorDetails.length).toBeGreaterThan(0);
    const first = result.errorDetails[0];
    expect(typeof first.line).toBe("number");
    expect(typeof first.column).toBe("number");
    expect(typeof first.msg).toBe("string");
  });

  it("is reentrant: a valid parse after an invalid one carries no stale errors", () => {
    expect(validate(INVALID).pass).toBe(false);
    const after = validate(VALID);
    expect(after.pass).toBe(true);
    expect(after.errorDetails).toEqual([]);
  });

  it("does NOT mutate the legacy module-global ErrorDetails (independent per-call state)", () => {
    Parser.ErrorDetails.length = 0;
    validate(INVALID);
    expect(Parser.ErrorDetails.length).toBe(0);
  });
});

describe("reentrant parser API: parse()", () => {
  it("returns a parse tree plus pass/errorDetails for valid input", () => {
    const result = parse(VALID);
    expect(result.pass).toBe(true);
    expect(result.errorDetails).toEqual([]);
    expect(result.rootContext).toBeTruthy();
  });

  it("returns a recovered tree and errors for invalid input", () => {
    const result = parse(INVALID);
    expect(result.pass).toBe(false);
    expect(result.errorDetails.length).toBeGreaterThan(0);
    // ANTLR error recovery still yields a tree; we expose it for callers that want it.
    expect(result.rootContext).toBeTruthy();
  });
});

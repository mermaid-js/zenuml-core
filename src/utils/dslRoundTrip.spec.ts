import { describe, expect, it, mock } from "bun:test";
import * as actual from "@/parser";
const realParse = actual.parse;
mock.module("@/parser", () => ({
  ...actual,
  parse: (code: string) => {
    if (code === "THROW-sentinel") throw new Error("parser blew up");
    return realParse(code);
  },
}));

const { DECLARATION_KEYS, parseNotWorse, safeParse, sameDeclaration, squash } =
  await import("./dslRoundTrip");

const snap = (pass: boolean, errors: number) => ({
  pass,
  errors,
  rootContext: null,
});

describe("squash", () => {
  it("removes all whitespace and treats null/undefined as empty", () => {
    expect(squash(" a \n b\tc ")).toBe("abc");
    expect(squash(undefined)).toBe("");
    expect(squash(null)).toBe("");
  });
});

describe("sameDeclaration", () => {
  it("ignores whitespace differences", () => {
    expect(sameDeclaration({ label: "My  Box" }, { label: "MyBox" })).toBe(
      true,
    );
  });
  it("detects a difference in a default key", () => {
    for (const key of DECLARATION_KEYS) {
      expect(sameDeclaration({ [key]: "x" }, { [key]: "y" })).toBe(false);
    }
  });
  it("does not compare name unless asked", () => {
    expect(sameDeclaration({ name: "A" }, { name: "B" })).toBe(true);
    expect(sameDeclaration({ name: "A" }, { name: "B" }, ["name"])).toBe(false);
  });
});

describe("safeParse", () => {
  it("returns pass, error count and root context for valid code", () => {
    const r = safeParse("A->B: hi");
    expect(r).toMatchObject({ pass: true, errors: 0 });
    expect(r?.rootContext).toBeTruthy();
  });
  it("reports errors for broken code", () => {
    const r = safeParse("A.m(");
    expect(r?.pass).toBe(false);
    expect(r!.errors).toBeGreaterThan(0);
  });
  it("returns null when the parser throws", () => {
    expect(safeParse("THROW-sentinel")).toBeNull();
  });
});

describe("parseNotWorse", () => {
  it("clean base requires a clean result", () => {
    expect(parseNotWorse(snap(true, 0), snap(true, 0))).toBe(true);
    expect(parseNotWorse(snap(true, 0), snap(false, 1))).toBe(false);
  });
  it("broken base allows equal or fewer errors only", () => {
    expect(parseNotWorse(snap(false, 2), snap(false, 2))).toBe(true);
    expect(parseNotWorse(snap(false, 2), snap(true, 0))).toBe(true);
    expect(parseNotWorse(snap(false, 2), snap(false, 3))).toBe(false);
  });
  it("unparsable base accepts only an error-free result", () => {
    expect(parseNotWorse(null, snap(true, 0))).toBe(true);
    expect(parseNotWorse(null, snap(false, 1))).toBe(false);
  });
});

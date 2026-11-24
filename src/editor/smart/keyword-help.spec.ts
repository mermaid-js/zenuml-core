import { describe, expect, test } from "bun:test";
import { keywordHelp } from "./keyword-help";
import { SNIPPETS } from "./snippets";

describe("keywordHelp", () => {
  test("every keyword snippet has hover help", () => {
    for (const s of SNIPPETS) {
      if (s.label === "message" || s.label === "alt") continue; // not keywords
      expect(keywordHelp(s.label)).toBeDefined();
    }
  });

  test("the words that continue a block have help too", () => {
    for (const word of ["else", "catch", "finally"]) {
      expect(keywordHelp(word)).toBeDefined();
    }
  });

  test("help is a short plain sentence with a one-line example", () => {
    const help = keywordHelp("loop");
    expect(help?.text.length).toBeGreaterThan(10);
    expect(help?.example).toContain("loop");
  });

  test("an ordinary name has no help", () => {
    expect(keywordHelp("Customer")).toBeUndefined();
  });
});

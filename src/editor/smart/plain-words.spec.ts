import { describe, expect, test } from "bun:test";
import { plainWords } from "./plain-words";

describe("plainWords", () => {
  test("a missing closing parenthesis", () => {
    expect(plainWords("Expecting token of type 'CPAR' but found ``.")).toBe(
      "A closing ) is missing here.",
    );
  });

  test("a missing closing brace", () => {
    expect(plainWords("Expecting token of type 'CBRACE' but found ``.")).toBe(
      "A closing } is missing. Every { needs a matching }.",
    );
  });

  test("a stray closing brace", () => {
    expect(plainWords("Expecting end of file but found `}`.")).toBe(
      "This } has no matching {. Remove it, or add the { it belongs to.",
    );
  });

  test("else without an if", () => {
    expect(plainWords("Expecting end of file but found `else`.")).toBe(
      "`else` only works right after an if { ... } block.",
    );
  });

  test("any other unexpected token", () => {
    expect(plainWords("Expecting end of file but found `?`.")).toBe(
      "I did not expect `?` here. Check the line above, or delete it.",
    );
  });

  test("an unknown token type still reads as plain words", () => {
    expect(plainWords("Expecting token of type 'WEIRD' but found ``.")).toBe(
      "Something is missing here.",
    );
  });

  test("messages that are already plain pass through", () => {
    const text = "Duplicate participant declaration: 'Alice'.";
    expect(plainWords(text)).toBe(text);
  });
});

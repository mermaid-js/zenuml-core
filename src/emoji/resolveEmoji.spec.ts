import { describe, it, expect, beforeEach } from "vitest";
import { resolveBracketContent, setKnownEmojis } from "./resolveEmoji";

beforeEach(() => {
  setKnownEmojis(["rocket", "fire", "check", "red", "eyes", "warning"]);
});

describe("resolveBracketContent", () => {
  // CSS-first resolution
  it("resolves [red] as CSS color", () => {
    const result = resolveBracketContent("red");
    expect(result.style).toEqual({ color: "red" });
    expect(result.emojis).toEqual([]);
    expect(result.classNames).toContain("red");
  });

  it("resolves [bold] as CSS font-weight", () => {
    const result = resolveBracketContent("bold");
    expect(result.style).toEqual({ fontWeight: "bold" });
    expect(result.emojis).toEqual([]);
  });

  // Emoji fallback
  it("resolves [rocket] as emoji when no CSS match", () => {
    const result = resolveBracketContent("rocket");
    expect(result.style).toEqual({});
    expect(result.emojis).toEqual(["rocket"]);
    expect(result.classNames).toContain("rocket");
  });

  // Colon override
  it("resolves [:red:] as emoji, skipping CSS", () => {
    const result = resolveBracketContent(":red:");
    expect(result.style).toEqual({});
    expect(result.emojis).toEqual(["red"]);
    expect(result.classNames).toContain("red");
  });

  it("resolves [:rocket:] as emoji", () => {
    const result = resolveBracketContent(":rocket:");
    expect(result.emojis).toEqual(["rocket"]);
    expect(result.classNames).toContain("rocket");
  });

  // Comma-separated
  it("resolves [red, bold] as multi-style", () => {
    const result = resolveBracketContent("red, bold");
    expect(result.style).toEqual({ color: "red", fontWeight: "bold" });
    expect(result.emojis).toEqual([]);
  });

  it("resolves [rocket, red] as emoji + CSS", () => {
    const result = resolveBracketContent("rocket, red");
    expect(result.emojis).toEqual(["rocket"]);
    expect(result.style).toEqual({ color: "red" });
    expect(result.classNames).toContain("rocket");
    expect(result.classNames).toContain("red");
  });

  it("resolves [rocket, fire] as two emoji", () => {
    const result = resolveBracketContent("rocket, fire");
    expect(result.emojis).toEqual(["rocket", "fire"]);
  });

  // Unknown
  it("resolves [unknown] as class only", () => {
    const result = resolveBracketContent("unknown");
    expect(result.style).toEqual({});
    expect(result.emojis).toEqual([]);
    expect(result.classNames).toContain("unknown");
  });

  // Tailwind class (hyphenated)
  it("resolves [text-red-500] as class only", () => {
    const result = resolveBracketContent("text-red-500");
    expect(result.emojis).toEqual([]);
    expect(result.classNames).toContain("text-red-500");
  });
});

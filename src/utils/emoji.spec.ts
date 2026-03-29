import { convertEmojiShortcodes } from "./emoji";

describe("convertEmojiShortcodes", () => {
  it("converts known shortcodes to emoji", () => {
    expect(convertEmojiShortcodes(":unicorn:")).toBe("🦄");
    expect(convertEmojiShortcodes(":fire:")).toBe("🔥");
    expect(convertEmojiShortcodes(":rocket:")).toBe("🚀");
    expect(convertEmojiShortcodes(":heart:")).toBe("❤️");
  });

  it("leaves unknown shortcodes as-is", () => {
    expect(convertEmojiShortcodes(":unknown_code:")).toBe(":unknown_code:");
  });

  it("converts multiple shortcodes in one string", () => {
    expect(convertEmojiShortcodes(":fire: some :rocket: text")).toBe(
      "🔥 some 🚀 text",
    );
  });

  it("handles text with no shortcodes", () => {
    expect(convertEmojiShortcodes("plain text")).toBe("plain text");
    expect(convertEmojiShortcodes("")).toBe("");
  });

  it("handles mixed emoji and text", () => {
    expect(convertEmojiShortcodes(":unicorn:OrderService")).toBe(
      "🦄OrderService",
    );
  });

  it("supports +1 and -1 shortcodes", () => {
    expect(convertEmojiShortcodes(":+1:")).toBe("👍");
    expect(convertEmojiShortcodes(":-1:")).toBe("👎");
  });
});

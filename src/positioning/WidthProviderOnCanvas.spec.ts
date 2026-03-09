import { describe, it, expect } from "bun:test";
import { WidthProviderOnCanvas } from "./WidthProviderFunc";
import { TextType } from "./Coordinate";

describe("WidthProviderOnCanvas", () => {
  it("returns a positive number for non-empty text", () => {
    const width = WidthProviderOnCanvas("Hello", TextType.ParticipantName);
    expect(width).toBeGreaterThan(0);
  });

  it("returns 0 for empty string", () => {
    const width = WidthProviderOnCanvas("", TextType.ParticipantName);
    expect(width).toBe(0);
  });

  it("returns an integer (Math.ceil applied)", () => {
    const width = WidthProviderOnCanvas("Test text", TextType.MessageContent);
    expect(Number.isInteger(width)).toBe(true);
  });

  it("wider text produces larger width", () => {
    const short = WidthProviderOnCanvas("A", TextType.ParticipantName);
    const long = WidthProviderOnCanvas("ABCDEFGHIJKLMNOP", TextType.ParticipantName);
    expect(long).toBeGreaterThan(short);
  });

  it("participant name uses larger font than message content", () => {
    const text = "SameText";
    const participant = WidthProviderOnCanvas(text, TextType.ParticipantName);
    const message = WidthProviderOnCanvas(text, TextType.MessageContent);
    // 16px font should produce wider text than 14px font
    expect(participant).toBeGreaterThanOrEqual(message);
  });

  it("handles special characters", () => {
    const width = WidthProviderOnCanvas("hello() -> world", TextType.MessageContent);
    expect(width).toBeGreaterThan(0);
  });

  it("handles unicode", () => {
    const width = WidthProviderOnCanvas("你好世界", TextType.ParticipantName);
    expect(width).toBeGreaterThan(0);
  });

  it("caches results (same input returns same output)", () => {
    const first = WidthProviderOnCanvas("cached", TextType.ParticipantName);
    const second = WidthProviderOnCanvas("cached", TextType.ParticipantName);
    expect(first).toBe(second);
  });
});

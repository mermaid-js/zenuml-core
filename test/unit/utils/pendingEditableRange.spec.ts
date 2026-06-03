import { describe, expect, it } from "vitest";
import { resolveAutoEditToken } from "@/utils/pendingEditableRange";

describe("resolveAutoEditToken", () => {
  it("returns undefined when pending is null and positions are undefined", () => {
    expect(resolveAutoEditToken(null, undefined, undefined)).toBeUndefined();
  });

  it("returns token when pending range matches", () => {
    expect(resolveAutoEditToken({ start: 1, end: 5, token: 42 }, 1, 5)).toBe(42);
  });

  it("returns undefined when range does not match", () => {
    expect(resolveAutoEditToken({ start: 1, end: 5, token: 42 }, 2, 5)).toBeUndefined();
  });
});

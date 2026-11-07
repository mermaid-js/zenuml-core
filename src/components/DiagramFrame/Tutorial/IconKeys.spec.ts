import { describe, expect, it } from "vitest";
import { hasIconFor } from "./IconKeys";
import { listIconKeys, loadIcon } from "./LazyIcons";

describe("hasIconFor", () => {
  it("is true for core and cloud icon types, in any case", () => {
    expect(hasIconFor("actor")).toBe(true);
    expect(hasIconFor("Database")).toBe(true);
    expect(hasIconFor("CloudFront")).toBe(true);
  });

  it("is false for a type without an icon, or no type", () => {
    expect(hasIconFor("Alice")).toBe(false);
    expect(hasIconFor("")).toBe(false);
    expect(hasIconFor(undefined)).toBe(false);
  });

  it("agrees with what loadIcon can load (keeps IconKeys.ts in sync)", async () => {
    for (const key of await listIconKeys()) {
      expect(hasIconFor(key), key).toBe(true);
      expect(await loadIcon(key), key).not.toBeNull();
    }
  });

  it("lists exactly the keys loadIcon knows", async () => {
    const { ICON_KEYS } = await import("./IconKeys");
    expect([...ICON_KEYS].sort()).toEqual([...(await listIconKeys())].sort());
  });
});

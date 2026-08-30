import { describe, expect, it } from "vitest";
import { loadIcon } from "./LazyIcons";

describe("loadIcon", () => {
  it("loads core icons", async () => {
    expect(await loadIcon("actor")).toContain("<svg");
  });

  it("loads cloud icons case-insensitively", async () => {
    expect(await loadIcon("CloudFront")).toContain("<svg");
  });

  it("returns null for unknown icons", async () => {
    expect(await loadIcon("not-a-real-icon")).toBeNull();
  });
});

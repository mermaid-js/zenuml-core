import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchEmojis, clearEmojiCache } from "./emojiService";

describe("fetchEmojis", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearEmojiCache();
  });

  it("returns empty map for empty input", async () => {
    const cache = await fetchEmojis([]);
    expect(cache.size).toBe(0);
  });

  it("fetches emoji from service and returns cache", async () => {
    const mockResponse = {
      rocket: { viewBox: "0 0 36 36", content: "<path/>", unicode: "🚀" },
      fire: { viewBox: "0 0 36 36", content: "<path/>", unicode: "🔥" },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);

    const cache = await fetchEmojis(["rocket", "fire"]);
    expect(cache.get("rocket")?.unicode).toBe("🚀");
    expect(cache.get("fire")?.content).toBe("<path/>");
  });

  it("returns empty map on fetch failure (fallback)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("offline"));
    const cache = await fetchEmojis(["rocket"]);
    expect(cache.size).toBe(0);
  });

  it("deduplicates shortcode names", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          rocket: {
            viewBox: "0 0 36 36",
            content: "<path/>",
            unicode: "🚀",
          },
        }),
    } as Response);

    await fetchEmojis(["rocket", "rocket", "rocket"]);
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toContain("emoji=rocket");
    // Should not contain duplicated names
    const emojiParam = new URL(url).searchParams.get("emoji");
    expect(emojiParam).toBe("rocket");
  });
});

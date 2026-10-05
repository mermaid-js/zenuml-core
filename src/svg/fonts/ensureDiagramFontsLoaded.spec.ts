import { afterEach, describe, expect, it } from "bun:test";

// A page whose Content-Security-Policy blocks data: fonts makes FontFace.load()
// reject ("A network error occurred." in Chromium). Rendering must carry on
// with the fallback fonts instead of failing.
class BlockedFontFace {
  constructor(
    public family: string,
    public source: string,
  ) {}
  load() {
    return Promise.reject(
      new DOMException("A network error occurred.", "NetworkError"),
    );
  }
}

const originalFontFace = (globalThis as any).FontFace;

afterEach(() => {
  (globalThis as any).FontFace = originalFontFace;
});

describe("ensureDiagramFontsLoaded", () => {
  it("resolves when the page blocks the embedded font", async () => {
    (globalThis as any).FontFace = BlockedFontFace;
    // Fresh module instance: the loader memoises its promise per module.
    const { ensureDiagramFontsLoaded } = await import(
      "./ensureDiagramFontsLoaded.ts?blocked-font"
    );
    await expect(ensureDiagramFontsLoaded()).resolves.toBeUndefined();
  });
});

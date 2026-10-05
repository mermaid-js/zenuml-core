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
    // The query string makes Bun load a separate instance; the specifier is
    // built at runtime so the type checker does not try to resolve it.
    const specifier = "./ensureDiagramFontsLoaded.ts" + "?blocked-font";
    const { ensureDiagramFontsLoaded } = (await import(specifier)) as {
      ensureDiagramFontsLoaded: () => Promise<void>;
    };
    await expect(ensureDiagramFontsLoaded()).resolves.toBeUndefined();
  });
});

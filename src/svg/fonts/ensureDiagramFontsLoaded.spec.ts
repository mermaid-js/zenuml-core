import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getCache, setCache } from "@/utils/RenderingCache";
import { IBM_PLEX_SANS_400_DATA_URI } from "./ibmPlexSans";

type Loader = typeof import("./ensureDiagramFontsLoaded");

// The loader keeps per-module state (memoised loads, the late-face listener).
// The query string makes Bun load a separate module instance per test; the
// specifier is built at runtime so the type checker does not try to resolve it.
let instance = 0;
async function freshLoader(): Promise<Loader> {
  const specifier = "./ensureDiagramFontsLoaded.ts" + `?t=${++instance}`;
  return (await import(specifier)) as Loader;
}

/** A FontFace stand-in that records its sources and fails for some of them. */
const created: FakeFontFace[] = [];
let refuse: (source: string) => boolean = () => false;

class FakeFontFace {
  status = "unloaded";
  constructor(
    public family: string,
    public source: string,
    public descriptors: Record<string, string> = {},
  ) {
    created.push(this);
  }
  load() {
    // A page whose Content-Security-Policy blocks the source makes
    // FontFace.load() reject ("A network error occurred." in Chromium).
    if (refuse(this.source)) {
      this.status = "error";
      return Promise.reject(
        new DOMException("A network error occurred.", "NetworkError"),
      );
    }
    this.status = "loaded";
    return Promise.resolve(this);
  }
}

type Face = { family: string; status: string };
type Listener = (e: { fontfaces: Face[] }) => void;

/** A minimal document.fonts (FontFaceSet) with a dispatchable loadingdone. */
class FakeFontFaceSet {
  faces: Face[] = [];
  listeners = new Set<Listener>();
  add(face: Face) {
    this.faces.push(face);
    return this;
  }
  forEach(cb: (face: Face) => void) {
    this.faces.forEach(cb);
  }
  addEventListener(type: string, cb: Listener) {
    if (type === "loadingdone") this.listeners.add(cb);
  }
  removeEventListener(type: string, cb: Listener) {
    if (type === "loadingdone") this.listeners.delete(cb);
  }
  /** What the browser does when a face the page registered finishes loading. */
  hostLoads(family: string) {
    const face = { family, status: "loaded" };
    this.faces.push(face);
    [...this.listeners].forEach((cb) => cb({ fontfaces: [face] }));
  }
}

const originalFontFace = (globalThis as any).FontFace;
const fontsDescriptor = Object.getOwnPropertyDescriptor(document, "fonts");
let fonts: FakeFontFaceSet;

const PERSISTED_KEY = "font-spec-persisted-width";
function persistAWidth() {
  setCache(PERSISTED_KEY, 42, true);
}
function persistedWidthSurvived() {
  return getCache(PERSISTED_KEY) === 42;
}

beforeEach(() => {
  created.length = 0;
  refuse = () => false;
  (globalThis as any).FontFace = FakeFontFace;
  fonts = new FakeFontFaceSet();
  Object.defineProperty(document, "fonts", {
    configurable: true,
    value: fonts,
  });
});

afterEach(() => {
  (globalThis as any).FontFace = originalFontFace;
  if (fontsDescriptor) {
    Object.defineProperty(document, "fonts", fontsDescriptor);
  } else {
    delete (document as any).fonts;
  }
});

describe("ensureDiagramFontsLoaded", () => {
  it("resolves when the page blocks the embedded font", async () => {
    refuse = () => true;
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await expect(ensureDiagramFontsLoaded()).resolves.toBeUndefined();
  });

  it("loads IBM Plex Sans from the embedded data URI by default", async () => {
    const { ensureDiagramFontsLoaded } = await freshLoader();
    persistAWidth();
    await ensureDiagramFontsLoaded();
    expect(created).toHaveLength(1);
    expect(created[0].family).toBe("IBM Plex Sans");
    expect(created[0].source).toBe(`url("${IBM_PLEX_SANS_400_DATA_URI}")`);
    expect(created[0].descriptors).toEqual({ weight: "400", style: "normal" });
    expect(fonts.faces).toContain(created[0]);
    expect(persistedWidthSurvived()).toBe(false);
  });

  it("loads only once while the source is unchanged", async () => {
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await ensureDiagramFontsLoaded();
    await ensureDiagramFontsLoaded();
    expect(created).toHaveLength(1);
  });
});

describe("setDiagramFontUrl", () => {
  it("loads IBM Plex Sans from the configured URL instead of the data URI", async () => {
    const { ensureDiagramFontsLoaded, setDiagramFontUrl } = await freshLoader();
    setDiagramFontUrl("/assets/IBMPlexSans-Regular-Latin1.woff2");
    persistAWidth();
    await ensureDiagramFontsLoaded();
    expect(created).toHaveLength(1);
    expect(created[0].family).toBe("IBM Plex Sans");
    expect(created[0].source).toBe(
      'url("/assets/IBMPlexSans-Regular-Latin1.woff2")',
    );
    expect(created[0].descriptors).toEqual({ weight: "400", style: "normal" });
    expect(fonts.faces).toContain(created[0]);
    expect(persistedWidthSurvived()).toBe(false);
  });

  it("retries with a new URL after the previous load was refused", async () => {
    const { ensureDiagramFontsLoaded, setDiagramFontUrl } = await freshLoader();
    refuse = (source) => source.includes("data:");
    await ensureDiagramFontsLoaded();
    expect(fonts.faces).toHaveLength(0);

    setDiagramFontUrl("https://app.example/plex.woff2");
    persistAWidth();
    await ensureDiagramFontsLoaded();
    expect(created).toHaveLength(2);
    expect(created[1].source).toBe('url("https://app.example/plex.woff2")');
    expect(fonts.faces).toContain(created[1]);
    expect(persistedWidthSurvived()).toBe(false);
  });

  it("does not reload when set to the URL already in use", async () => {
    const { ensureDiagramFontsLoaded, setDiagramFontUrl } = await freshLoader();
    setDiagramFontUrl("/plex.woff2");
    await ensureDiagramFontsLoaded();
    setDiagramFontUrl("/plex.woff2");
    await ensureDiagramFontsLoaded();
    expect(created).toHaveLength(1);
  });

  it("returns to the embedded data URI when reset with null", async () => {
    const { ensureDiagramFontsLoaded, setDiagramFontUrl } = await freshLoader();
    setDiagramFontUrl("/plex.woff2");
    await ensureDiagramFontsLoaded();
    setDiagramFontUrl(null);
    await ensureDiagramFontsLoaded();
    expect(created.map((f) => f.source)).toEqual([
      'url("/plex.woff2")',
      `url("${IBM_PLEX_SANS_400_DATA_URI}")`,
    ]);
  });

  it("does not load MS Sans Serif unless a URL is configured", async () => {
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await ensureDiagramFontsLoaded();
    expect(created.map((f) => f.family)).toEqual(["IBM Plex Sans"]);
  });

  it("loads MS Sans Serif for theme-neon from its configured URL", async () => {
    const { ensureDiagramFontsLoaded, setDiagramFontUrl } = await freshLoader();
    setDiagramFontUrl("/fonts/MS Sans Serif.ttf", "MS Sans Serif");
    await ensureDiagramFontsLoaded();
    const neon = created.find((f) => f.family === "MS Sans Serif");
    expect(neon?.source).toBe('url("/fonts/MS Sans Serif.ttf")');
    expect(fonts.faces).toContain(neon!);
    // The Plex default is unaffected.
    expect(created.find((f) => f.family === "IBM Plex Sans")?.source).toBe(
      `url("${IBM_PLEX_SANS_400_DATA_URI}")`,
    );
  });
});

describe("late IBM Plex Sans face", () => {
  it("clears the width cache once when the host registers the face after core's load was refused", async () => {
    refuse = () => true;
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await ensureDiagramFontsLoaded();
    expect(fonts.listeners.size).toBe(1);

    persistAWidth();
    fonts.hostLoads("Some Other Font");
    expect(persistedWidthSurvived()).toBe(true);

    // Faces declared in CSS can report their family quoted.
    fonts.hostLoads('"IBM Plex Sans"');
    expect(persistedWidthSurvived()).toBe(false);
    expect(fonts.listeners.size).toBe(0);

    persistAWidth();
    fonts.hostLoads("IBM Plex Sans");
    expect(persistedWidthSurvived()).toBe(true);
  });

  it("clears the width cache when the host face was already loaded at refusal", async () => {
    refuse = () => true;
    fonts.add({ family: "IBM Plex Sans", status: "loaded" });
    const { ensureDiagramFontsLoaded } = await freshLoader();
    persistAWidth();
    await ensureDiagramFontsLoaded();
    expect(persistedWidthSurvived()).toBe(false);
    expect(fonts.listeners.size).toBe(0);
  });

  it("clears the width cache on the next load when the host added an already-loaded face", async () => {
    refuse = () => true;
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await ensureDiagramFontsLoaded();
    // new FontFace(...).load().then(f => document.fonts.add(f)) adds a loaded
    // face: the set never enters "loading", so no loadingdone fires.
    fonts.add({ family: "IBM Plex Sans", status: "loaded" });
    persistAWidth();
    await ensureDiagramFontsLoaded();
    expect(persistedWidthSurvived()).toBe(false);
    expect(fonts.listeners.size).toBe(0);
  });

  it("does not listen when core's own load succeeded", async () => {
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await ensureDiagramFontsLoaded();
    expect(fonts.listeners.size).toBe(0);
  });

  it("tolerates a FontFaceSet without events", async () => {
    refuse = () => true;
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { add() {} },
    });
    const { ensureDiagramFontsLoaded } = await freshLoader();
    await expect(ensureDiagramFontsLoaded()).resolves.toBeUndefined();
  });
});

describe("getDiagramFontFaceCss", () => {
  it("returns an embeddable @font-face rule with the data URI, whatever URL is configured", async () => {
    const { getDiagramFontFaceCss, setDiagramFontUrl } = await freshLoader();
    setDiagramFontUrl("/plex.woff2");
    const css = await getDiagramFontFaceCss();
    expect(css).toBe(
      `@font-face { font-family: "IBM Plex Sans"; font-weight: 400; font-style: normal; src: url(${IBM_PLEX_SANS_400_DATA_URI}) format("woff2"); }`,
    );
  });
});

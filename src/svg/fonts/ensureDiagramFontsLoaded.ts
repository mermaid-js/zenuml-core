import { clearPersistentCache } from "@/utils/RenderingCache";
import {
  IBM_PLEX_SANS_400_DATA_URI,
  IBM_PLEX_SANS_FAMILY,
  IBM_PLEX_SANS_FONT_FACE_CSS,
} from "./ibmPlexSans";
import { MS_SANS_SERIF_FAMILY } from "./msSansSerif";

/** Font families whose file URL can be set with {@link setDiagramFontUrl}. */
export type DiagramFontFamily = "IBM Plex Sans" | "MS Sans Serif";

/** Consumer-supplied URLs; a family without one uses its default source. */
const configuredUrls = new Map<DiagramFontFamily, string>();

/** One memoised load per family, keyed by the source it was started with. */
const loads = new Map<
  DiagramFontFamily,
  { source: string; done: Promise<void> }
>();

/**
 * Where to load a family from: the configured URL, else the default. IBM Plex
 * Sans defaults to the embedded data: URI; MS Sans Serif (theme-neon only) has
 * no default and is not loaded unless configured.
 */
function sourceUrl(family: DiagramFontFamily): string | undefined {
  const configured = configuredUrls.get(family);
  if (configured) return configured;
  return family === IBM_PLEX_SANS_FAMILY
    ? IBM_PLEX_SANS_400_DATA_URI
    : undefined;
}

/**
 * Set the URL the browser renderer loads a diagram font from, instead of its
 * default. Call before rendering. Use it when the page's Content-Security-Policy
 * refuses `data:` fonts (e.g. Atlassian Forge Custom UI), with the font file
 * this package ships, served from an origin the policy allows:
 *
 * ```ts
 * import fontUrl from "@zenuml/core/fonts/IBMPlexSans-Regular-Latin1.woff2?url";
 * setDiagramFontUrl(fontUrl);
 * ```
 *
 * `family` defaults to "IBM Plex Sans", which otherwise loads from an embedded
 * `data:` URI. "MS Sans Serif" is the theme-neon face
 * (`@zenuml/core/fonts/MS-Sans-Serif.ttf`); it is only loaded when set.
 * Pass `null` to return to the default. Changing the URL makes the next render
 * load the font again, so a refused load can be retried with another URL.
 */
export function setDiagramFontUrl(
  url: string | null,
  family: DiagramFontFamily = IBM_PLEX_SANS_FAMILY,
): void {
  if (url) {
    configuredUrls.set(family, url);
  } else {
    configuredUrls.delete(family);
  }
  if (loads.get(family)?.source !== sourceUrl(family)) {
    loads.delete(family);
  }
}

let lateFaceRecoveryArmed = false;

function stripQuotes(family: string): string {
  return family.replace(/^["']|["']$/g, "");
}

function isLoadedPlexFace(face: { family: string; status: string }): boolean {
  return (
    face.status === "loaded" &&
    stripQuotes(face.family) === IBM_PLEX_SANS_FAMILY
  );
}

function plexFaceAlreadyLoaded(fonts: FontFaceSet): boolean {
  let found = false;
  if (typeof fonts.forEach === "function") {
    fonts.forEach((face) => {
      if (isLoadedPlexFace(face)) found = true;
    });
  }
  return found;
}

/**
 * Core's own IBM Plex Sans load was refused, so widths have been measured
 * with a fallback font. If the host page registers the face itself (now or
 * later), those widths are wrong: drop them once so the next render
 * re-measures with the real face.
 */
function armLateFaceRecovery(): void {
  if (lateFaceRecoveryArmed) return;
  const fonts = document.fonts as FontFaceSet | undefined;
  if (!fonts) return;
  if (plexFaceAlreadyLoaded(fonts)) {
    clearPersistentCache();
    return;
  }
  if (
    typeof fonts.addEventListener !== "function" ||
    typeof fonts.removeEventListener !== "function"
  ) {
    return;
  }
  lateFaceRecoveryArmed = true;
  const onLoadingDone = (event: Event) => {
    const loaded = (event as FontFaceSetLoadEvent).fontfaces;
    const plexArrived = loaded
      ? loaded.some(isLoadedPlexFace)
      : plexFaceAlreadyLoaded(fonts);
    if (!plexArrived) return;
    fonts.removeEventListener("loadingdone", onLoadingDone);
    lateFaceRecoveryArmed = false;
    clearPersistentCache();
  };
  fonts.addEventListener("loadingdone", onLoadingDone);
}

function load(family: DiagramFontFamily, source: string): Promise<void> {
  const face = new FontFace(family, `url("${source}")`, {
    weight: "400",
    style: "normal",
  });
  return face.load().then(
    (loaded) => {
      document.fonts.add(loaded);
      // Widths persisted before the font was available were measured with a
      // fallback and are keyed by the same font string.
      clearPersistentCache();
    },
    () => {
      // The page refused the font, e.g. a Content-Security-Policy without
      // data: in font-src. Render with the fallback fonts in the stack;
      // measurement falls back the same way, so layout stays consistent.
      // Not retried with the same source: the same policy would refuse it on
      // every render. setDiagramFontUrl() starts a new attempt.
      if (family === IBM_PLEX_SANS_FAMILY) armLateFaceRecovery();
    },
  );
}

/**
 * Make the diagram typefaces available to text measurement and rendering in a
 * browser. Await this before the first render or renderToSvg(): canvas
 * measureText silently measures a fallback font while a web font is not loaded,
 * which would lay the diagram out for the wrong glyph widths. ZenUml.render()
 * awaits it itself.
 *
 * Never rejects: if the page refuses a font, diagrams render with the
 * fallback fonts. No-op outside a browser; the CLI registers the font with its
 * own canvas.
 */
export function ensureDiagramFontsLoaded(): Promise<void> {
  if (typeof document === "undefined" || typeof FontFace === "undefined") {
    return Promise.resolve();
  }
  const pending: Promise<void>[] = [];
  for (const family of [IBM_PLEX_SANS_FAMILY, MS_SANS_SERIF_FAMILY] as const) {
    const source = sourceUrl(family);
    if (!source) continue;
    let entry = loads.get(family);
    if (!entry || entry.source !== source) {
      entry = { source, done: load(family, source) };
      loads.set(family, entry);
    }
    pending.push(entry.done);
  }
  return Promise.all(pending).then(() => undefined);
}

/**
 * The IBM Plex Sans `@font-face` rule with the font embedded as a `data:` URI,
 * for rasterising the rendered DOM (e.g. html-to-image's `fontEmbedCSS`
 * option). The DOM is drawn as an SVG image, and an SVG image can only use
 * fonts embedded in it — and html-to-image does not see faces registered with
 * the FontFace API, which is how this package registers them.
 *
 * The rule is returned whatever URL {@link setDiagramFontUrl} configured: a
 * data: URI inside an SVG image is not subject to the page's font-src, so this
 * also works on pages whose policy refused the embedded font for the document.
 */
export async function getDiagramFontFaceCss(): Promise<string | undefined> {
  return IBM_PLEX_SANS_FONT_FACE_CSS;
}

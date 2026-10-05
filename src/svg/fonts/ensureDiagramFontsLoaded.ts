import { clearPersistentCache } from "@/utils/RenderingCache";
import {
  IBM_PLEX_SANS_400_DATA_URI,
  IBM_PLEX_SANS_FAMILY,
} from "./ibmPlexSans";

let loading: Promise<void> | null = null;

/**
 * Make the diagram typeface available to text measurement and rendering in a
 * browser. Await this before the first render or renderToSvg(): canvas
 * measureText silently measures a fallback font while a web font is not loaded,
 * which would lay the diagram out for the wrong glyph widths.
 *
 * Never rejects: if the page refuses the font, diagrams render with the
 * fallback fonts. No-op outside a browser; the CLI registers the font with its
 * own canvas.
 */
export function ensureDiagramFontsLoaded(): Promise<void> {
  if (typeof document === "undefined" || typeof FontFace === "undefined") {
    return Promise.resolve();
  }
  if (!loading) {
    const face = new FontFace(
      IBM_PLEX_SANS_FAMILY,
      `url(${IBM_PLEX_SANS_400_DATA_URI})`,
      { weight: "400", style: "normal" },
    );
    loading = face.load().then(
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
        // Not retried: the same policy would refuse it on every render.
      },
    );
  }
  return loading;
}

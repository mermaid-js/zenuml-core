// Build-time only: the font files the library build writes to dist/fonts/ (see
// vite.config.lib.ts and the "./fonts/*" export in package.json). Not part of
// the library bundle.
import { readFileSync } from "fs";
import { resolve } from "path";
import { IBM_PLEX_SANS_400_WOFF2_BASE64 } from "./ibmPlexSans";

export const IBM_PLEX_SANS_WOFF2_FILE = "IBMPlexSans-Regular-Latin1.woff2";
export const MS_SANS_SERIF_TTF_FILE = "MS-Sans-Serif.ttf";

const repoRoot = resolve(__dirname, "../../..");

export function packageFontFiles(): { fileName: string; source: Uint8Array }[] {
  const read = (path: string) => readFileSync(resolve(repoRoot, path));
  return [
    {
      // Decoded from the constant the library embeds, so the shipped file and
      // the embedded data: URI cannot drift apart.
      fileName: IBM_PLEX_SANS_WOFF2_FILE,
      source: Buffer.from(IBM_PLEX_SANS_400_WOFF2_BASE64, "base64"),
    },
    {
      fileName: "IBM-Plex-LICENSE.txt",
      source: read("src/svg/fonts/IBM-Plex-LICENSE.txt"),
    },
    {
      // The demo site serves the same file from public/fonts/.
      fileName: MS_SANS_SERIF_TTF_FILE,
      source: read("public/fonts/MS Sans Serif.ttf"),
    },
    {
      fileName: "MS-Sans-Serif-NOTICE.txt",
      source: read("src/svg/fonts/MS-Sans-Serif-NOTICE.txt"),
    },
  ];
}

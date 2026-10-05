import { describe, expect, it } from "bun:test";
import { createHash } from "crypto";
import { IBM_PLEX_SANS_400_WOFF2_BASE64 } from "./ibmPlexSans";
import { IBM_PLEX_SANS_WOFF2_FILE, packageFontFiles } from "./packageFontFiles";

// sha256 of fonts/split/woff2/IBMPlexSans-Regular-Latin1.woff2 in the npm
// package @ibm/plex-sans@1.1.0. The base64 constant is the single source of
// truth; the woff2 shipped in dist/fonts/ is decoded from it at build time.
const UPSTREAM_SHA256 =
  "b5ad7bd39f996144915f0ad9849a90183b27d8c28ad97ed98af5b1bebc51f6b1";

const sha256 = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

describe("IBM Plex Sans font data", () => {
  it("is the unmodified upstream woff2", () => {
    const bytes = Buffer.from(IBM_PLEX_SANS_400_WOFF2_BASE64, "base64");
    expect(bytes.length).toBe(20984);
    expect(sha256(bytes)).toBe(UPSTREAM_SHA256);
  });

  it("is what the package ships as a font file", () => {
    const shipped = packageFontFiles().find(
      (f) => f.fileName === IBM_PLEX_SANS_WOFF2_FILE,
    );
    expect(shipped).toBeDefined();
    expect(sha256(shipped!.source)).toBe(UPSTREAM_SHA256);
  });

  it("ships with its licence", () => {
    const names = packageFontFiles().map((f) => f.fileName);
    expect(names).toContain("IBM-Plex-LICENSE.txt");
  });
});

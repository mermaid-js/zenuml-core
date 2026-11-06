import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Every participant icon must survive a dark canvas. Icons painted only in
 * fixed near-black colours (or with no paint at all, which SVG renders as
 * black) vanish on theme-dark (#1f1f1f). Monochrome icons must use
 * `currentColor` so they take the participant text colour of the theme, like
 * the built-in actor/database icons; brand icons (AWS, Azure, GCP) carry their
 * own light colours and pass.
 */

const HERE = dirname(new URL(import.meta.url).pathname);
const SRC = resolve(HERE, "../../..");

/** Icon asset paths imported by a loader module, resolved to absolute paths. */
function iconPaths(modulePath: string): string[] {
  const text = readFileSync(modulePath, "utf8");
  return Array.from(text.matchAll(/["']([^"']+\.svg)\?raw["']/g), ([, p]) =>
    p.startsWith("@/")
      ? resolve(SRC, p.slice(2))
      : resolve(dirname(modulePath), p),
  );
}

function luminance(hex: string): number {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const NAMED: Record<string, number> = { black: 0, white: 1 };

/** Paint colours an SVG declares through attributes, style attributes or <style> rules. */
function paints(svg: string): {
  usesCurrentColor: boolean;
  luminances: number[];
  declared: number;
} {
  const values = Array.from(
    svg.matchAll(/(?:fill|stroke|stop-color)\s*[:=]\s*"?\s*([^;"'}\s]+)/g),
    ([, v]) => v.trim(),
  );
  const luminances: number[] = [];
  let usesCurrentColor = false;
  let declared = 0;
  for (const v of values) {
    if (v === "none" || v === "transparent" || v.startsWith("url(")) continue;
    declared++;
    if (v === "currentColor") usesCurrentColor = true;
    else if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v))
      luminances.push(luminance(v));
    else if (v in NAMED) luminances.push(NAMED[v]);
  }
  return { usesCurrentColor, luminances, declared };
}

const DARK = 0.18; // relative luminance below which a glyph disappears on #1f1f1f

describe("participant icon assets", () => {
  const paths = [
    ...iconPaths(resolve(HERE, "LazyIcons.ts")),
    ...iconPaths(resolve(HERE, "CloudIcons.ts")),
  ];

  it("resolves every icon import to a file", () => {
    expect(paths.length).toBeGreaterThan(500);
    for (const p of paths) expect(() => readFileSync(p)).not.toThrow();
  });

  it("no icon is painted only in fixed near-black colours", () => {
    const offenders: string[] = [];
    for (const p of paths) {
      const { usesCurrentColor, luminances, declared } = paints(
        readFileSync(p, "utf8"),
      );
      if (usesCurrentColor) continue;
      const fixedDark =
        declared === 0 ||
        (luminances.length > 0 && Math.max(...luminances) < DARK);
      if (fixedDark) offenders.push(p.slice(SRC.length + 1));
    }
    expect(offenders).toEqual([]);
  });
});

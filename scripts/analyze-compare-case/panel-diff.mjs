/*
 * What this file does:
 * Uses the page's live `#diff-panel canvas` as the analyzer's pixel-diff source.
 *
 * High-level flow:
 * - Renders the compare-case diff into the page's diff panel from captured screenshots.
 * - Reads the panel canvas pixels back into Node.
 * - Classifies panel colors into match, html-only, svg-only, and color-diff classes.
 * - Returns a `diffImage` object compatible with the analyzer's scoring modules.
 *
 * Example input:
 * A Playwright `page` plus HTML/SVG PNG buffers captured from the compare-case roots.
 *
 * Example output:
 * `{ width, height, diffData, classData, stats, badgeText, panelStats }`
 */
import { round } from "./geometry.mjs";

function classifyPanelPixel(r, g, b) {
  const isBackground = r >= 230 && g >= 230 && b >= 230;
  if (isBackground) {
    return 0;
  }
  if (r >= 220 && g <= 120 && b <= 160 && r > b) {
    return 2;
  }
  if (b >= 220 && r <= 120 && g <= 120 && b > r) {
    return 3;
  }
  if (r >= 200 && b >= 200 && g <= 140) {
    return 4;
  }
  if (g >= 50 && g >= r && g >= b) {
    return 1;
  }
  return 0;
}

export function buildDiffImageFromPanel(width, height, rgbaData) {
  const diffData = new Uint8ClampedArray(rgbaData);
  const classData = new Uint8Array(width * height);

  let matched = 0;
  let htmlOnly = 0;
  let svgOnly = 0;
  let colorDiff = 0;

  for (let i = 0; i < classData.length; i++) {
    const offset = i * 4;
    const cls = classifyPanelPixel(
      diffData[offset],
      diffData[offset + 1],
      diffData[offset + 2],
    );
    classData[i] = cls;
    if (cls === 1) matched++;
    else if (cls === 2) htmlOnly++;
    else if (cls === 3) svgOnly++;
    else if (cls === 4) colorDiff++;
  }

  const total = matched + htmlOnly + svgOnly + colorDiff;
  const posMatched = matched + colorDiff;

  return {
    width,
    height,
    diffData,
    classData,
    stats: {
      matched,
      posMatched,
      total,
      htmlOnly,
      svgOnly,
      colorDiff,
      pixelPct: total > 0 ? round((matched / total) * 100, 2) : 100,
      posPct: total > 0 ? round((posMatched / total) * 100, 2) : 100,
    },
  };
}

export async function renderAndReadDiffPanel(page, htmlBuffer, svgBuffer) {
  const htmlDataUrl = `data:image/png;base64,${htmlBuffer.toString("base64")}`;
  const svgDataUrl = `data:image/png;base64,${svgBuffer.toString("base64")}`;

  const panel = await page.evaluate(async ({ htmlDataUrl, svgDataUrl }) => {
    if (typeof window.diffFromImages !== "function") {
      throw new Error("window.diffFromImages is not available on compare-case.html");
    }

    const panelStats = await window.diffFromImages(htmlDataUrl, svgDataUrl);
    const canvas = document.querySelector("#diff-panel canvas");
    if (!canvas) {
      throw new Error("#diff-panel canvas was not rendered");
    }

    const ctx = canvas.getContext("2d");
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return {
      width: canvas.width,
      height: canvas.height,
      data: Array.from(image.data),
      badgeText: document.getElementById("match-badge")?.textContent?.trim() || "",
      panelStats,
    };
  }, { htmlDataUrl, svgDataUrl });

  return {
    ...buildDiffImageFromPanel(panel.width, panel.height, panel.data),
    badgeText: panel.badgeText,
    panelStats: panel.panelStats,
  };
}

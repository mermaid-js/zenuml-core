import { test, expect } from "../fixtures";
import { PNG } from "pngjs";
import { TEST_CASES } from "../test-cases";

/**
 * Fragment header alignment
 *
 * The header of a fragment (alt, loop, try, par, opt, ...) shows a number,
 * a kind icon and a small-caps title. All three must share one visual
 * (ink) centre line: the title is measured from rendered pixels, not from
 * its line box, because small caps only fill the lower part of the line.
 */

const DPRS = [1, 2];
const HEADER_INNER_HEIGHT = 24; // 25px band minus the 1px bottom border

type Box = { x: number; y: number; width: number; height: number };
type Part = { name: string; box: Box };
type Header = { label: string; box: Box; parts: Part[] };

/** Vertical centre (CSS px from the header top) of a part's rendered ink. */
function inkCenter(
  png: PNG,
  dpr: number,
  header: Box,
  part: Box,
  pad = 0,
): number {
  const x0 = Math.floor((part.x - pad) * dpr);
  const x1 = Math.ceil((part.x + part.width + pad) * dpr);
  const y0 = Math.round(header.y * dpr);
  const y1 = Math.round((header.y + HEADER_INNER_HEIGHT) * dpr);
  // Background = the most common colour of the header band.
  const histogram = new Map<number, number>();
  for (let y = y0; y < y1; y++) {
    for (
      let x = Math.round(header.x * dpr);
      x < Math.round((header.x + header.width) * dpr);
      x++
    ) {
      const i = (y * png.width + x) * 4;
      const key =
        (png.data[i] << 16) | (png.data[i + 1] << 8) | png.data[i + 2];
      histogram.set(key, (histogram.get(key) ?? 0) + 1);
    }
  }
  const bg = [...histogram.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const bgRgb = [(bg >> 16) & 255, (bg >> 8) & 255, bg & 255];
  let top = Infinity;
  let bottom = -Infinity;
  for (let x = x0; x < x1; x++) {
    let columnTop = Infinity;
    let columnBottom = -Infinity;
    for (let y = y0; y < y1; y++) {
      const i = (y * png.width + x) * 4;
      const distance =
        Math.abs(png.data[i] - bgRgb[0]) +
        Math.abs(png.data[i + 1] - bgRgb[1]) +
        Math.abs(png.data[i + 2] - bgRgb[2]);
      if (distance > 120) {
        columnTop = Math.min(columnTop, y);
        columnBottom = Math.max(columnBottom, y + 1);
      }
    }
    // A column inked over (almost) the whole band is a lifeline crossing the
    // header, not part of the title.
    if (columnBottom - columnTop >= (HEADER_INNER_HEIGHT - 2) * dpr) continue;
    top = Math.min(top, columnTop);
    bottom = Math.max(bottom, columnBottom);
  }
  expect(top, "part has visible ink").toBeLessThan(bottom);
  if (process.env.DEBUG_INK)
    console.log(
      JSON.stringify({
        dpr,
        part,
        header,
        top: top / dpr - header.y,
        bottom: bottom / dpr - header.y,
      }),
    );
  return (top + bottom) / 2 / dpr - header.y;
}

async function assertHeadersAligned(
  page: import("@playwright/test").Page,
  dpr: number,
  headers: Header[],
) {
  expect(headers.length).toBeGreaterThan(0);
  const png = PNG.sync.read(await page.screenshot({ fullPage: true }));
  const centre = HEADER_INNER_HEIGHT / 2;
  for (const header of headers) {
    for (const part of header.parts) {
      // SVG icon boxes exclude their stroke, so look 1px beyond them.
      const ink = inkCenter(
        png,
        dpr,
        header.box,
        part.box,
        part.name === "icon" ? 1 : 0,
      );
      expect(
        Math.abs(ink - centre),
        `${header.label} ${part.name} ink centre ${ink.toFixed(2)}px vs header centre ${centre}px at DPR ${dpr}`,
      ).toBeLessThanOrEqual(0.5);
    }
  }
}

test.describe("fragment header alignment", () => {
  for (const dpr of DPRS) {
    test(`HTML renderer centres the number, icon and title on one line at DPR ${dpr}`, async ({
      browser,
    }) => {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 900 },
        deviceScaleFactor: dpr,
      });
      try {
        await page.goto("/e2e/fixtures/fixture.html?case=fragment");
        await expect(
          page.locator(".sequence-diagram .participant").first(),
        ).toBeVisible();
        await page.waitForLoadState("networkidle");
        const headers = await page.evaluate(() => {
          const rect = (el: Element | null | undefined) => {
            if (!el) return null;
            const b = el.getBoundingClientRect();
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          };
          return [...document.querySelectorAll(".fragment > .header")].map(
            (header) => {
              const title = header.querySelector(
                ".collapsible-header > label",
              )!;
              const parts = [
                {
                  name: "number",
                  box: rect(header.querySelector(".fragment-number")),
                },
                {
                  name: "icon",
                  box: rect(
                    header.querySelector(
                      ".name > label > span:not(.fragment-number) > svg",
                    ),
                  ),
                },
                { name: "title", box: rect(title) },
              ].filter((p) => p.box) as Part[];
              return {
                label: title.textContent ?? "",
                box: rect(header)!,
                parts,
              };
            },
          );
        });
        await assertHeadersAligned(page, dpr, headers);
      } finally {
        await page.close();
      }
    });

    test(`SVG renderer centres the number, icon and title on one line at DPR ${dpr}`, async ({
      browser,
    }) => {
      const page = await browser.newPage({
        viewport: { width: 1200, height: 900 },
        deviceScaleFactor: dpr,
      });
      try {
        await page.goto("/e2e/fixtures/svg-test.html");
        await page.evaluate(
          (c) => (window as any).__renderSvg(c),
          TEST_CASES["fragment"],
        );
        await expect(page.locator("#svg-output > svg")).toBeVisible();
        const headers = await page.evaluate(() => {
          const rect = (el: Element | null | undefined) => {
            if (!el) return null;
            const b = el.getBoundingClientRect();
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          };
          return [...document.querySelectorAll("rect.fragment-header")].map(
            (header) => {
              const parts: Part[] = [];
              let label = "";
              let node = header.nextElementSibling;
              while (node && !node.classList.contains("fragment-header")) {
                if (node.classList.contains("seq-number"))
                  parts.push({ name: "number", box: rect(node)! });
                if (
                  node.tagName === "svg" &&
                  !parts.some((p) => p.name === "icon")
                )
                  parts.push({ name: "icon", box: rect(node)! });
                if (node.classList.contains("fragment-label")) {
                  label = node.textContent ?? "";
                  parts.push({ name: "title", box: rect(node)! });
                  break;
                }
                node = node.nextElementSibling;
              }
              return { label, box: rect(header)!, parts };
            },
          );
        });
        await assertHeadersAligned(page, dpr, headers);
      } finally {
        await page.close();
      }
    });
  }
});

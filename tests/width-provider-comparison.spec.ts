import { test, expect } from "./fixtures";

const TEST_CORPUS = [
  // Short labels
  "A", "B", "OrderService", "UserController",
  // Medium labels
  "processPayment", "handleAuthentication", "validateInput(data)",
  // Long labels
  "sendNotificationToAllSubscribers", "AbstractFactoryPatternImpl",
  // Special characters
  "hello() -> world", "a.b(c, d)", "new OrderService()",
  // Edge cases
  "", " ", "AAAA",
];

test.describe("Width Provider Comparison", () => {
  test("canvas vs browser measurement accuracy", async ({ page }) => {
    await page.goto("/cy/smoke.html");
    await page.waitForTimeout(1000);

    const results = await page.evaluate((corpus) => {
      // Import is not available in browser context, so inline the logic
      const FONT_FAMILY = "Helvetica, Verdana, serif";

      function measureWithBrowser(text: string, fontSize: string): number {
        let hiddenDiv = document.querySelector(
          ".width-test-div",
        ) as HTMLDivElement;
        if (hiddenDiv) hiddenDiv.remove();

        const div = document.createElement("div");
        div.className = "width-test-div";
        div.style.fontSize = fontSize;
        div.style.fontFamily = FONT_FAMILY;
        div.style.display = "inline";
        div.style.whiteSpace = "nowrap";
        div.style.visibility = "hidden";
        div.style.position = "absolute";
        div.style.top = "0";
        div.style.left = "0";
        div.style.overflow = "hidden";
        div.style.width = "0px";
        div.style.paddingLeft = "0px";
        div.style.paddingRight = "0px";
        div.style.margin = "0px";
        div.style.border = "0px";
        document.body.appendChild(div);
        div.textContent = text;
        const w = div.scrollWidth;
        div.remove();
        return w;
      }

      function measureWithCanvas(text: string, font: string): number {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        ctx.font = font;
        return Math.ceil(ctx.measureText(text).width);
      }

      const comparisons: Array<{
        text: string;
        type: string;
        browser: number;
        canvas: number;
        diff: number;
      }> = [];

      for (const text of corpus) {
        for (const [type, fontSize, font] of [
          ["participant", "16px", `16px ${FONT_FAMILY}`],
          ["message", "14px", `14px ${FONT_FAMILY}`],
        ] as const) {
          const browser = measureWithBrowser(text, fontSize);
          const canvas = measureWithCanvas(text, font);
          comparisons.push({
            text,
            type,
            browser,
            canvas,
            diff: Math.abs(canvas - browser),
          });
        }
      }

      const diffs = comparisons.map((c) => c.diff);
      const maxDiff = Math.max(...diffs);
      const meanDiff =
        diffs.reduce((a, b) => a + b, 0) / diffs.length;
      const sortedDiffs = [...diffs].sort((a, b) => a - b);
      const p95Index = Math.floor(sortedDiffs.length * 0.95);
      const p95Diff = sortedDiffs[p95Index] || 0;

      return {
        comparisons,
        stats: { maxDiff, meanDiff, p95Diff, count: comparisons.length },
      };
    }, TEST_CORPUS);

    console.log("\n=== Width Provider Comparison Results ===");
    console.log(`Total comparisons: ${results.stats.count}`);
    console.log(`Max diff: ${results.stats.maxDiff}px`);
    console.log(`Mean diff: ${results.stats.meanDiff.toFixed(2)}px`);
    console.log(`P95 diff: ${results.stats.p95Diff}px`);
    console.log("\nPer-item results:");
    for (const c of results.comparisons) {
      if (c.diff > 0) {
        console.log(
          `  "${c.text}" [${c.type}]: browser=${c.browser}, canvas=${c.canvas}, diff=${c.diff}`,
        );
      }
    }

    // Assert all diffs are within 2px tolerance for non-whitespace text.
    // Whitespace-only strings are excluded: browser scrollWidth returns 0
    // (collapsed in overflow:hidden width:0) while canvas measures actual glyph width.
    // This is acceptable since ZenUML labels are never whitespace-only.
    for (const c of results.comparisons) {
      if (c.text.trim().length === 0) continue;
      expect(
        c.diff,
        `"${c.text}" [${c.type}]: browser=${c.browser} vs canvas=${c.canvas}`,
      ).toBeLessThanOrEqual(2);
    }
  });
});

/** PNG rasterizer: renders an SVG string in headless Chromium (Playwright). */

/** Shared Playwright browser instance — launched once, reused across renders. */
let _browser: Awaited<
  ReturnType<(typeof import("playwright-core"))["chromium"]["launch"]>
> | null = null;

function pngRuntimeHelp(detail: string): string {
  return [
    detail,
    "",
    "PNG output requires Playwright's Chromium runtime.",
    "Install it with:",
    "  npm install playwright-core",
    "  npx playwright-core install chromium",
    "",
    "Or point ZenUML at an existing Chrome/Chromium binary:",
    "  ZENUML_CHROMIUM_PATH=/path/to/chrome zenuml -i diagram.zenuml -o diagram.png",
  ].join("\n");
}

async function getPlaywrightBrowser() {
  if (_browser) return _browser;
  let playwright: typeof import("playwright-core");
  try {
    playwright = await import("playwright-core");
  } catch (error) {
    throw new Error(
      pngRuntimeHelp(
        `Cannot load optional dependency "playwright-core": ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }

  const executablePath = process.env["ZENUML_CHROMIUM_PATH"];
  try {
    _browser = await playwright.chromium.launch(
      executablePath ? { executablePath } : undefined,
    );
    return _browser;
  } catch (error) {
    throw new Error(
      pngRuntimeHelp(
        `Cannot launch Chromium${executablePath ? ` at ${executablePath}` : ""}: ${error instanceof Error ? error.message : String(error)}`,
      ),
    );
  }
}

/** Shut down the shared browser (call before process exit). */
export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}

/** Rasterize an SVG string to PNG bytes using headless Chromium (Playwright). */
export async function rasterizeToPng(
  svgString: string,
  svgWidth: number,
  svgHeight: number,
  scale: number,
): Promise<Buffer> {
  const browser = await getPlaywrightBrowser();
  const page = await browser.newPage({
    viewport: {
      width: Math.ceil(svgWidth),
      height: Math.ceil(svgHeight),
    },
    deviceScaleFactor: scale,
  });

  try {
    const html = `<!DOCTYPE html>
<html><head><style>
  html, body { margin: 0; padding: 0; background: white; overflow: hidden; }
  svg { display: block; width: ${svgWidth}px; height: ${svgHeight}px; }
</style></head><body>${svgString}</body></html>`;

    await page.setContent(html, { waitUntil: "load" });
    // `load` does not mean painted. Page.captureScreenshot copies the
    // compositor's current surface, and on a fresh page under CPU load that
    // surface can still be missing, which fails with "Unable to capture
    // screenshot". Two animation frames guarantee one frame was produced.
    // The timer only stops a page that never paints from hanging the CLI.
    await page.evaluate(
      () =>
        new Promise<void>((done) => {
          setTimeout(done, 5000);
          requestAnimationFrame(() => requestAnimationFrame(() => done()));
        }),
    );
    const png = await page.screenshot({ type: "png" });
    return Buffer.from(png);
  } finally {
    await page.close();
  }
}

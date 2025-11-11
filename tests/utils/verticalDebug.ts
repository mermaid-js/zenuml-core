import type { Page } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const shouldCapture = process.env.DEBUG_VERTICAL === "1";

export async function initVerticalDebug(page: Page) {
  if (!shouldCapture) return false;
  await page.addInitScript(() => {
    (window as any).__ZEN_CAPTURE_VERTICAL = true;
  });
  return true;
}

export async function writeVerticalDebug(page: Page, slug: string) {
  if (!shouldCapture) return;
  const debugData = await page.evaluate(() => {
    const entries = Array.from(
      ((window as any).__zenumlVerticalEntries as Array<[string, any]>) || [],
    );
    const messageLayer = document.querySelector(".message-layer");
    const messageLayerTop =
      messageLayer?.getBoundingClientRect().top ?? 0;
    const dom = Array.from(
      document.querySelectorAll("[data-statement-key]") as NodeListOf<HTMLElement>,
    ).reduce<Record<string, { top: number; height: number }>>(
      (acc, element) => {
        const key = element.getAttribute("data-statement-key");
        if (!key) {
          return acc;
        }
        acc[key] = {
          top: element.getBoundingClientRect().top - messageLayerTop,
          height: element.getBoundingClientRect().height,
        };
        return acc;
      },
      {},
    );
    return { entries, dom };
  });
  const outputDir = path.resolve("tmp");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `${slug}.json`),
    JSON.stringify(debugData, null, 2),
  );
}

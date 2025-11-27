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
    const lifelineDebug =
      (window as any).__zenumlLifelineDebug ||
      ((window as any).__zenumlLifelineDebug = {});
    const creationTopRecords =
      (window as any).__zenumlCreationTopRecords || [];
    const messageLayer = document.querySelector(".message-layer");
    const messageLayerTop =
      messageLayer?.getBoundingClientRect().top ?? 0;
    const dom = Array.from(
      document.querySelectorAll("[data-statement-key]") as NodeListOf<HTMLElement>,
    ).reduce<
      Record<
        string,
        {
          top: number;
          height: number;
          messageTop?: number;
          messageHeight?: number;
          containerTop?: number;
          containerHeight?: number;
        }
      >
    >((acc, element) => {
      const key = element.getAttribute("data-statement-key");
      if (!key) {
        return acc;
      }
      const containerEl = element.querySelector(
        ":scope [data-type]",
      ) as HTMLElement | null;
      const messageEl = containerEl?.querySelector(
        ":scope .message",
      ) as HTMLElement | null;
      acc[key] = {
        top: element.getBoundingClientRect().top - messageLayerTop,
        height: element.getBoundingClientRect().height,
        containerTop: containerEl
          ? containerEl.getBoundingClientRect().top - messageLayerTop
          : undefined,
        containerHeight: containerEl
          ? containerEl.getBoundingClientRect().height
          : undefined,
        messageTop: messageEl
          ? messageEl.getBoundingClientRect().top - messageLayerTop
          : undefined,
        messageHeight: messageEl
          ? messageEl.getBoundingClientRect().height
          : undefined,
      };
      return acc;
    }, {});
    const lifelines = Array.from(
      document.querySelectorAll(".lifeline[id]") as NodeListOf<HTMLElement>,
    ).reduce<
      Record<
        string,
        { containerTop: number; labelTop?: number; debug?: any }
      >
    >((acc, element) => {
      const id = element.getAttribute("id");
      if (!id) {
        return acc;
      }
      const label = element.querySelector(
        "[data-participant-id]",
      ) as HTMLElement | null;
      acc[id] = {
        containerTop: element.getBoundingClientRect().top,
        labelTop: label?.getBoundingClientRect().top,
        debug: lifelineDebug[id],
      };
      return acc;
    }, {});
    return { entries, dom, lifelines, messageLayerTop, creationTopRecords };
  });
  const outputDir = path.resolve("tmp");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `${slug}.json`),
    JSON.stringify(debugData, null, 2),
  );
}

import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";

const shouldCollect = process.env.COLLECT_LAYOUT_METRICS === "1";

const scenarios = [
  {
    name: "fragment",
    url: "http://127.0.0.1:8080/cy/smoke-fragment.html",
    participant: "C",
  },
  {
    name: "creation",
    url: "http://127.0.0.1:8080/cy/smoke-creation.html",
    participant: "B",
  },
  {
    name: "editable-label",
    url: "http://127.0.0.1:8080/cy/smoke-editable-label.html",
    participant: "C",
  },
];

if (!shouldCollect) {
  test.describe.skip("Layout metrics", () => {});
} else {
  test.describe("Layout metrics", () => {
    scenarios.forEach((scenario) => {
      test(`${scenario.name}`, async ({ page }) => {
      await page.addInitScript(() => {
        (window as any).__ZEN_CAPTURE_VERTICAL = true;
      });
      await page.goto(scenario.url);
      await expect(page.locator(".privacy>span>svg")).toBeVisible({
        timeout: 5000,
      });

      const data = await page.evaluate((participant) => {
        const lifeline = (window as any).__zenumlLifelineDebug || {};
        const verticalEntries = Object.fromEntries(
          (window as any).__zenumlVerticalEntries || [],
        );
        const blockDebug = (window as any).__zenumlBlockDebug || [];
        const lifelineEl = document.getElementById(participant);
        const creationMessage = document.querySelector(
          `[data-type="creation"][data-to="${participant}"]`,
        );
        const messageLayer = document.querySelector(".message-layer");
        const lifelineTop = lifelineEl?.getBoundingClientRect().top ?? null;
        const creationTop = creationMessage?.getBoundingClientRect().top ?? null;
        const messageLayerTop = messageLayer?.getBoundingClientRect().top ?? 0;
        const domStatements: Record<string, number> = {};
        const domStatementPositions: Record<string, number> = {};
        const domStatementHeights: Record<string, number> = {};
        document.querySelectorAll("[data-statement-key]").forEach((el) => {
          const key = el.getAttribute("data-statement-key");
          if (!key) return;
          domStatementPositions[key] =
            el.getBoundingClientRect().top - messageLayerTop;
          domStatementHeights[key] = el.getBoundingClientRect().height;
          const creationContainer = el.querySelector(
            '[data-type="creation"]',
          ) as HTMLElement | null;
          if (!creationContainer) return;
          const ownerStatement = creationContainer.closest(
            "[data-statement-key]",
          );
          if (ownerStatement !== el) return;
          const creation = creationContainer.querySelector(
            ".message",
          ) as HTMLElement | null;
          if (!creation) return;
          domStatements[key] =
            creation.getBoundingClientRect().top - messageLayerTop;
        });
        const fragmentSelectors = [
          ".fragment-alt",
          ".fragment-loop",
          ".fragment-tcf",
          ".fragment.opt",
        ];
        const fragments: Record<string, number> = {};
        fragmentSelectors.forEach((selector) => {
          const el = document.querySelector(selector);
          if (!el) return;
          fragments[selector] =
            el.getBoundingClientRect().top - messageLayerTop;
        });
        const fragmentGapData: Record<string, any> = {};
        document.querySelectorAll('.fragment').forEach((fragment, index) => {
          const className = Array.from(fragment.classList).find((cls) =>
            cls.startsWith('fragment-'),
          );
          const key = `${className || 'fragment'}#${index}`;
          const header = fragment.querySelector(':scope > .header');
          const firstStatement = fragment.querySelector(
            ':scope [data-statement-key]',
          );
          const statements = fragment.querySelectorAll(
            ':scope [data-statement-key]',
          );
          const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
          const firstStatementTop =
            firstStatement?.getBoundingClientRect().top ?? headerBottom;
          const lastStatementBottom =
            statements.length > 0
              ? (statements[statements.length - 1] as HTMLElement)
                  .getBoundingClientRect().bottom
              : headerBottom;
          const commentEl = fragment.querySelector(':scope .comments');
          const commentHeight = commentEl
            ? (commentEl as HTMLElement).getBoundingClientRect().height
            : 0;
          fragmentGapData[key] = {
            headerToFirst: firstStatementTop - headerBottom,
            bottomPadding:
              fragment.getBoundingClientRect().bottom - lastStatementBottom,
            statementCount: statements.length,
            headerBottom,
            firstStatementTop,
            firstStatementKey:
              (firstStatement as HTMLElement | null)?.getAttribute(
                'data-statement-key',
              ) || null,
            commentHeight,
          };
        });
        const measureHeight = (selector: string) =>
          document.querySelector(selector)?.getBoundingClientRect().height || 0;
        const conditionHeight = measureHeight(
          ".fragment-alt .segment .text-skin-fragment",
        );
        const headerHeights = {
          alt: measureHeight(".fragment-alt > .header"),
          loop: measureHeight(".fragment-loop > .header"),
          tcf: measureHeight(".fragment-tcf > .header"),
          opt: measureHeight(".fragment.opt > .header"),
        };
        return {
          lifeline,
          verticalEntries,
          blockDebug,
          lifelineTop,
          creationTop,
          messageLayerTop,
          domStatements,
          domStatementPositions,
          domStatementHeights,
          fragments,
          fragmentGapData,
          conditionHeight,
          headerHeights,
        };
      }, scenario.participant);

      const payload = {
        scenario,
        collectedAt: new Date().toISOString(),
        data,
      };
      const outputDir = path.resolve("tmp");
      await fs.mkdir(outputDir, { recursive: true });
      const outputFile = path.join(outputDir, "layout-metrics.json");
      let existing: any[] = [];
      try {
        const content = await fs.readFile(outputFile, "utf8");
        existing = JSON.parse(content);
      } catch (err) {
        existing = [];
      }
      const filtered = existing.filter(
        (item) => item?.scenario?.name !== scenario.name,
      );
      filtered.push(payload);
      await fs.writeFile(outputFile, JSON.stringify(filtered, null, 2));
      });
    });
  });
}

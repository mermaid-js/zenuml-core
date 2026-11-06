import { test, expect } from "../fixtures";

test("message lines, arrowheads, and occurrence borders are 1px", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  await expect(page.locator(".occurrence").first()).toBeVisible();

  const actual = await page.evaluate(() => {
    const messageLine = document.querySelector<SVGLineElement>(
      ".message:not(.self) svg line",
    )!;
    const arrowhead = document.querySelector<SVGPathElement>(
      ".message:not(.self) svg[width='7'] path",
    )!;
    const selfLine = document.querySelector<SVGPathElement>(
      ".message.self svg.arrow > path",
    )!;
    const readBoxes = (selector: string) =>
      [...document.querySelectorAll(selector)].map((element) => {
        const r = element.getBoundingClientRect();
        return [r.x, r.y, r.width, r.height];
      });
    return {
      occurrenceBorder: getComputedStyle(document.querySelector(".occurrence")!)
        .borderTopWidth,
      boxes: [
        ".occurrence",
        ".occurrence > .block",
        ".message",
        ".message svg",
        ".message .name",
      ].map(readBoxes),
      messageBorder: getComputedStyle(
        document.querySelector(".message:not(.self)")!,
      ).borderBottomWidth,
      messageLine: getComputedStyle(messageLine).strokeWidth,
      arrowhead: getComputedStyle(arrowhead).strokeWidth,
      selfLine: getComputedStyle(selfLine).strokeWidth,
    };
  });

  expect(actual.occurrenceBorder).toBe("1px");
  expect(actual.messageBorder).toBe("1px");
  expect(actual.messageLine).toBe("1px");
  expect(actual.arrowhead).toBe("1px");
  expect(actual.selfLine).toBe("1px");

  const legacy = await page.evaluate(() => {
    document
      .querySelectorAll<HTMLElement>(".occurrence")
      .forEach((occurrence) => {
        occurrence.style.borderWidth = "2px";
        occurrence.style.padding = "0 0 0 6px";
      });
    return [
      ".occurrence",
      ".occurrence > .block",
      ".message",
      ".message svg",
      ".message .name",
    ].map((selector) =>
      [...document.querySelectorAll(selector)].map((element) => {
        const r = element.getBoundingClientRect();
        return [r.x, r.y, r.width, r.height];
      }),
    );
  });
  expect(actual.boxes).toEqual(legacy);
  await page.reload();
  await expect(page.locator(".sequence-diagram")).toHaveScreenshot(
    "diagram-strokes-1px.png",
  );
});

import { test } from "@playwright/test";
test("dump", async ({ page }) => {
  await page.goto("/e2e/fixtures/probe-conflicts.html");
  await page.waitForSelector(".participant");
  const out = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll("[data-testid],[data-cap],.editable-span-base,[data-interaction-surface]"));
    return els.slice(0,120).map(e => {
      const r = e.getBoundingClientRect();
      return `${e.tagName.toLowerCase()} cls=${(e.getAttribute("class")||"").slice(0,60)} tid=${e.getAttribute("data-testid")} cap=${e.getAttribute("data-cap")} txt=${(e.textContent||"").trim().slice(0,20)} box=${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)}`;
    });
  });
  console.log(out.join("\n"));
});

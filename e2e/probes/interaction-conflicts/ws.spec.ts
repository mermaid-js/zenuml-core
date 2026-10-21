import { test } from "@playwright/test";
test("async label no-op edit", async ({ page }) => {
  await page.goto("/e2e/fixtures/editable-label.html");
  await page.waitForSelector(".participant");
  for (const t of ["Hello Alice", "Hello Bob", "SelfMessage", "method()"]) {
    const l = page.locator(`.message .editable-span-base:text-is("${t}")`).first();
    if (!(await l.count())) { console.log("no label", t); continue; }
    console.log(t, "textContent=", JSON.stringify(await l.evaluate(e => e.textContent)));
    await l.click(); await page.waitForTimeout(100);
    await page.mouse.click(700, 700); await page.waitForTimeout(200);
    console.log("code after no-op edit of", t, ":", JSON.stringify(await page.evaluate(() => (window as any).__lastContentChange ?? null)));
  }
});

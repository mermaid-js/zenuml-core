import { test, expect } from "@playwright/test";

test.describe("EditableSpan ESC Key Behavior", () => {
  test("ESC reverts changes without saving", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/editable-span-test.html");
    await page.waitForLoadState("networkidle");
    
    const span1 = page.locator('[data-testid="test1-span"] .editable-span-base');
    const log1 = page.locator('[data-testid="test1-log"]');
    
    await expect(span1).toHaveText("Original Text");
    
    await span1.dblclick();
    await page.waitForTimeout(100);
    
    await page.keyboard.press("End");
    await page.keyboard.type(" Modified");
    
    await expect(span1).toHaveText("Original Text Modified");
    
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    
    await expect(span1).toHaveText("Original Text");
    
    const logText = await log1.textContent();
    expect(logText).not.toContain("onSave called");
  });

  test("Enter saves changes", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/editable-span-test.html");
    await page.waitForLoadState("networkidle");
    
    const span2 = page.locator('[data-testid="test2-span"] .editable-span-base');
    const log2 = page.locator('[data-testid="test2-log"]');
    
    await expect(span2).toHaveText("Press Enter");
    
    await span2.dblclick();
    await page.waitForTimeout(100);
    
    await page.keyboard.press("End");
    await page.keyboard.type(" Test");
    
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    
    await expect(span2).toHaveText("Press Enter Test");
    
    const logText = await log2.textContent();
    expect(logText).toContain('onSave called: "Press Enter Test"');
  });

  test("Blur saves changes", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/editable-span-test.html");
    await page.waitForLoadState("networkidle");
    
    const span3 = page.locator('[data-testid="test3-span"] .editable-span-base');
    const log3 = page.locator('[data-testid="test3-log"]');
    const blurButton = page.locator('[data-testid="blur-target"]');
    
    await expect(span3).toHaveText("Click Outside");
    
    await span3.dblclick();
    await page.waitForTimeout(100);
    
    await page.keyboard.press("End");
    await page.keyboard.type(" Blur");
    
    await blurButton.click();
    await page.waitForTimeout(300);
    
    await expect(span3).toHaveText("Click Outside Blur");
    
    const logText = await log3.textContent();
    expect(logText).toContain('onSave called: "Click Outside Blur"');
  });

  test("Multiple ESC presses work correctly", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/editable-span-test.html");
    await page.waitForLoadState("networkidle");
    
    const span1 = page.locator('[data-testid="test1-span"] .editable-span-base');
    const log1 = page.locator('[data-testid="test1-log"]');
    
    await span1.dblclick();
    await page.waitForTimeout(100);
    await page.keyboard.press("End");
    await page.keyboard.type(" First");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    
    await expect(span1).toHaveText("Original Text");
    
    await span1.dblclick();
    await page.waitForTimeout(100);
    await page.keyboard.press("End");
    await page.keyboard.type(" Second");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    
    await expect(span1).toHaveText("Original Text");
    
    const logText = await log1.textContent();
    expect(logText).not.toContain("onSave called");
  });

  test("ESC after partial edit reverts correctly", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/editable-span-test.html");
    await page.waitForLoadState("networkidle");
    
    const span1 = page.locator('[data-testid="test1-span"] .editable-span-base');
    
    await span1.dblclick();
    await page.waitForTimeout(100);
    
    await page.keyboard.press("Control+A");
    await page.keyboard.type("Completely New Text");
    
    await page.waitForTimeout(100);
    
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    
    await expect(span1).toHaveText("Original Text");
  });

  test("Tab saves changes", async ({ page }) => {
    await page.goto("http://127.0.0.1:8080/cy/editable-span-test.html");
    await page.waitForLoadState("networkidle");
    
    const span2 = page.locator('[data-testid="test2-span"] .editable-span-base');
    const log2 = page.locator('[data-testid="test2-log"]');
    
    await span2.dblclick();
    await page.waitForTimeout(100);
    
    await page.keyboard.press("End");
    await page.keyboard.type(" Tab");
    
    await page.keyboard.press("Tab");
    await page.waitForTimeout(200);
    
    await expect(span2).toHaveText("Press Enter Tab");
    
    const logText = await log2.textContent();
    expect(logText).toContain('onSave called: "Press Enter Tab"');
  });
});

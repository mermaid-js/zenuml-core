import { expect, test } from "@playwright/test";
import { stat } from "node:fs/promises";

test("workbench keeps rendering and saved controls in the redesigned shell", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Preview" })).toBeVisible();
  await expect(page.locator("#svg-container > svg")).toBeVisible();
  await page.screenshot({ path: "test-results/workbench-desktop-svg.png" });

  const editor = page.locator(".editor-panel");
  const preview = page.locator(".preview-panel");
  const editorBox = await editor.boundingBox();
  const previewBox = await preview.boundingBox();
  expect(editorBox?.width).toBeGreaterThan(450);
  expect(previewBox?.x).toBeGreaterThan((editorBox?.x ?? 0) + (editorBox?.width ?? 0));

  await page.getByRole("button", { name: "DOM", exact: true }).click();
  await expect(page.locator("pre.zenuml")).toContainText("Hello Bob!");
  await page.screenshot({ path: "test-results/workbench-desktop-dom.png" });
  await expect(page).toHaveScreenshot("workbench-desktop-dom.png", {
    animations: "disabled",
    mask: [page.locator("#svg-stats"), page.locator(".CodeMirror-cursor")],
  });
  await expect(page.getByRole("button", { name: "DOM", exact: true })).toHaveAttribute("aria-pressed", "true");
  const participantSwitch = page.getByRole("switch", { name: "Insert participant" });
  await expect(participantSwitch).toHaveAttribute("aria-checked", "true");
  await participantSwitch.click();
  await expect(participantSwitch).toHaveAttribute("aria-checked", "false");
  await page.reload();
  await expect(page.locator("#workspace")).toHaveClass(/mode-dom/);
  await expect(participantSwitch).toHaveAttribute("aria-checked", "false");
});

test("editing refreshes SVG and DOM previews and PNG export downloads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#svg-container > svg")).toBeVisible();
  await page.locator(".CodeMirror").click();
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.insertText("Alice -> Bob: Updated preview");
  await expect(page.locator("#svg-container > svg")).toContainText("Updated preview");
  await page.getByRole("button", { name: "DOM", exact: true }).click();
  await expect(page.locator("pre.zenuml")).toContainText("Updated preview");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sequence-diagram.png");
  expect((await stat((await download.path())!)).size).toBeGreaterThan(100);
});

test("narrow workbench stacks panels without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 760, height: 1320 });
  await page.goto("/");
  const editorBox = await page.locator(".editor-panel").boundingBox();
  const previewBox = await page.locator(".preview-panel").boundingBox();
  expect(previewBox?.y).toBeGreaterThan((editorBox?.y ?? 0) + (editorBox?.height ?? 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(760);
  await expect(page.locator("#svg-container > svg")).toBeVisible();
  await page.screenshot({ path: "test-results/workbench-narrow-svg.png", fullPage: true });
});

test("small viewport and resized desktop preview keep controls in bounds", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => localStorage.setItem("zenuml-workbench-editor-width", "800"));
  await page.goto("/");
  await expect(page.locator("#svg-container > svg")).toBeVisible();
  const desktopOverflow = await page.evaluate(() => {
    const parent = document.querySelector(".capabilities")!.getBoundingClientRect();
    return [...document.querySelectorAll(".capability-switch")].some((button) => button.getBoundingClientRect().right > parent.right);
  });
  expect(desktopOverflow).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#svg-container > svg")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "test-results/workbench-phone-svg.png", fullPage: true });
});

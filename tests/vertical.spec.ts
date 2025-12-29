import { test, expect } from "./fixtures";

test.describe("Rendering", () => {
  test("vertical-1", async ({ page }) => {
    await page.goto("/cy/vertical-1.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-1.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-2", async ({ page }) => {
    await page.goto("/cy/vertical-2.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-2.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-3", async ({ page }) => {
    await page.goto("/cy/vertical-3.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-3.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-4", async ({ page }) => {
    await page.goto("/cy/vertical-4.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-4.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-5", async ({ page }) => {
    await page.goto("/cy/vertical-5.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-5.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-6", async ({ page }) => {
    await page.goto("/cy/vertical-6.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-6.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-7", async ({ page }) => {
    await page.goto("/cy/vertical-7.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-7.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-8", async ({ page }) => {
    await page.goto("/cy/vertical-8.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-8.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-9", async ({ page }) => {
    await page.goto("/cy/vertical-9.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-9.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-10", async ({ page }) => {
    await page.goto("/cy/vertical-10.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-10.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });

  test("vertical-11", async ({ page }) => {
    await page.goto("/cy/vertical-11.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot("vertical-11.png", {
      threshold: 0.02,
      fullPage: true,
    });
  });
});

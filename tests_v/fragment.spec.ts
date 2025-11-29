import { test, expect } from "./fixtures";
import { initVerticalDebug, writeVerticalDebug } from "../tests/utils/verticalDebug";

test.describe("Fragments", () => {
  test("single-branch opt", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-opt.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-opt.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-opt");
      }
    }
  });

  test("two-branch alt", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-alt.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-alt.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-alt");
      }
    }
  });

  test("loop fragment", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-loop.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-loop.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-loop");
      }
    }
  });

  test("par fragment", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-par.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-par.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-par");
      }
    }
  });

  test("nested alt with opt and loop", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-alt-nested.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-alt-nested.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-alt-nested");
      }
    }
  });

  test("section fragment", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-section.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-section.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-section");
      }
    }
  });

  test("critical fragment", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-critical.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-critical.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-critical");
      }
    }
  });

  test("try/catch fragment", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-tcf.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-tcf.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-tcf");
      }
    }
  });

  test("par with nested alt", async ({ page }) => {
    const didEnableDebug = await initVerticalDebug(page);
    await page.goto("http://127.0.0.1:8080/cy/fragment-par-alt.html");

    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    try {
      await expect(page).toHaveScreenshot("fragment-par-alt.png", {
        threshold: 0.02,
        fullPage: true,
      });
    } finally {
      if (didEnableDebug) {
        await writeVerticalDebug(page, "fragment-par-alt");
      }
    }
  });
});

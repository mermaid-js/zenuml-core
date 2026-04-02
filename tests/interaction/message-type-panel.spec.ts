import { test, expect } from "../fixtures";

test.describe("Message Type Panel", () => {
  test("switches an async message to a return message and updates DSL", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });

    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page.locator(".interaction.async .message").filter({
      hasText: "Hello Bob",
    });
    await asyncMessage.click();

    const returnButton = page.getByTestId("message-type-return");
    await expect(returnButton).toBeVisible();
    await returnButton.click();

    await expect(page.locator(".interaction.return .message .editable-span-base").filter({
      hasText: "Hello Bob",
    })).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('.interaction.return .message[data-selected="true"]').filter({
        hasText: "Hello Bob",
      }),
    ).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("message-type-return")).toBeVisible();

    expect(logs.some((line) => line.includes("D-->C: Hello Bob"))).toBe(true);
  });

  test("switches a return message back to async and updates DSL", async ({ page }) => {
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });

    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const returnMessage = page.locator(".interaction.return .message").filter({
      hasText: "Response payload",
    });
    await returnMessage.click();

    const asyncButton = page.getByTestId("message-type-async");
    await expect(asyncButton).toBeVisible();
    await asyncButton.click();

    await expect(page.locator(".interaction.async .message .editable-span-base").filter({
      hasText: "Response payload",
    })).toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('.interaction.async .message[data-selected="true"]').filter({
        hasText: "Response payload",
      }),
    ).toHaveAttribute("data-selected", "true");
    await expect(page.getByTestId("message-type-async")).toBeVisible();

    expect(logs.some((line) => line.includes("D->C: Response payload"))).toBe(true);
  });

  test("switches a sync message to async and back to sync (roundtrip)", async ({ page }) => {
    await page.goto("/e2e/fixtures/type-switch.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const syncMessage = page.locator(".interaction.sync .message").filter({
      hasText: "login",
    });
    await syncMessage.click();

    const asyncButton = page.getByTestId("message-type-async");
    await expect(asyncButton).toBeVisible();
    await asyncButton.click();

    await expect(page.locator(".interaction.async .message .editable-span-base").filter({
      hasText: "login",
    })).toBeVisible({ timeout: 10000 });

    await page.locator(".interaction.async .message").filter({
      hasText: "login",
    }).click();

    const syncButton = page.getByTestId("message-type-sync");
    await expect(syncButton).toBeVisible();
    await syncButton.click();

    await expect(page.locator(".interaction.sync .message .editable-span-base").filter({
      hasText: "login",
    })).toBeVisible({ timeout: 10000 });

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toContain("A->B.login()");
  });

  test("switches an async message with method-like content to sync", async ({ page }) => {
    await page.goto("/e2e/fixtures/type-switch.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page.locator(".interaction.async .message").filter({
      hasText: "validate",
    });
    await asyncMessage.click();

    const syncButton = page.getByTestId("message-type-sync");
    await expect(syncButton).toBeVisible();
    await syncButton.click();

    await expect(page.locator(".interaction.sync .message .editable-span-base").filter({
      hasText: "validate",
    })).toBeVisible({ timeout: 10000 });

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toContain("B->C.validate()");
  });

  test("switches a sync message to return and updates DSL", async ({ page }) => {
    await page.goto("/e2e/fixtures/type-switch.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const syncMessage = page.locator(".interaction.sync .message").filter({
      hasText: "login",
    });
    await syncMessage.click();

    const returnButton = page.getByTestId("message-type-return");
    await expect(returnButton).toBeVisible();
    await returnButton.click();

    await expect(page.locator(".interaction.return .message .editable-span-base").filter({
      hasText: "login",
    })).toBeVisible({ timeout: 10000 });

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toContain("A-->B: login");
  });

  test("switches a return message to sync and updates DSL", async ({ page }) => {
    await page.goto("/e2e/fixtures/type-switch.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const returnMessage = page.locator(".interaction.return .message").filter({
      hasText: "token",
    });
    await returnMessage.click();

    const syncButton = page.getByTestId("message-type-sync");
    await expect(syncButton).toBeVisible();
    await syncButton.click();

    await expect(page.locator(".interaction.sync .message .editable-span-base").filter({
      hasText: "token",
    })).toBeVisible({ timeout: 10000 });

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toContain("B->A.token()");
  });

  test("disables sync button for async messages with spaces in content", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const asyncMessage = page.locator(".interaction.async .message").filter({
      hasText: "Hello Bob",
    });
    await asyncMessage.click();

    const syncButton = page.getByTestId("message-type-sync");
    await expect(syncButton).toBeVisible();
    await expect(syncButton).toHaveClass(/opacity-40/);
    await expect(syncButton).toHaveClass(/pointer-events-none/);
  });

  test("highlights creation button when a creation message is selected", async ({ page }) => {
    await page.goto("/e2e/fixtures/editable-label.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const creationMessage = page.locator(".interaction.creation .message");
    await creationMessage.click();

    const creationButton = page.getByTestId("message-type-creation");
    await expect(creationButton).toBeVisible();
    await expect(creationButton).toHaveAttribute("aria-pressed", "true");

    // All transform buttons should be disabled for creation messages
    await expect(page.getByTestId("message-type-sync")).toHaveClass(/opacity-40/);
    await expect(page.getByTestId("message-type-async")).toHaveClass(/opacity-40/);
    await expect(page.getByTestId("message-type-return")).toHaveClass(/opacity-40/);
  });

  test("converts a sync message to creation and updates DSL", async ({ page }) => {
    await page.goto("/e2e/fixtures/type-switch.html");
    await expect(page.locator(".privacy>span>svg")).toBeVisible({
      timeout: 5000,
    });

    const syncMessage = page.locator(".interaction.sync .message").filter({
      hasText: "login",
    });
    await syncMessage.click();

    const creationButton = page.getByTestId("message-type-creation");
    await expect(creationButton).toBeVisible();
    await creationButton.click();

    await expect(page.locator(".interaction.creation")).toBeVisible({ timeout: 10000 });

    await expect.poll(async () =>
      page.evaluate(() => (window as any).__lastContentChange ?? null),
    ).toContain("new B(login())");
  });
});

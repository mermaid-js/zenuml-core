import { expect, test } from "@playwright/test";

const lastCode = (page: import("@playwright/test").Page) =>
  page.evaluate(() => (window as any).__lastContentChange ?? "");

test.describe("participant editor", () => {
  test("edits every declaration attribute in one visit and stays open", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    const box = await participant.boundingBox();
    expect(box).toBeTruthy();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });

    const panel = page.getByTestId("participant-style-panel");
    const preview = panel.getByTestId("participant-dsl-preview");
    await expect(panel).toBeVisible();
    await expect(preview).toHaveText("A");

    await panel.getByRole("button", { name: "Set type to Database" }).click();
    await expect(panel).toBeVisible();
    await expect(preview).toHaveText("@Database A");

    await panel.getByRole("button", { name: "Set color to Blue" }).click();
    await expect(preview).toHaveText("@Database A #3b82f6");

    const stereotype = panel.getByLabel("Stereotype");
    await stereotype.fill("Service");
    await stereotype.press("Enter");
    await expect(preview).toHaveText("@Database <<Service>> A #3b82f6");

    const label = panel.getByLabel("Display as");
    await label.fill("Alice Smith");
    await label.press("Enter");
    await expect(preview).toHaveText(
      '@Database <<Service>> A as "Alice Smith" #3b82f6',
    );

    const hex = panel.getByLabel("Custom hex color");
    await hex.fill("ff00aa");
    await hex.press("Enter");
    await expect(preview).toHaveText(
      '@Database <<Service>> A as "Alice Smith" #ff00aa',
    );

    await expect
      .poll(() => lastCode(page))
      .toBe('@Database <<Service>> A as "Alice Smith" #ff00aa\nC\nA->C: Ping');
  });

  test("finds cloud icons by search and applies the key as the type", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    const box = await participant.boundingBox();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });

    const panel = page.getByTestId("participant-style-panel");
    const search = panel.getByRole("combobox", { name: "Search icons" });
    await search.fill("s3");
    const options = panel.getByRole("option");
    await expect(options.first()).toContainText("@s3");
    await search.press("ArrowDown");
    await search.press("Enter");

    await expect(panel.getByTestId("participant-dsl-preview")).toHaveText(
      "@s3glacier A",
    );
    await expect(options).toHaveCount(0);
    await expect(participant.locator("svg").first()).toBeVisible();
  });

  test("renames the identifier everywhere, even with a display label", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    const box = await participant.boundingBox();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });

    const panel = page.getByTestId("participant-style-panel");
    const label = panel.getByLabel("Display as");
    await label.fill("Alice Smith");
    await label.press("Enter");

    const name = panel.getByLabel("Name");
    await name.fill("Alice");
    await name.press("Enter");

    await expect(
      page.locator('.participant[data-participant-id="Alice"]'),
    ).toBeVisible();
    await expect
      .poll(() => lastCode(page))
      .toBe('Alice as "Alice Smith"\nC\nAlice->C: Ping');
    await expect(panel.getByLabel("Name")).toHaveValue("Alice");
  });

  test("closes with Escape, the close button and outside clicks", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    const box = await participant.boundingBox();
    const open = () =>
      participant.click({ position: { x: 3, y: box!.height - 3 } });
    const panel = page.getByTestId("participant-style-panel");

    await open();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    await open();
    await expect(panel).toBeVisible();
    await panel.getByRole("button", { name: "Close" }).click();
    await expect(panel).toHaveCount(0);

    await open();
    // The outside-click listener attaches once the panel is open; clicking
    // before that lets the panel open after the click and stay open.
    await expect(panel).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(panel).toHaveCount(0);
  });

  const openPanel = async (
    page: import("@playwright/test").Page,
    id: string,
  ) => {
    const participant = page.locator(
      `.participant[data-participant-id="${id}"]`,
    );
    const box = await participant.boundingBox();
    expect(box).toBeTruthy();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });
  };

  test("does not carry an uncommitted draft over to another participant", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    await panel.getByLabel("Display as").fill("Alice");

    await openPanel(page, "C");
    await expect(panel).toHaveAttribute("aria-label", "Edit participant C");
    const label = panel.getByLabel("Display as");
    await expect(label).toHaveValue("");
    await label.focus();
    await label.press("Enter");

    await expect.poll(() => lastCode(page)).toContain("as Alice");
    expect(await lastCode(page)).not.toContain("C as Alice");
  });

  test("Escape in a text field discards the draft and closes the panel", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const label = panel.getByLabel("Display as");
    await label.fill("Alice");
    await label.press("Escape");

    await expect(panel).toHaveCount(0);
    await page.waitForTimeout(200);
    expect(await lastCode(page)).toBe("");
  });

  test("shows an alert when a rename would merge two participants", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const name = panel.getByLabel("Name");
    await name.fill("C");
    await name.press("Enter");

    await expect(panel.getByRole("alert")).toHaveText('"C" already exists');
    await expect(name).toHaveValue("C");
    await expect(panel).toBeVisible();
    expect(await lastCode(page)).toBe("");
  });

  test("Escape between pointerdown and pointerup does not reselect the clicked participant", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const label = panel.getByLabel("Display as");
    await label.fill("Alice");
    await label.press("Enter");
    await expect(panel.getByTestId("participant-dsl-preview")).toContainText(
      "Alice",
    );
    // A second draft of the same width: committing it on click-away rebuilds
    // the diagram and detaches C without moving it.
    await label.fill("Alicf");
    const cBox = await page
      .locator('.participant[data-participant-id="C"]')
      .boundingBox();
    expect(cBox).toBeTruthy();

    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height - 3,
    );
    await page.mouse.down();
    await page.keyboard.press("Escape");
    await page.mouse.up();

    await page.waitForTimeout(300);
    await expect(panel).toHaveCount(0);
  });

  test("click-away keeps the panel, draft and alert when the rename is rejected", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const name = panel.getByLabel("Name");
    await name.fill("C");
    await page.mouse.click(5, 5);

    await expect(panel).toBeVisible();
    await expect(panel.getByRole("alert")).toHaveText('"C" already exists');
    await expect(name).toHaveValue("C");
    await expect(name).toBeFocused();
    expect(await lastCode(page)).toBe("");
  });
});

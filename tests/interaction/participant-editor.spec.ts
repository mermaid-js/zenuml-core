import { lastContentChange } from "../fixtures";
import { expect, test, type Page } from "@playwright/test";

const lastCode = (page: Page) => lastContentChange(page, "")();

const openPanel = async (page: Page, id: string) => {
  const participant = page.locator(`.participant[data-participant-id="${id}"]`);
  const box = await participant.boundingBox();
  expect(box).toBeTruthy();
  await participant.click({ position: { x: 3, y: box!.height - 3 } });
};

// Playwright name matching is a case-insensitive substring by default, so
// "Blue" would also match "Deep blue" and "Set color (Blue)".
const typePicker = (page: Page) =>
  page.getByRole("dialog", { name: "Participant type", exact: true });
const colorPicker = (page: Page) =>
  page.getByRole("dialog", { name: "Participant colour", exact: true });
const iconSlot = (page: Page) =>
  page
    .getByTestId("participant-style-panel")
    .getByRole("button", { name: /^Set icon/ });
const colorSlot = (page: Page) =>
  page
    .getByTestId("participant-style-panel")
    .getByRole("button", { name: /^Set color/ });

const pickType = async (page: Page, label: string) => {
  await iconSlot(page).click();
  await typePicker(page)
    .getByRole("button", { name: label, exact: true })
    .click();
};
const pickColor = async (page: Page, name: string) => {
  await colorSlot(page).click();
  await colorPicker(page).getByRole("button", { name, exact: true }).click();
};

test.describe("participant editor", () => {
  test("shows the pill, both slots and the name row, with no none options", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");

    await expect(
      panel.getByRole("button", { name: "Add stereotype", exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Set icon", exact: true }),
    ).toBeVisible();
    await expect(
      panel.getByRole("button", { name: "Set color (none)", exact: true }),
    ).toBeVisible();
    await expect(panel.getByLabel("Name", { exact: true })).toHaveValue("A");
    await expect(panel.getByLabel("Display as", { exact: true })).toHaveValue(
      "",
    );
    // Empty slots have no clear half.
    await expect(panel.getByRole("button", { name: /^Remove/ })).toHaveCount(0);

    // The DSL line shows only while the editor is hovered or focused.
    const dsl = panel.getByTestId("participant-dsl-preview");
    await page.mouse.move(600, 600);
    await expect(dsl).toBeHidden();
    await panel.getByTestId("participant-name-row").hover();
    await expect(dsl).toBeVisible();
    await expect(dsl).toHaveText("A");

    await iconSlot(page).click();
    await expect(typePicker(page)).toBeVisible();
    await colorSlot(page).click();
    await expect(colorPicker(page)).toBeVisible();
    await expect(typePicker(page)).toHaveCount(0);
    await expect(page.getByText("Default", { exact: true })).toHaveCount(0);
    await expect(page.getByText("No color")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /no colou?r|remove colou?r/i }),
    ).toHaveCount(0);
  });

  test("edits every declaration attribute in one visit and stays open", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");

    const panel = page.getByTestId("participant-style-panel");
    const preview = panel.getByTestId("participant-dsl-preview");
    await expect(panel).toBeVisible();
    await expect(preview).toHaveText("A");

    await pickType(page, "Database");
    await expect(panel).toBeVisible();
    await expect(preview).toHaveText("@Database A");

    await pickColor(page, "Blue");
    await expect(preview).toHaveText("@Database A #93c5fd");

    await panel
      .getByRole("button", { name: "Add stereotype", exact: true })
      .click();
    const stereotype = panel.getByLabel("Stereotype", { exact: true });
    await stereotype.fill("Service");
    await stereotype.press("Enter");
    await expect(preview).toHaveText("@Database <<Service>> A #93c5fd");

    const label = panel.getByLabel("Display as", { exact: true });
    await label.fill("Alice Smith");
    await label.press("Enter");
    await expect(preview).toHaveText(
      '@Database <<Service>> A as "Alice Smith" #93c5fd',
    );

    await colorSlot(page).click();
    const hex = colorPicker(page).getByLabel("Custom hex color");
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
    await openPanel(page, "A");

    const panel = page.getByTestId("participant-style-panel");
    await iconSlot(page).click();
    const search = typePicker(page).getByRole("combobox", {
      name: "Search icons",
    });
    await search.fill("s3");
    const options = typePicker(page).getByRole("option");
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
    await openPanel(page, "A");

    const panel = page.getByTestId("participant-style-panel");
    const label = panel.getByLabel("Display as", { exact: true });
    await label.fill("Alice Smith");
    await label.press("Enter");

    const name = panel.getByLabel("Name", { exact: true });
    await name.fill("Alice");
    await name.press("Enter");

    await expect(
      page.locator('.participant[data-participant-id="Alice"]'),
    ).toBeVisible();
    await expect
      .poll(() => lastCode(page))
      .toBe('Alice as "Alice Smith"\nC\nAlice->C: Ping');
    await expect(panel.getByLabel("Name", { exact: true })).toHaveValue(
      "Alice",
    );
  });

  test("closes with Escape and outside clicks", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const panel = page.getByTestId("participant-style-panel");

    await openPanel(page, "A");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    await openPanel(page, "A");
    // The outside-click listener attaches once the panel is open; clicking
    // before that lets the panel open after the click and stay open.
    await expect(panel).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(panel).toHaveCount(0);
  });

  test("Escape in an open picker closes only the picker", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const panel = page.getByTestId("participant-style-panel");
    await openPanel(page, "A");

    // Focus on the slot that opened the picker.
    await colorSlot(page).click();
    await expect(colorPicker(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(colorPicker(page)).toHaveCount(0);
    await expect(panel).toBeVisible();

    // Focus inside the picker: a chip, then the search field.
    await iconSlot(page).click();
    await typePicker(page)
      .getByRole("button", { name: "Actor", exact: true })
      .focus();
    await page.keyboard.press("Escape");
    await expect(typePicker(page)).toHaveCount(0);
    await expect(panel).toBeVisible();

    await iconSlot(page).click();
    await typePicker(page).getByRole("combobox").focus();
    await page.keyboard.press("Escape");
    await expect(typePicker(page)).toHaveCount(0);
    await expect(panel).toBeVisible();

    // A hex draft discarded with Escape is not committed.
    await colorSlot(page).click();
    await colorPicker(page).getByLabel("Custom hex color").fill("ff00aa");
    await page.keyboard.press("Escape");
    await expect(colorPicker(page)).toHaveCount(0);
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await page.waitForTimeout(200);
    expect(await lastCode(page)).toBe("");
  });

  test("keyboard: picking or Escape returns focus to the colour slot", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const panel = page.getByTestId("participant-style-panel");
    await openPanel(page, "A");

    await colorSlot(page).focus();
    await page.keyboard.press("Enter");
    await expect(colorPicker(page)).toBeVisible();
    await expect(colorPicker(page).locator(":focus")).toHaveCount(1);

    await page.keyboard.press("Enter");
    await expect(colorPicker(page)).toHaveCount(0);
    await expect(colorSlot(page)).toBeFocused();
    await expect(panel).toBeVisible();

    // Escape closes the picker, focus returns, the next Escape closes the editor.
    await page.keyboard.press("Enter");
    await expect(colorPicker(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(colorPicker(page)).toHaveCount(0);
    await expect(colorSlot(page)).toBeFocused();
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  });

  test("keyboard: picking or Escape returns focus to the type slot", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const panel = page.getByTestId("participant-style-panel");
    await openPanel(page, "A");

    await iconSlot(page).focus();
    await page.keyboard.press("Enter");
    await expect(typePicker(page)).toBeVisible();
    await expect(typePicker(page).locator(":focus")).toHaveCount(1);

    await page.keyboard.press("Enter");
    await expect(typePicker(page)).toHaveCount(0);
    await expect(iconSlot(page)).toBeFocused();
    await expect(panel).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(typePicker(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(typePicker(page)).toHaveCount(0);
    await expect(iconSlot(page)).toBeFocused();
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
  });

  test("hovering a swatch previews the box without editing the code", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    await openPanel(page, "A");
    const before = await participant.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );

    await colorSlot(page).click();
    const deepBlue = colorPicker(page).getByRole("button", {
      name: "Deep blue",
      exact: true,
    });
    await deepBlue.hover();
    await expect(participant).toHaveCSS("background-color", "rgb(29, 78, 216)");
    await expect(participant).toHaveCSS("color", "rgb(255, 255, 255)");
    expect(await lastCode(page)).toBe("");

    // Leaving the swatches drops the preview.
    await page.mouse.move(600, 600);
    await expect(participant).toHaveCSS("background-color", before);
    expect(await lastCode(page)).toBe("");

    await deepBlue.click();
    await expect.poll(() => lastCode(page)).toBe("A #1d4ed8\nC\nA->C: Ping");
    await expect(participant).toHaveCSS("background-color", "rgb(29, 78, 216)");
  });

  test("the split-slot clear half removes the type and the colour", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const preview = panel.getByTestId("participant-dsl-preview");

    await pickType(page, "Database");
    await pickColor(page, "Deep blue");
    await expect(preview).toHaveText("@Database A #1d4ed8");

    await iconSlot(page).hover();
    await panel
      .getByRole("button", { name: "Remove type", exact: true })
      .click();
    await expect(preview).toHaveText("A #1d4ed8");

    await colorSlot(page).hover();
    await panel
      .getByRole("button", { name: "Remove colour", exact: true })
      .click();
    await expect(preview).toHaveText("A");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("button", { name: /^Remove/ })).toHaveCount(0);
  });

  test("Delete or Backspace on a focused filled slot clears it", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const preview = panel.getByTestId("participant-dsl-preview");

    await pickType(page, "Database");
    await pickColor(page, "Rose");
    await expect(preview).toHaveText("@Database A #fda4af");

    await iconSlot(page).focus();
    await page.keyboard.press("Delete");
    await expect(preview).toHaveText("A #fda4af");

    await colorSlot(page).focus();
    await page.keyboard.press("Backspace");
    await expect(preview).toHaveText("A");
    await expect(panel).toBeVisible();
  });

  test("stereotype pill round trip", async ({ page }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const preview = panel.getByTestId("participant-dsl-preview");
    const placeholder = panel.getByRole("button", {
      name: "Add stereotype",
      exact: true,
    });

    await expect(placeholder).toHaveText("«stereotype»");
    await placeholder.click();
    const input = panel.getByLabel("Stereotype", { exact: true });
    await expect(input).toBeFocused();
    await input.fill("Service");
    await input.press("Enter");
    await expect(preview).toHaveText("<<Service>> A");
    await expect(placeholder).toHaveCount(0);

    await input.fill("");
    await input.press("Enter");
    await expect(preview).toHaveText("A");
    await expect(placeholder).toBeVisible();
    await expect.poll(() => lastCode(page)).toBe("A\nC\nA->C: Ping");
  });

  test("dims the diagram with a click-through mask above it", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const mask = page.getByTestId("participant-editor-mask");
    await expect(mask).toHaveCount(0);

    await openPanel(page, "A");
    await expect(mask).toBeVisible();
    await expect(mask).toHaveCSS("background-color", "rgba(15, 23, 42, 0.32)");
    await expect(mask).toHaveCSS("pointer-events", "none");

    // Clicks pass through the mask and reselect another participant.
    const panel = page.getByTestId("participant-style-panel");
    await openPanel(page, "C");
    await expect(panel).toHaveAttribute("aria-label", "Edit participant C");
    await expect(mask).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(mask).toHaveCount(0);
  });

  test("centres the name row, DSL tooltip and error on the participant box", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 700 });
    await page.goto("/e2e/fixtures/insert-participant.html");
    const panel = page.getByTestId("participant-style-panel");
    const centreX = async (loc: ReturnType<Page["locator"]>) => {
      const b = await loc.boundingBox();
      expect(b).toBeTruthy();
      return b!.x + b!.width / 2;
    };

    // Widen A with a long display name so box and row widths differ.
    await openPanel(page, "A");
    const label = panel.getByLabel("Display as", { exact: true });
    await label.fill("A very long display name for Alice");
    await label.press("Enter");
    await expect.poll(() => lastCode(page)).toContain("as");
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    for (const id of ["C", "A"]) {
      await openPanel(page, id);
      await expect(panel).toBeVisible();
      const box = page.locator(`.participant[data-participant-id="${id}"]`);
      const row = panel.getByTestId("participant-name-row");
      // Show the hover-only DSL tooltip, then trigger the error block.
      await row.hover();
      const dsl = panel.getByTestId("participant-dsl-preview");
      await expect(dsl).toBeVisible();
      const name = panel.getByLabel("Name", { exact: true });
      await name.fill(id === "A" ? "C" : "A");
      await name.press("Enter");
      const alert = panel.getByRole("alert");
      await expect(alert).toBeVisible();

      const boxX = await centreX(box);
      const rowBox = (await row.boundingBox())!;
      // Skip clamped cases: a row that cannot fit centred is pushed inward.
      const clamped = boxX - rowBox.width / 2 < 8;
      expect(clamped, `${id} row is clamped`).toBe(false);
      expect(Math.abs((await centreX(row)) - boxX), `${id} row`).toBeLessThan(
        1,
      );
      expect(Math.abs((await centreX(dsl)) - boxX), `${id} dsl`).toBeLessThan(
        1,
      );
      expect(
        Math.abs((await centreX(alert)) - boxX),
        `${id} alert`,
      ).toBeLessThan(1);
      await name.press("Escape");
      await expect(panel).toHaveCount(0);
    }
  });

  test("hides the name row, tooltip and error while a picker is open", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const panel = page.getByTestId("participant-style-panel");
    await openPanel(page, "A");
    const row = panel.getByTestId("participant-name-row");
    const dsl = panel.getByTestId("participant-dsl-preview");

    // Produce an error so all three pieces exist before a picker opens.
    const name = panel.getByLabel("Name", { exact: true });
    await name.fill("C");
    await name.press("Enter");
    await row.hover();
    await expect(panel.getByRole("alert")).toBeVisible();
    await expect(dsl).toBeVisible();

    for (const [slot, picker] of [
      [iconSlot, typePicker],
      [colorSlot, colorPicker],
    ] as const) {
      await slot(page).click();
      await expect(picker(page)).toBeVisible();
      await expect(row).toHaveCount(0);
      await expect(dsl).toHaveCount(0);
      await expect(panel.getByRole("alert")).toHaveCount(0);

      // Escape closes the picker and the name row returns.
      await page.keyboard.press("Escape");
      await expect(picker(page)).toHaveCount(0);
      await expect(row).toBeVisible();
      await expect(panel).toBeVisible();
    }

    // Picking also brings the row back.
    await iconSlot(page).click();
    await expect(row).toHaveCount(0);
    await typePicker(page)
      .getByRole("button", { name: "Database", exact: true })
      .click();
    await expect(typePicker(page)).toHaveCount(0);
    await expect(row).toBeVisible();

    await colorSlot(page).click();
    await expect(row).toHaveCount(0);
    await colorPicker(page)
      .getByRole("button", { name: "Blue", exact: true })
      .click();
    await expect(colorPicker(page)).toHaveCount(0);
    await expect(row).toBeVisible();
  });

  test("does not carry an uncommitted draft over to another participant", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    await panel.getByLabel("Display as", { exact: true }).fill("Alice");

    await openPanel(page, "C");
    await expect(panel).toHaveAttribute("aria-label", "Edit participant C");
    const label = panel.getByLabel("Display as", { exact: true });
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
    const label = panel.getByLabel("Display as", { exact: true });
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
    const name = panel.getByLabel("Name", { exact: true });
    await name.fill("C");
    await name.press("Enter");

    await expect(panel.getByRole("alert")).toHaveText('"C" already exists');
    await expect(name).toHaveValue("C");
    await expect(panel).toBeVisible();
    expect(await lastCode(page)).toBe("");
  });

  test("Escape between pointerdown and pointerup does not reopen the edited participant", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    await panel.getByLabel("Display as", { exact: true }).fill("Alice");
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
    // Whatever the release does to C, the edited participant stays closed.
    await expect(
      page.getByRole("dialog", { name: "Edit participant A" }),
    ).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("click-away discards a rejected rename and closes the panel", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    await panel.getByLabel("Name", { exact: true }).fill("C");
    await page.mouse.click(5, 5);

    await expect(panel).toHaveCount(0);
    expect(await lastCode(page)).toBe("");

    await openPanel(page, "A");
    await expect(panel.getByLabel("Name", { exact: true })).toHaveValue("A");
    await expect(panel.getByRole("alert")).toHaveCount(0);
  });

  test("Enter on a rejected rename keeps focus, the draft and the alert", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");
    const name = panel.getByLabel("Name", { exact: true });
    await name.fill("C");
    await name.press("Enter");

    await expect(name).toBeFocused();
    await expect(name).toHaveValue("C");
    await expect(panel.getByRole("alert")).toHaveText('"C" already exists');
    expect(await lastCode(page)).toBe("");
  });

  test("a mouse pick leaves a plain colour slot, not the split pill", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");

    await pickColor(page, "Blue");
    await page.mouse.move(600, 600);
    await expect(
      panel.getByRole("button", { name: "Remove colour" }),
    ).toHaveCount(0);
    // Keyboard flow is kept: focus returns to the slot.
    await expect(colorSlot(page)).toBeFocused();
  });

  test("keyboard focus on a filled colour slot splits it and rings the wrapper", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await openPanel(page, "A");
    const panel = page.getByTestId("participant-style-panel");

    await pickColor(page, "Blue");
    await page.mouse.move(600, 600);
    await colorSlot(page).evaluate((el) => (el as HTMLElement).blur());
    // A key press switches Chromium to keyboard modality, so focus() is :focus-visible.
    await page.keyboard.press("Shift");
    await colorSlot(page).focus();

    await expect(
      panel.getByRole("button", { name: "Remove colour" }),
    ).toBeVisible();
    const shadows = await colorSlot(page).evaluate((el) => ({
      main: getComputedStyle(el).boxShadow,
      wrapper: getComputedStyle(el.parentElement!).boxShadow,
    }));
    expect(shadows.main).toBe("none");
    expect(shadows.wrapper).not.toBe("none");
  });
});

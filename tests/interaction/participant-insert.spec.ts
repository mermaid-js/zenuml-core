import { test, expect, openDiagram, lastContentChange } from "../fixtures";

test.describe("Participant Insert", () => {
  test("participant borders are 1px without changing box or label geometry", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    await expect(
      page.locator("[data-lifeline-id=A] .participant"),
    ).toBeVisible();
    await expect(
      page.locator("[data-lifeline-id=A] .participant"),
    ).toHaveScreenshot("participant-border-1px.png");

    const before = await page.evaluate(() => {
      const selectors = [
        "[data-lifeline-id=A] .participant",
        "[data-lifeline-id=A] .participant .name",
        "[data-lifeline-id=A] .line",
        "[data-lifeline-id=C] .participant",
        ".message-layer .message",
      ];
      const box = (selector: string) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        return rect && [rect.x, rect.y, rect.width, rect.height];
      };
      return {
        boxes: selectors.map(box),
        border: getComputedStyle(
          document.querySelector("[data-lifeline-id=A] .participant")!,
        ).borderTopWidth,
      };
    });

    await page.locator(".participant").evaluateAll((participants) => {
      for (const participant of participants as HTMLElement[]) {
        participant.style.borderWidth = "2px";
        participant.style.padding = "0 2px";
      }
    });

    const oldBoxes = await page.evaluate(() => {
      const selectors = [
        "[data-lifeline-id=A] .participant",
        "[data-lifeline-id=A] .participant .name",
        "[data-lifeline-id=A] .line",
        "[data-lifeline-id=C] .participant",
        ".message-layer .message",
      ];
      return selectors.map((selector) => {
        const rect = document.querySelector(selector)?.getBoundingClientRect();
        return rect && [rect.x, rect.y, rect.width, rect.height];
      });
    });

    expect(before.border).toBe("1px");
    expect(before.boxes.every(Boolean)).toBe(true);
    expect(before.boxes).toEqual(oldBoxes);
  });

  test("shows insert button on hover between participants", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/insert-participant.html");

    const button = page.getByTestId("participant-insert-button-0");
    await expect(button).toHaveCSS("opacity", "0");

    const participantA = page.locator("[data-lifeline-id=A] .participant");
    const participantC = page.locator("[data-lifeline-id=C] .participant");
    const aBox = await participantA.boundingBox();
    const cBox = await participantC.boundingBox();
    const midX = (aBox!.x + aBox!.width + cBox!.x) / 2;
    const midY = aBox!.y + aBox!.height / 2;
    await page.mouse.move(midX, midY);

    await expect(button).not.toHaveCSS("opacity", "0");
  });

  test("one-click inserts a participant between two lifelines and rewrites DSL", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/insert-participant.html");

    const participantA = page.locator("[data-lifeline-id=A] .participant");
    const participantC = page.locator("[data-lifeline-id=C] .participant");
    const aBox = await participantA.boundingBox();
    const cBox = await participantC.boundingBox();
    const midX = (aBox!.x + aBox!.width + cBox!.x) / 2;
    const midY = aBox!.y + aBox!.height / 2;
    await page.mouse.move(midX, midY);

    const addButton = page.getByTestId("participant-insert-button-0");
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(page.locator('[data-participant-id="B"]')).toBeVisible({
      timeout: 10000,
    });

    const geometry = await page.evaluate(() => {
      const read = (selector: string) =>
        document.querySelector(selector)?.getBoundingClientRect();
      return {
        a: read("[data-lifeline-id=A] .participant"),
        b: read("[data-lifeline-id=B] .participant"),
        c: read("[data-lifeline-id=C] .participant"),
      };
    });

    expect(geometry.a).toBeTruthy();
    expect(geometry.b).toBeTruthy();
    expect(geometry.c).toBeTruthy();
    expect(geometry.b!.left).toBeGreaterThan(geometry.a!.left);
    expect(geometry.b!.left).toBeLessThan(geometry.c!.left);

    await expect.poll(lastContentChange(page)).toContain("A\nB\nC\nA->C: Ping");
  });

  test("hides the insert buttons while one participant is selected", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/insert-participant.html");
    const participant = page.locator('.participant[data-participant-id="A"]');
    await expect(participant).toBeVisible({ timeout: 5000 });
    const buttons = page.locator(
      '[data-testid^="participant-insert-button-"], [data-testid="participant-prepend-button"], [data-testid="participant-append-button"]',
    );
    await expect(buttons.first()).toBeAttached();

    const box = await participant.boundingBox();
    await participant.click({ position: { x: 3, y: box!.height - 3 } });
    await expect(page.getByTestId("participant-style-panel")).toBeVisible();
    await expect(buttons).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("participant-style-panel")).toHaveCount(0);
    await expect(buttons.first()).toBeAttached();
  });

  test("insert button is vertically centered with participant headers", async ({
    page,
  }) => {
    await openDiagram(page, "/e2e/fixtures/insert-participant.html");

    const participantA = page.locator("[data-lifeline-id=A] .participant");
    const participantC = page.locator("[data-lifeline-id=C] .participant");
    const aBox = await participantA.boundingBox();
    const cBox = await participantC.boundingBox();
    const midX = (aBox!.x + aBox!.width + cBox!.x) / 2;
    const midY = aBox!.y + aBox!.height / 2;
    await page.mouse.move(midX, midY);

    const button = page.getByTestId("participant-insert-button-0");
    await expect(button).toBeVisible();

    const geometry = await page.evaluate(() => {
      const participantA = document
        .querySelector("[data-lifeline-id=A] .participant")
        ?.getBoundingClientRect();
      const participantC = document
        .querySelector("[data-lifeline-id=C] .participant")
        ?.getBoundingClientRect();
      const button = document
        .querySelector('[data-testid="participant-insert-button-0"]')
        ?.getBoundingClientRect();
      return { participantA, participantC, button };
    });

    expect(geometry.participantA).toBeTruthy();
    expect(geometry.participantC).toBeTruthy();
    expect(geometry.button).toBeTruthy();

    const participantCenterY =
      (geometry.participantA!.top + geometry.participantA!.bottom) / 2;
    const buttonCenterY = (geometry.button!.top + geometry.button!.bottom) / 2;
    expect(Math.abs(buttonCenterY - participantCenterY)).toBeLessThan(15);

    const buttonCenterX = (geometry.button!.left + geometry.button!.right) / 2;
    expect(buttonCenterX).toBeGreaterThan(geometry.participantA!.right);
    expect(buttonCenterX).toBeLessThan(geometry.participantC!.left);
  });
});

test.describe("Empty Diagram Prompt", () => {
  test("clicking the empty diagram prompt adds the first participant", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/empty-diagram.html");
    await expect(page.getByTestId("empty-diagram-prompt")).toBeVisible({
      timeout: 5000,
    });

    const prompt = page.getByTestId("empty-diagram-prompt");
    await expect(prompt).toBeVisible();
    await prompt.click();

    // Participant A should appear
    await expect(page.locator('[data-participant-id="A"]')).toBeVisible({
      timeout: 5000,
    });

    // DSL should be updated
    await expect.poll(lastContentChange(page)).toContain("A");
  });
});

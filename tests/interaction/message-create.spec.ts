import { test, expect } from "../fixtures";
import type { Page } from "@playwright/test";

const hoverGapNear = async (page: Page, gapIndex: number, name: string) => {
  const gap = await page
    .getByTestId(`message-gap-hover-${gapIndex}`)
    .boundingBox();
  const participant = await page
    .locator(`[data-participant-id="${name}"]`)
    .boundingBox();
  expect(gap).toBeTruthy();
  expect(participant).toBeTruthy();
  await page.mouse.move(
    participant!.x + participant!.width / 2,
    gap!.y + gap!.height / 2,
  );
};

test.describe("Message Create (Gap Handles)", () => {
  test("shows only the nearest participant's handle, with no idle guide", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const gap = page.getByTestId("message-gap-hover-0");
    await expect(gap).toBeVisible();
    await expect(gap.locator(".border-dashed")).toHaveCount(0);
    await expect(page.getByTestId(/^message-create-handle-0-/)).toHaveCount(0);
    await expect(page.locator(".sequence-diagram")).toHaveScreenshot(
      "insert-message-default.png",
    );

    await hoverGapNear(page, 0, "A");
    await expect(page.getByTestId(/^message-create-handle-0-/)).toHaveCount(1);
    await expect(page.getByTestId("message-create-handle-0-A")).toBeVisible();
    await expect(page.getByTestId("divider-insert-0")).toHaveCount(0);
    await expect(page.getByTestId("message-create-tooltip-0")).toHaveText(
      "Drag from A to a participant",
    );

    await hoverGapNear(page, 0, "C");
    await expect(page.getByTestId(/^message-create-handle-0-/)).toHaveCount(1);
    await expect(page.getByTestId("message-create-handle-0-C")).toBeVisible();
    await expect(page.getByTestId("message-create-tooltip-0")).toHaveText(
      "Drag from C to a participant",
    );
    const diagramBox = await page.locator(".sequence-diagram").boundingBox();
    const tooltipBox = await page
      .getByTestId("message-create-tooltip-0")
      .boundingBox();
    expect(diagramBox).toBeTruthy();
    expect(tooltipBox).toBeTruthy();
    expect(tooltipBox!.x).toBeGreaterThanOrEqual(diagramBox!.x);
    expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(
      diagramBox!.x + diagramBox!.width,
    );
  });

  test("clicking the handle leaves the diagram unchanged", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await hoverGapNear(page, 0, "A");
    await page.getByTestId("message-create-handle-0-A").click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toBeNull();
  });

  test("drag preview highlights a valid target and invalid release cancels", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await hoverGapNear(page, 0, "A");
    const handle = page.getByTestId("message-create-handle-0-A");
    const handleBox = await handle.boundingBox();
    const cBox = await page.locator('[data-participant-id="C"]').boundingBox();
    expect(handleBox).toBeTruthy();
    expect(cBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(cBox!.x + cBox!.width / 2, handleBox!.y + 8, {
      steps: 8,
    });
    await expect(handle).not.toBeVisible();
    await expect(page.getByTestId("message-create-source-dot")).toBeVisible();
    const previewLine = page.getByTestId("message-create-preview-line");
    await expect(previewLine).toHaveAttribute("stroke", "#2563eb");
    await expect(previewLine).toHaveAttribute("stroke-width", "1");
    await expect(previewLine).not.toHaveAttribute("stroke-dasharray");
    await expect(previewLine).toHaveAttribute("shape-rendering", "crispEdges");

    const previewMarker = page.locator("marker").first();
    await expect(previewMarker).toHaveAttribute("markerWidth", "7");
    await expect(previewMarker).toHaveAttribute("markerHeight", "10");
    await expect(previewMarker).toHaveAttribute("viewBox", "0 0 7 9");
    await expect(previewMarker).toHaveAttribute(
      "markerUnits",
      "userSpaceOnUse",
    );
    await expect(previewMarker).toHaveAttribute("refX", "6.15");
    await expect(previewMarker).toHaveAttribute("refY", "4.5");
    const previewArrow = previewMarker.locator("path");
    await expect(previewArrow).toHaveAttribute(
      "d",
      "M1 1.25 L6.15 4.5 L1 7.75",
    );
    await expect(previewArrow).toHaveAttribute("fill", "none");
    await expect(previewArrow).toHaveAttribute("stroke-width", "1");
    await expect(previewArrow).toHaveAttribute("stroke-linecap", "round");
    await expect(page.getByTestId("message-create-target-C")).toBeVisible();
    await expect(page.getByTestId("message-create-release-tooltip")).toHaveText(
      "Release to insert A → C",
    );
    const dragDiagramBox = await page
      .locator(".sequence-diagram")
      .boundingBox();
    const releaseBox = await page
      .getByTestId("message-create-release-tooltip")
      .boundingBox();
    expect(dragDiagramBox).toBeTruthy();
    expect(releaseBox).toBeTruthy();
    expect(releaseBox!.x).toBeGreaterThanOrEqual(dragDiagramBox!.x);
    expect(releaseBox!.x + releaseBox!.width).toBeLessThanOrEqual(
      dragDiagramBox!.x + dragDiagramBox!.width,
    );
    await expect(page.locator(".sequence-diagram")).toHaveScreenshot(
      "insert-message-drag.png",
    );

    const diagram = await page.locator(".sequence-diagram").boundingBox();
    expect(diagram).toBeTruthy();
    await page.mouse.move(diagram!.x + diagram!.width + 80, handleBox!.y + 8);
    await expect(page.getByTestId("message-create-target-C")).not.toBeVisible();
    await page.mouse.up();
    await expect(
      page.getByTestId("message-create-handle-0-A"),
    ).not.toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toBeNull();
  });

  test("divider stays available from the gap context menu", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const gap = page.getByTestId("message-gap-hover-1");
    await gap.focus();
    await page.keyboard.press("Shift+F10");
    const menu = page.getByTestId("gap-insert-menu-1");
    await expect(menu).toBeVisible();
    await expect(page.getByTestId("divider-insert-1")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).not.toBeVisible();
    await expect(gap).toBeFocused();

    await gap.click({ button: "right" });
    await expect(menu).toBeVisible();
    await page.getByTestId("divider-insert-1").click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toContain("==Divider==");
  });

  test("divider-only mode keeps its keyboard insertion menu", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await page.evaluate(() =>
      (window as any).zenUml.render("A\nB\nC\nA->B.hello()", {
        theme: "theme-nab",
        enableMessageInsertion: false,
        enableDividerInsertion: true,
        onContentChange: (code: string) => {
          (window as any).__lastContentChange = code;
        },
      }),
    );
    const gap = page.getByTestId("message-gap-hover-1");
    await expect(gap).toBeVisible();
    await hoverGapNear(page, 1, "A");
    await expect(page.getByTestId(/^message-create-handle-/)).toHaveCount(0);
    await gap.focus();
    await page.keyboard.press("Shift+F10");
    await expect(page.getByTestId("divider-insert-1")).toBeFocused();
    await page.getByTestId("divider-insert-1").click();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toContain("==Divider==");
  });

  test("long participant names wrap inside the diagram tooltips", async ({
    page,
  }) => {
    const source = "AReallyLongParticipantNameThatNeedsToWrap";
    await page.goto("/e2e/fixtures/create-message.html");
    await page.evaluate(
      (name) =>
        (window as any).zenUml.render(`${name}\nB\nC\n${name}->B.hello()`, {
          theme: "theme-nab",
          enableMessageInsertion: true,
        }),
      source,
    );
    await expect(
      page.locator(`[data-participant-id="${source}"]`),
    ).toBeVisible();
    await hoverGapNear(page, 0, source);
    const hoverTooltip = page.getByTestId("message-create-tooltip-0");
    await expect(hoverTooltip).toBeVisible();
    const hoverBox = await hoverTooltip.boundingBox();
    const diagramBox = await page.locator(".sequence-diagram").boundingBox();
    expect(hoverBox).toBeTruthy();
    expect(diagramBox).toBeTruthy();
    expect(hoverBox!.width).toBeLessThanOrEqual(180);
    expect(hoverBox!.height).toBeGreaterThan(24);
    expect(hoverBox!.x).toBeGreaterThanOrEqual(diagramBox!.x);
    expect(hoverBox!.x + hoverBox!.width).toBeLessThanOrEqual(
      diagramBox!.x + diagramBox!.width,
    );
    const sourceBox = await page
      .locator(`[data-participant-id="${source}"]`)
      .boundingBox();
    expect(sourceBox).toBeTruthy();
    expect(hoverBox!.y + hoverBox!.height).toBeLessThanOrEqual(sourceBox!.y);

    const handleBox = await page
      .getByTestId(`message-create-handle-0-${source}`)
      .boundingBox();
    const cBox = await page.locator('[data-participant-id="C"]').boundingBox();
    expect(handleBox).toBeTruthy();
    expect(cBox).toBeTruthy();
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(cBox!.x + cBox!.width / 2, handleBox!.y + 8, {
      steps: 8,
    });
    const releaseBox = await page
      .getByTestId("message-create-release-tooltip")
      .boundingBox();
    expect(releaseBox).toBeTruthy();
    expect(releaseBox!.width).toBeLessThanOrEqual(180);
    expect(releaseBox!.height).toBeGreaterThan(24);
    expect(releaseBox!.x).toBeGreaterThanOrEqual(diagramBox!.x);
    expect(releaseBox!.x + releaseBox!.width).toBeLessThanOrEqual(
      diagramBox!.x + diagramBox!.width,
    );
    expect(releaseBox!.y + releaseBox!.height).toBeLessThanOrEqual(cBox!.y);
    await page.keyboard.press("Escape");
    await page.mouse.up();

    await hoverGapNear(page, 1, source);
    const lowerTooltip = page.getByTestId("message-create-tooltip-1");
    await expect(lowerTooltip).toBeVisible();
    const lowerBox = await lowerTooltip.boundingBox();
    const lowerHandleBox = await page
      .getByTestId(`message-create-handle-1-${source}`)
      .boundingBox();
    expect(lowerBox).toBeTruthy();
    expect(lowerHandleBox).toBeTruthy();
    expect(lowerBox!.y + lowerBox!.height).toBeLessThanOrEqual(
      lowerHandleBox!.y,
    );
  });

  test("fits the first insert handle inside the existing space before the message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const participantA = page.locator('.participant[data-participant-id="A"]');
    await expect(participantA).toBeVisible({ timeout: 5000 });

    const gap = page.getByTestId("message-gap-0");
    const hoverZone = page.getByTestId("message-gap-hover-0");
    const firstStatement = page
      .locator(".message-layer > .block > .statement-container")
      .first();
    const participantBox = await participantA.boundingBox();
    const gapBox = await gap.boundingBox();
    const statementBox = await firstStatement.boundingBox();
    expect(participantBox).toBeTruthy();
    expect(gapBox).toBeTruthy();
    expect(statementBox).toBeTruthy();
    const participantBottom = participantBox!.y + participantBox!.height;
    expect(statementBox!.y - participantBottom).toBeLessThanOrEqual(16);
    expect(gapBox!.height).toBeLessThanOrEqual(12);
    const hoverBox = await hoverZone.boundingBox();
    expect(hoverBox).toBeTruthy();
    expect(hoverBox!.y).toBeGreaterThanOrEqual(participantBottom);
    expect(hoverBox!.y + hoverBox!.height).toBeLessThanOrEqual(statementBox!.y);

    await hoverGapNear(page, 0, "A");
    const handle = page.getByTestId("message-create-handle-0-A");
    await expect(handle).toBeVisible();
    const handleBox = await handle.boundingBox();
    expect(handleBox).toBeTruthy();
    expect(handleBox!.width).toBe(12);
    expect(handleBox!.height).toBe(12);
    expect(hoverBox!.height).toBe(16);
    expect(handleBox!.y).toBeGreaterThanOrEqual(hoverBox!.y);
    expect(handleBox!.y + handleBox!.height).toBeLessThanOrEqual(
      hoverBox!.y + hoverBox!.height,
    );
    expect((await firstStatement.boundingBox())?.y).toBe(statementBox!.y);

    await expect(page.getByTestId("message-create-tooltip-0")).toBeVisible();
    await expect(page.locator(".sequence-diagram")).toHaveScreenshot(
      "first-message-insert-gap.png",
    );
  });

  test("dragging from the first gap inserts before the first message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    await hoverGapNear(page, 0, "A");
    const handle = page.getByTestId("message-create-handle-0-A");
    await expect(handle).toBeVisible();
    const handleBox = await handle.boundingBox();
    const participantCBox = await page
      .locator('[data-participant-id="C"]')
      .boundingBox();
    expect(handleBox).toBeTruthy();
    expect(participantCBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      participantCBox!.x + participantCBox!.width / 2,
      participantCBox!.y + participantCBox!.height / 2,
      { steps: 10 },
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toBe("A\nB\nC\nA->C.newMessage()\nA->B.hello()");
  });

  test("drag source and target stay aligned when the diagram is scaled", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    const diagram = page.locator(".sequence-diagram");
    await expect(diagram).toBeVisible();
    await diagram.evaluate((element: HTMLElement) => {
      element.style.transform = "scale(0.8)";
    });
    await hoverGapNear(page, 0, "A");
    const handleBox = await page
      .getByTestId("message-create-handle-0-A")
      .boundingBox();
    const cBox = await page.locator('[data-participant-id="C"]').boundingBox();
    expect(handleBox).toBeTruthy();
    expect(cBox).toBeTruthy();
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    const sourceDot = await page
      .getByTestId("message-create-source-dot")
      .boundingBox();
    expect(sourceDot).toBeTruthy();
    expect(sourceDot!.x + sourceDot!.width / 2).toBeCloseTo(
      handleBox!.x + handleBox!.width / 2,
      0,
    );
    await page.mouse.move(cBox!.x + cBox!.width / 2, handleBox!.y + 8, {
      steps: 8,
    });
    await expect(page.getByTestId("message-create-target-C")).toBeVisible();
    await page.mouse.up();
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toContain("A->C.newMessage()");
  });

  test("shows drag handles on gap hover", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // Gap hover zone at index 1 (after first message, clearly below participant headers)
    const gapHover = page.getByTestId("message-gap-hover-1");
    await expect(gapHover).toBeVisible();

    const handle = page.getByTestId("message-create-handle-1-A");
    // Before hover, handle should not be visible
    await expect(handle).not.toBeVisible();

    await hoverGapNear(page, 1, "A");
    await expect(handle).toBeVisible();
  });

  test("drag from handle to participant creates a message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // Hover gap-1 (after the existing message) to reveal handles
    await hoverGapNear(page, 1, "A");

    const handleA = page.getByTestId("message-create-handle-1-A");
    await expect(handleA).toBeVisible();

    // Get participant C position as drag target
    const participantC = page.locator('[data-participant-id="C"]');
    const cBox = await participantC.boundingBox();
    expect(cBox).toBeTruthy();

    const handleBox = await handleA.boundingBox();
    expect(handleBox).toBeTruthy();

    // Drag from A handle to C participant center
    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height / 2,
      { steps: 10 },
    );
    await page.mouse.up();

    // A new message should have been created and __lastContentChange updated
    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toMatch(/A->C/);
  });

  test("drag from a sync occurrence bar to a participant creates a nested message", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    const occurrence = page.locator(
      '[data-el-type="occurrence"][data-belongs-to="B"]',
    );
    const occurrenceBox = await occurrence.boundingBox();
    expect(occurrenceBox).toBeTruthy();

    const participantC = page.locator('[data-participant-id="C"]');
    const cBox = await participantC.boundingBox();
    expect(cBox).toBeTruthy();

    await page.mouse.move(
      occurrenceBox!.x + occurrenceBox!.width / 2,
      occurrenceBox!.y + occurrenceBox!.height / 2,
    );
    await page.mouse.down();

    await expect(page.getByTestId("message-create-source-dot")).toBeVisible();

    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height / 2,
      {
        steps: 10,
      },
    );
    await page.mouse.up();

    await expect
      .poll(() =>
        page.evaluate(() => (window as any).__lastContentChange ?? null),
      )
      .toBe("A\nB\nC\nA->B.hello() {\n  B->C.newMessage()\n}");
  });

  test("Escape key cancels drag without creating message", async ({ page }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    await hoverGapNear(page, 1, "A");

    const handleA = page.getByTestId("message-create-handle-1-A");
    await expect(handleA).toBeVisible();

    const handleBox = await handleA.boundingBox();
    expect(handleBox).toBeTruthy();

    const participantC = page.locator('[data-participant-id="C"]');
    const cBox = await participantC.boundingBox();
    expect(cBox).toBeTruthy();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      cBox!.x + cBox!.width / 2,
      cBox!.y + cBox!.height / 2,
      { steps: 5 },
    );

    // Cancel with Escape
    await page.keyboard.press("Escape");
    await page.mouse.up();

    // Content should not have changed (original only has A->B.hello())
    const content = await page.evaluate(
      () => (window as any).__lastContentChange ?? null,
    );
    if (content !== null) {
      expect(content).not.toMatch(/A->C/);
    }
  });

  test("shows gap containers at start and end of message list", async ({
    page,
  }) => {
    await page.goto("/e2e/fixtures/create-message.html");
    await expect(
      page.locator(".sequence-diagram .participant").first(),
    ).toBeVisible({
      timeout: 5000,
    });

    // The fixture has 1 message (A->B.hello()), so gap-0 (before) and gap-1 (after) should exist
    await expect(page.getByTestId("message-gap-0")).toBeAttached();
    await expect(page.getByTestId("message-gap-1")).toBeAttached();
  });
});

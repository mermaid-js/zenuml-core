import { expect, test, type Page } from "@playwright/test";
import { stat } from "node:fs/promises";

const WIDE_DIAGRAM = `@Actor Researcher
@Actor Educator
@Actor Reviewer
@Database Store
Plain
Researcher -> Educator.requestContent() {
  Educator -> Reviewer.check()
  Reviewer -> Store.save()
  Plain -> Researcher: done
}`;

const openMenu = (page: Page) =>
  page.getByRole("button", { name: "More tools" }).click();

test("toolbar shows the build version and commit", async ({ page }) => {
  await page.goto("/");
  const label = page.locator("#build-label");
  await expect(label).toBeVisible();
  await expect(label).toHaveText(/^\d+\.\d+\.\d+(-[\w.]+)?( · [0-9a-f]{7,})?$/);
  const hash = ((await label.textContent()) ?? "").split(" · ")[1];
  if (hash) {
    await expect(label).toHaveAttribute("href", `https://github.com/mermaid-js/zenuml-core/commit/${hash}`);
  }
});

test("workbench keeps rendering and saved controls in the redesigned shell", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("article", { name: "Preview" })).toBeVisible();
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
  // The build label changes with every commit. Hidden, it keeps its space, so
  // the rest of the toolbar is compared as it is. The reload below drops this.
  await page.addStyleTag({ content: "#build-label { visibility: hidden; }" });
  await expect(page).toHaveScreenshot("workbench-desktop-dom.png", {
    animations: "disabled",
    mask: [page.locator("#svg-stats"), page.locator(".CodeMirror-cursor")],
  });
  await expect(page.getByRole("button", { name: "DOM", exact: true })).toHaveAttribute("aria-pressed", "true");
  await openMenu(page);
  const participantSwitch = page.getByRole("switch", { name: "Insert participant" });
  await expect(participantSwitch).toHaveAttribute("aria-checked", "true");
  await participantSwitch.click();
  await expect(participantSwitch).toHaveAttribute("aria-checked", "false");
  await page.reload();
  await expect(page.locator("#workspace")).toHaveClass(/mode-dom/);
  await openMenu(page);
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
  await openMenu(page);
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
  await openMenu(page);
  const outOfBounds = () =>
    page.evaluate(() => {
      const menu = document.querySelector("#overflow-menu")!.getBoundingClientRect();
      return (
        menu.left < 0 ||
        menu.right > innerWidth ||
        menu.bottom > innerHeight ||
        [...document.querySelectorAll(".capability-switch")].some(
          (button) => button.getBoundingClientRect().right > menu.right,
        )
      );
    });
  expect(await outOfBounds()).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#svg-container > svg")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(await outOfBounds()).toBe(false);
  await page.screenshot({ path: "test-results/workbench-phone-svg.png", fullPage: true });
});

test.describe("narrow panel (420×900)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 900 });
    await page.addInitScript((code) => localStorage.setItem("zenuml-cm-code", code), WIDE_DIAGRAM);
    await page.goto("/");
    await expect(page.locator("#svg-container > svg")).toBeVisible();
  });

  test("gives the height to the editor and the preview, with no page scroll", async ({ page }) => {
    const heights = await page.evaluate(() => {
      const height = (selector: string) => document.querySelector(selector)!.getBoundingClientRect().height;
      return {
        toolbar: height(".toolbar"),
        divider: height("#editor-resizer"),
        status: height(".diagnostics-footer"),
        editor: height(".editor-panel"),
        preview: height(".preview-panel"),
        page: document.documentElement.scrollHeight,
      };
    });
    expect(heights).toEqual({ toolbar: 36, divider: 6, status: 22, editor: 224, preview: 612, page: 900 });
    await page.screenshot({ path: "test-results/workbench-panel-svg.png" });
  });

  test("fits a wide diagram to the panel width and can switch to actual size", async ({ page }) => {
    const svg = page.locator("#svg-container > svg");
    const zoom = page.getByRole("button", { name: /^Zoom/ });
    await expect(zoom).toHaveText(/^Fit \d+%$/);
    const fitted = (await svg.boundingBox())!;
    expect(fitted.x).toBeGreaterThanOrEqual(0);
    expect(fitted.x + fitted.width).toBeLessThanOrEqual(420);

    await zoom.click();
    await expect(zoom).toHaveText("100%");
    expect((await svg.boundingBox())!.width).toBeGreaterThan(420);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(420);

    await page.reload();
    await expect(zoom).toHaveText("100%");
  });

  test("fits the DOM view too, and scales around the exported element", async ({ page }) => {
    await page.getByRole("button", { name: "DOM", exact: true }).click();
    const frame = page.locator(".frame");
    await expect(frame).toBeVisible();
    // The DOM diagram rendered while hidden, so it grows once it measures its participants.
    await expect
      .poll(() => frame.evaluate((element) => (element as HTMLElement).offsetWidth))
      .toBeGreaterThan(420);
    await expect(page.getByRole("button", { name: /^Zoom/ })).toHaveText(/^Fit \d+%$/);
    await expect
      .poll(async () => {
        const box = (await frame.boundingBox())!;
        return box.x + box.width;
      })
      .toBeLessThanOrEqual(420);

    // PNG export clones pre.zenuml with its computed style, so it must carry no transform.
    expect(
      await page.locator("pre.zenuml").evaluate((element) => getComputedStyle(element).transform),
    ).toBe("none");
  });

  test("dragging a new message in the scaled DOM view lands on the right participants", async ({ page }) => {
    await page.getByRole("button", { name: "DOM", exact: true }).click();
    const frame = page.locator(".frame");
    await expect
      .poll(() => frame.evaluate((element) => (element as HTMLElement).offsetWidth))
      .toBeGreaterThan(420);

    const source = (await page.locator('[data-participant-id="Researcher"]').boundingBox())!;
    const target = (await page.locator('[data-participant-id="Store"]').boundingBox())!;
    const gap = (await page.getByTestId("message-gap-hover-0").boundingBox())!;
    const y = gap.y + gap.height / 2;
    await page.mouse.move(source.x + source.width / 2, y);
    const handle = page.getByTestId("message-create-handle-0-Researcher");
    await expect(handle).toBeVisible();
    const handleBox = (await handle.boundingBox())!;
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(target.x + target.width / 2, y, { steps: 8 });
    await page.mouse.up();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("zenuml-cm-code")))
      .toMatch(/Researcher\s*(->|\.)\s*Store|Researcher->Store/);
  });

  test("the divider resizes the editor height and the height persists", async ({ page }) => {
    const divider = (await page.locator("#editor-resizer").boundingBox())!;
    await expect(page.locator("#editor-resizer")).toHaveAttribute("aria-orientation", "horizontal");
    await page.mouse.move(divider.x + 200, divider.y + 3);
    await page.mouse.down();
    await page.mouse.move(divider.x + 200, divider.y + 103, { steps: 4 });
    await page.mouse.up();
    const resized = (await page.locator(".editor-panel").boundingBox())!;
    expect(resized.height).toBeGreaterThan(300);

    await page.reload();
    await expect(page.locator("#svg-container > svg")).toBeVisible();
    expect((await page.locator(".editor-panel").boundingBox())!.height).toBeCloseTo(resized.height, 0);
  });

  test("the overflow menu holds the moved tools and stays open while toggling", async ({ page }) => {
    await openMenu(page);
    for (const name of ["Basic sample", "Advanced sample", "Clear editor", "Export PNG", "Text width"]) {
      await expect(page.getByRole("button", { name })).toBeVisible();
    }
    for (const name of ["Compare Cases", "SVG Only"]) {
      await expect(page.getByRole("link", { name })).toBeVisible();
    }
    const toggle = page.getByRole("switch", { name: "Insert divider" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(toggle).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(toggle).toBeHidden();

    await openMenu(page);
    await page.getByRole("button", { name: "Basic sample" }).click();
    await expect(page.getByRole("button", { name: "Basic sample" })).toBeHidden();
    await expect(page.locator("#svg-container > svg")).toContainText("Hello Bob!");
  });

  test("the saved state stays a dot until saving fails", async ({ page }) => {
    const saved = page.locator(".saved-state");
    await expect(saved).toHaveAttribute("aria-label", "Saved locally in this browser");
    await expect(saved).toHaveText("");

    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new Error("quota");
      };
    });
    await page.locator(".CodeMirror").click();
    await page.keyboard.insertText("A -> B: c\n");
    await expect(saved).toHaveText("Not saved");
    await expect(saved).toHaveAttribute("aria-label", "Could not save in this browser");
  });
});

import type { Page } from "@playwright/test";
import { test, expect } from "../fixtures";

// The DSL from the original bug report.
const ORDER_CHECKOUT = `title Order Checkout
group A {
	@Actor Customer
	@Boundary Web
	OrderService
}
@Database DB
Customer->Web.checkout(cart) {
  // validate and create the order
  order = OrderService.create(cart) {
    if (inStock) {
      DB.save(order)
      return order
    } else {
      @return OrderService->Web: outOfStock
    }
    loop (each item) {
      DB.reserve(item)
    }
  }
  return receipt
}
Web->OrderService.fill(Il1, O0o, rn_m, userId)`;

async function expectTitleCentred(page: Page) {
  const title = page.locator(".lifeline-group-container > .z-10 > span");
  await expect(title).toBeVisible({ timeout: 5000 });
  await expect(page.locator("[data-group-overlay]")).toBeVisible();

  const { titleCentre, boxesCentre, outlineCentre } = await page.evaluate(
    () => {
      const centre = (r: DOMRect) => r.left + r.width / 2;
      const span = document.querySelector(
        ".lifeline-group-container > .z-10 > span",
      )!;
      const boxes = [
        ...document.querySelectorAll(".lifeline-group-container .participant"),
      ].map((el) => el.getBoundingClientRect());
      const left = Math.min(...boxes.map((r) => r.left));
      const right = Math.max(...boxes.map((r) => r.right));
      const outline = document
        .querySelector("[data-group-overlay]")!
        .getBoundingClientRect();
      return {
        titleCentre: centre(span.getBoundingClientRect()),
        boxesCentre: (left + right) / 2,
        outlineCentre: centre(outline),
      };
    },
  );

  expect(Math.abs(titleCentre - boxesCentre)).toBeLessThan(0.5);
  expect(Math.abs(outlineCentre - boxesCentre)).toBeLessThan(0.5);

  // The title chip has an opaque background, so it must end above the
  // participant boxes or it hides their top border. Like the SVG title bar,
  // keep at least 0.5px clear: line-height "normal" varies by browser build.
  const { chipTop, chipBottom, boxesTop, strokeBottom } = await page.evaluate(
    () => {
      const chip = document
        .querySelector(".lifeline-group-container > .z-10")!
        .getBoundingClientRect();
      const boxes = [
        ...document.querySelectorAll(".lifeline-group-container .participant"),
      ].map((el) => el.getBoundingClientRect());
      // Bounding box of the outline <svg> includes the 1px stroke.
      const outline = document
        .querySelector("[data-group-overlay]")!
        .getBoundingClientRect();
      return {
        chipTop: chip.top,
        chipBottom: chip.bottom,
        boxesTop: Math.min(...boxes.map((r) => r.top)),
        strokeBottom: outline.top + 1,
      };
    },
  );
  expect(chipBottom).toBeLessThanOrEqual(boxesTop - 0.5);
  // ...and must start below the outline's top stroke, or it hides the
  // stroke's lower half (the SVG title bar starts at the stroke's inner edge).
  expect(chipTop).toBeGreaterThanOrEqual(strokeBottom);
}

// An @Actor participant renders a box narrower than its layout-model width.
// The group title must still be centred over the rendered participant boxes
// (the dashed outline and the SVG renderer both use the rendered boxes).
test("group title is centred over its participant boxes", async ({ page }) => {
  await page.goto("/e2e/fixtures/fixture.html?case=repro-group-title-actor");
  await expectTitleCentred(page);
});

// The workbench opens on the SVG tab, so the DOM diagram first renders while
// hidden and every participant box measures 0 wide. The outline and title must
// be re-measured once the DOM pane becomes visible.
test("group title and outline stay centred when the DOM pane starts hidden", async ({
  page,
}) => {
  await page.addInitScript((code) => {
    localStorage.setItem("zenuml-cm-code", code);
  }, ORDER_CHECKOUT);
  await page.goto("/");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  await expect(page.locator("#workspace")).toHaveClass(/mode-svg/);
  // Wait for the hidden DOM diagram to render and measure its group.
  await expect(
    page.locator(".lifeline-group-container .participant").first(),
  ).toBeAttached();
  await page.waitForTimeout(300);
  await page.getByRole("button", { name: "DOM", exact: true }).click();
  await expectTitleCentred(page);
});

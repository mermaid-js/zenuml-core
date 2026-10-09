import { PNG } from "pngjs";
import { test, expect } from "../fixtures";

// The group outline runs into the frame's bottom border, as in the SVG
// renderer: along that border every pixel column must be exactly as thick as
// the border alone. When the outline's bottom stroke sits half a pixel off the
// border, the dashes make the line 1.5px thick in places.
for (const deviceScaleFactor of [1, 2]) {
  test.describe(`at device scale ${deviceScaleFactor}`, () => {
    test.use({ deviceScaleFactor });

    test("group outline bottom merges into the frame border", async ({
      page,
    }) => {
      await page.goto("/e2e/fixtures/fixture.html?case=repro-unnamed-group");
      await expect(page.locator("[data-group-overlay]").first()).toBeVisible({
        timeout: 5000,
      });

      const { x, frameBottom } = await page.evaluate(() => {
        const outline = document
          .querySelector("[data-group-overlay]")!
          .getBoundingClientRect();
        const frame = document.querySelector(".frame")!.getBoundingClientRect();
        return { x: outline.left, frameBottom: frame.bottom };
      });
      const png = PNG.sync.read(
        await page.screenshot({
          clip: { x: x + 2, y: frameBottom - 4, width: 60, height: 8 },
        }),
      );

      // The clip spans 4px above and below the frame bottom; the border is
      // the last CSS px above it.
      const band = 3 * deviceScaleFactor;
      const isDark = (cx: number, cy: number) =>
        png.data[(cy * png.width + cx) * 4] < 200;
      const thicknesses = new Set<number>();
      for (let cx = 0; cx < png.width; cx++) {
        // Skip columns crossed by a vertical line (a dashed lifeline or an
        // outline side): dark anywhere above the border band.
        let crossed = false;
        for (let cy = 0; cy < band; cy++) if (isDark(cx, cy)) crossed = true;
        if (crossed) continue;
        let dark = 0;
        for (let cy = 0; cy < png.height; cy++) {
          if (isDark(cx, cy)) dark++;
        }
        thicknesses.add(dark);
      }
      // 1 CSS px border = deviceScaleFactor device rows, in every column.
      expect([...thicknesses]).toEqual([deviceScaleFactor]);
    });
  });
}

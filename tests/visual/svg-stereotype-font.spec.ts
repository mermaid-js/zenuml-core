import { test, expect } from "@playwright/test";

for (const theme of ["theme-default", "theme-neon"] as const) {
  for (const context of ["embedded", "standalone"] as const) {
    test(`${theme} stereotype uses the theme font in ${context} SVG`, async ({
      page,
    }) => {
      await page.goto("/e2e/tools/stroke-examples.html");
      const svg = await page.evaluate(async (selectedTheme) => {
        const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
        return renderToSvg(
          "<<BFF>> OrderService\nOrderService.create(payload)",
          {
            theme: selectedTheme,
          },
        ).svg;
      }, theme);

      if (context === "standalone") {
        await page.goto(`data:image/svg+xml,${encodeURIComponent(svg)}`);
      } else {
        await page.evaluate((markup) => {
          document.body.style.fontFamily = "monospace";
          document.body.innerHTML = markup;
        }, svg);
      }

      const stereotype = page.locator(".stereotype-label");
      const participant = page.locator(".participant-label");
      await expect(stereotype).toHaveCount(1);
      const styles = await stereotype.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          family: style.fontFamily,
          size: style.fontSize,
          weight: style.fontWeight,
          style: style.fontStyle,
        };
      });
      const participantFamily = await participant
        .first()
        .evaluate((element) => getComputedStyle(element).fontFamily);
      expect(participantFamily).toContain(
        theme === "theme-neon" ? "MS Sans Serif" : "IBM Plex Sans",
      );
      expect(styles).toEqual({
        family: participantFamily,
        size: "14px",
        weight: "400",
        style: "normal",
      });
    });
  }
}

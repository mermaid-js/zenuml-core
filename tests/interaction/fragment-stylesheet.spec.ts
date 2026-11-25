import { test, expect } from "../fixtures";

test("ref label keeps its pentagon corner and frame-coloured border", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const result = await page.evaluate(async () => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const host = document.createElement("pre");
    host.id = "fragment-stylesheet-dom";
    host.className = "zenuml";
    document.body.append(host);
    await new ZenUml(host).render("title Ref\nref(Shared)\n", {
      enableNumbering: false,
    });
    const frame = host.querySelector(".fragment-ref");
    const polygon = host.querySelector(".fragment-ref .polygon-border");
    const content = host.querySelector(".fragment-ref .polygon-content");
    const header = host.querySelector(".fragment-ref .header");
    return {
      headerFill: header ? getComputedStyle(header).backgroundColor : "",
      borderBottom: polygon ? polygon.getBoundingClientRect().bottom : 0,
      contentBottom: content ? content.getBoundingClientRect().bottom : 0,
      found: Boolean(frame && polygon && content),
      frameColour: frame ? getComputedStyle(frame).borderTopColor : "",
      borderClip: polygon ? getComputedStyle(polygon).clipPath : "",
      borderFill: polygon ? getComputedStyle(polygon).backgroundColor : "",
      contentClip: content ? getComputedStyle(content).clipPath : "",
    };
  });
  expect(result.found).toBe(true);
  expect(result.borderClip).not.toBe("none");
  expect(result.contentClip).not.toBe("none");
  // The outer pentagon is the label border, so it takes the frame colour.
  expect(result.borderFill).toBe(result.frameColour);
  // No header band behind the label, or it shows through the cut corner.
  expect(result.headerFill).toBe("rgba(0, 0, 0, 0)");
  // The border pentagon reaches below the fill, so its bottom edge shows.
  expect(result.borderBottom).toBeGreaterThan(result.contentBottom);
});

test("title and fragment tabs fit their content in both renderers", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const code =
    "title Order checkout\nif (hasItems) {\nCheckout->Payments: authorize\n}";
  const sizes = await page.evaluate(async (code) => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
    const dom = document.createElement("div");
    dom.id = "frame-tabs-dom";
    const svg = document.createElement("div");
    document.body.append(dom, svg);
    await new ZenUml(dom).render(code, { theme: "theme-dark" });
    await document.fonts.ready;
    svg.innerHTML = renderToSvg(code, { theme: "theme-dark" }).svg;

    const title = dom.querySelector(".title.frame-tab")!;
    const tab = dom.querySelector(".fragment-alt > .header > .name.frame-tab")!;
    const size = (element: Element) => element.getBoundingClientRect().width;
    return {
      titleWidth: size(title),
      fragmentTabWidth: size(tab),
      frameWidth: size(dom.querySelector(".frame")!),
      fragmentWidth: size(dom.querySelector(".fragment-alt")!),
      titlePadding: getComputedStyle(title).paddingRight,
      fragmentPadding: getComputedStyle(tab).paddingRight,
      fragmentFill: getComputedStyle(tab).getPropertyValue("--tab-fill").trim(),
      ruleColor: getComputedStyle(tab).getPropertyValue("--tab-rule").trim(),
      svgTitleWidth: size(svg.querySelector(".frame-header-bg")!),
      svgFragmentWidth: size(svg.querySelector(".fragment-header")!),
      svgRuleColor: getComputedStyle(
        svg.querySelector(".fragment-header-rule")!,
      ).stroke,
    };
  }, code);
  expect(sizes.titleWidth).toBeLessThan(sizes.frameWidth);
  expect(sizes.fragmentTabWidth).toBeLessThan(sizes.fragmentWidth);
  expect(sizes.titlePadding).toBe("14px");
  expect(sizes.fragmentPadding).toBe("14px");
  expect(sizes.fragmentFill).toBe("#e9e9e9");
  expect(sizes.ruleColor).toBe("#000000");
  expect(sizes.svgRuleColor).toBe("rgb(0, 0, 0)");
  expect(Math.abs(sizes.titleWidth - sizes.svgTitleWidth)).toBeLessThan(1);
  expect(
    Math.abs(sizes.fragmentTabWidth - sizes.svgFragmentWidth),
  ).toBeLessThan(1);

  const fragment = page.locator("#frame-tabs-dom .fragment-alt");
  await fragment.locator(":scope > .header").hover();
  await fragment.locator(".collapse-button").click();
  await expect(fragment.locator(":scope > .hidden")).toHaveCount(1);
  const collapsedTab = await fragment
    .locator(":scope > .header > .frame-tab")
    .boundingBox();
  expect(collapsedTab?.width).toBe(sizes.fragmentTabWidth);

  await page.emulateMedia({ forcedColors: "active" });
  const title = page.locator("#frame-tabs-dom .title.frame-tab");
  await expect(title).toHaveCSS("forced-color-adjust", "none");
  await expect(fragment.locator(":scope > .header > .frame-tab")).toHaveCSS(
    "forced-color-adjust",
    "none",
  );
  await expect(title.locator(":scope > span")).toHaveCSS(
    "forced-color-adjust",
    "auto",
  );
});

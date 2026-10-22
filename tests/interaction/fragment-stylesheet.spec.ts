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

import { test, expect } from "../fixtures";

test("guards share padded baselines, fit long text and remain editable", async ({
  page,
}) => {
  await page.goto("/e2e/tools/stroke-examples.html");
  await page.waitForFunction(() => (window as any).__strokeExamples?.ready);
  const longCondition =
    "customerAccountIsActiveAndSubscriptionIsCurrentAndPaymentAuthorizationHasCompletedSuccessfully";
  const code = `title Guard rows
if(approved) {
  A->B:first
} else if(${longCondition}) {
  A->B:retry
} else {
  B->A:declined
}
loop(attempts remain) {
  A->B:next
}
opt(permitted) {
  A->B:continue
}
critical(locked) {
  A->B:commit
}`;
  const actual = await page.evaluate(async (code) => {
    const { default: ZenUml } = await import("/src/core.tsx");
    const { renderToSvg } = await import("/src/svg/renderToSvg.ts");
    const host = document.createElement("pre");
    host.id = "guard-test-dom";
    host.className = "zenuml";
    document.body.append(host);
    const renderer = new ZenUml(host);
    await renderer.render(code, {
      enableNumbering: false,
      onContentChange: (newCode) => {
        (window as any).__guardEditedCode = newCode;
      },
    });
    const svgHost = document.createElement("div");
    svgHost.id = "guard-test-svg";
    svgHost.innerHTML = renderToSvg(code, { enableNumbering: false }).svg;
    document.body.append(svgHost);
    const baseline = (element: Element) => {
      const probe = document.createElement("span");
      probe.style.cssText =
        "display:inline-block;width:0;height:0;vertical-align:baseline";
      element.append(probe);
      const y = probe.getBoundingClientRect().top;
      probe.remove();
      return y;
    };
    const rows = [...host.querySelectorAll(".guard-row")].map((row) => {
      const keyword = row.querySelector(".guard-keyword");
      const condition = row.querySelector(".condition");
      const first = keyword ?? condition!;
      const frame = row.closest(".fragment")!.getBoundingClientRect();
      const box = row.getBoundingClientRect();
      return {
        keyword: keyword?.textContent ?? "",
        condition: condition?.textContent ?? "",
        height: box.height,
        inset: first.getBoundingClientRect().left - box.left,
        frameFits:
          frame.right <=
          host.querySelector(".frame")!.getBoundingClientRect().right,
        fits:
          !condition ||
          condition.getBoundingClientRect().right <= frame.right - 4,
        baseline:
          keyword && condition ? baseline(keyword) - baseline(condition) : 0,
        keywordStyle: keyword
          ? `${getComputedStyle(keyword).fontSize}/${getComputedStyle(keyword).fontWeight}/${getComputedStyle(keyword).color}`
          : undefined,
        conditionStyle: condition
          ? `${getComputedStyle(condition).fontSize}/${getComputedStyle(condition).fontWeight}`
          : undefined,
      };
    });
    const svgRows = [...svgHost.querySelectorAll(".guard-row")].map((row) => {
      const keyword = row.querySelector(".guard-keyword");
      const condition = row.querySelector(".fragment-condition");
      const first = keyword ?? condition!;
      const frame = row
        .closest(".fragment")!
        .querySelector(".fragment-border") as SVGRectElement;
      const frameBox = frame.getBBox();
      const conditionBox = condition
        ? (condition as SVGGraphicsElement).getBBox()
        : undefined;
      return {
        keyword: keyword?.textContent ?? "",
        condition: condition?.textContent ?? "",
        inset: Number(first.getAttribute("x")) - frameBox.x + 0.5,
        fits:
          !conditionBox ||
          conditionBox.x + conditionBox.width <=
            frameBox.x + frameBox.width - 3.5,
        baseline:
          keyword && condition
            ? Number(keyword.getAttribute("y")) -
              Number(condition.getAttribute("y"))
            : 0,
      };
    });
    (window as any).__guardTest = { renderer, code, svgHost };
    return { rows, svgRows };
  }, code);
  expect(actual.rows.map((row) => row.keyword)).toEqual([
    "if",
    "else if",
    "else",
    "loop",
    "if",
    "",
  ]);
  expect(actual.svgRows.map((row) => row.keyword)).toEqual(
    actual.rows.map((row) => row.keyword),
  );
  expect(actual.svgRows.map((row) => row.condition)).toEqual(
    actual.rows.map((row) => row.condition),
  );
  for (const row of actual.rows) {
    expect(row.height).toBe(28);
    expect(row.inset).toBe(4);
    expect(row.fits).toBe(true);
    expect(row.frameFits).toBe(true);
    expect(row.baseline).toBe(0);
    if (row.keywordStyle)
      expect(row.keywordStyle).toBe("12px/400/rgb(107, 114, 128)");
    if (row.conditionStyle) expect(row.conditionStyle).toBe("14px/400");
  }
  for (const row of actual.svgRows) {
    expect(row.inset).toBe(5);
    expect(row.fits).toBe(true);
    expect(row.baseline).toBe(0);
  }
  await expect(page.locator("#guard-test-dom")).toHaveScreenshot(
    "fragment-guard-keywords.png",
  );
  const condition = page.locator("#guard-test-dom .condition").first();
  await condition.click();
  await expect(condition).toHaveAttribute("contenteditable", "true");
  await condition.fill("verified");
  await condition.press("Enter");
  await expect(page.locator("#guard-test-dom .condition").first()).toHaveText(
    "verified",
  );
  expect(
    await page.evaluate(() => (window as any).__guardEditedCode),
  ).toContain("if(verified)");
  await expect(
    page.locator("#guard-test-dom .guard-keyword").first(),
  ).toHaveText("if");
  const alt = page.locator("#guard-test-dom .fragment-alt");
  await alt.locator(":scope > .header").hover();
  await alt.locator(":scope > .header .collapse-button").click();
  await expect(alt.locator(":scope > .hidden")).toHaveCount(1);
  await alt.locator(":scope > .header .collapsible-header > span").click();
  await expect(alt.locator(":scope > .hidden")).toHaveCount(0);
  await page.evaluate(async () => {
    const { renderer } = (window as any).__guardTest;
    await renderer.render((window as any).__guardEditedCode, {
      enableNumbering: true,
    });
  });
  await expect(page.locator("#guard-test-dom .fragment-number")).toHaveCount(4);
  await expect(
    page.locator("#guard-test-dom .guard-keyword").first(),
  ).toHaveText("if");
});

import { test, expect } from "../fixtures";

// #655: the participant box grows to fit a long «stereotype», but the lifeline
// spacing was computed from the name alone, so adjacent boxes overlapped and
// the first one was pushed past the frame's left edge.
const boxesOf = async (page: import("@playwright/test").Page) => {
  const participants = page.locator(".sequence-diagram .participant");
  await expect(participants.first()).toBeVisible();
  const boxes = await participants.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        id: el.getAttribute("data-participant-id"),
        left: r.left,
        right: r.right,
      };
    }),
  );
  const frame = await page
    .locator(".zenuml .frame")
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right };
    });
  return { boxes, frame };
};

const open = (page: import("@playwright/test").Page, dsl: string) =>
  page.goto(`/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`);

test("long stereotypes on adjacent participants do not overlap or leave the frame", async ({
  page,
}) => {
  await open(
    page,
    "<<alongstereotype_aaaaa>> a\n\n<<alongstereotype_aaaaa>> b\na->b: hi",
  );
  const { boxes, frame } = await boxesOf(page);
  expect(boxes.map((b) => b.id)).toEqual(["a", "b"]);
  const [a, b] = boxes;
  // Boxes keep a gap between them…
  expect(b.left).toBeGreaterThan(a.right);
  // …and both sit inside the diagram frame.
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(frame.left);
    expect(box.right).toBeLessThanOrEqual(frame.right);
  }
});

test("a short stereotype keeps the default participant spacing", async ({
  page,
}) => {
  const plain = await (async () => {
    await open(page, "a\n\nb");
    return (await boxesOf(page)).boxes;
  })();
  await open(page, "<<svc>> a\n\n<<svc>> b");
  const { boxes } = await boxesOf(page);
  expect(boxes.map((b) => [b.left, b.right])).toEqual(
    plain.map((b) => [b.left, b.right]),
  );
});

// The SVG renderer takes its centres from the same positioning engine.
test("SVG export keeps long-stereotype participants apart and inside the canvas", async ({
  page,
}) => {
  await page.goto("/e2e/fixtures/svg-test.html");
  await page.evaluate(
    (c) => (window as any).__renderSvg(c),
    "<<alongstereotype_aaaaa>> a\n\n<<alongstereotype_aaaaa>> b\na->b: hi",
  );
  const svg = page.locator("#svg-output > svg");
  await expect(svg).toBeVisible();
  const canvas = await svg.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right };
  });
  const boxes = await svg
    .locator("g.participant:not(.participant-bottom) rect.participant-box")
    .evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right };
      }),
    );
  expect(boxes).toHaveLength(2);
  expect(boxes[1].left).toBeGreaterThan(boxes[0].right);
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(canvas.left);
    expect(box.right).toBeLessThanOrEqual(canvas.right);
  }
});

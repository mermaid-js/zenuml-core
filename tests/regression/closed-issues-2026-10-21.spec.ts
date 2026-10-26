import type { Page } from "@playwright/test";
import { test, expect, openDiagram } from "../fixtures";
import { CASES } from "../../e2e/data/compare-cases.js";
import { clickMessageArrow } from "../interaction/clickMessageArrow";

// Regression tests for issues closed on 2026-10-21 because main already
// renders them correctly. Every assertion is a geometric relation, never an
// absolute pixel position.

const open = async (page: Page, dsl: string) => {
  await page.setViewportSize({ width: 900, height: 760 });
  await openDiagram(
    page,
    `/e2e/fixtures/creation.html?dsl=${encodeURIComponent(dsl)}`,
  );
};

const rects = (page: Page, selector: string) =>
  page.evaluate(
    (sel) =>
      [...document.querySelectorAll(sel)].map((e) => {
        const r = e.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
      }),
    selector,
  );

test("#82: a long fragment condition stays inside the fragment box", async ({
  page,
}) => {
  await open(page, "if(condition_over_flow_in_a_fragment) {\n  A.method\n}");
  const label = page.locator(".fragment.alt .condition");
  await expect(label).toContainText("condition_over_flow_in_a_fragment");
  const m = await page.evaluate(() => {
    const frag = document
      .querySelector(".fragment.alt")!
      .getBoundingClientRect();
    const el = document.querySelector(
      ".fragment.alt .condition",
    ) as HTMLElement;
    const l = el.getBoundingClientRect();
    return {
      leftInside: l.left - frag.left,
      rightInside: frag.right - l.right,
      clipped: el.scrollWidth - el.clientWidth,
    };
  });
  expect(m.leftInside).toBeGreaterThanOrEqual(0);
  expect(m.rightInside).toBeGreaterThanOrEqual(0);
  expect(m.clipped).toBeLessThanOrEqual(0);
});

test("#96: the message style panel is on top of a created participant box", async ({
  page,
}) => {
  await open(page, "A.m() {\n  b = new B1\n}");
  await clickMessageArrow(
    page.locator(".interaction.creation .message").first(),
  );
  const panel = page.locator("#style-panel > div").first();
  await expect(panel).toBeVisible();

  const hit = await page.evaluate(() => {
    const box = document
      .querySelector('.participant[data-participant-id="b:B1"]')!
      .getBoundingClientRect();
    const p = document
      .querySelector("#style-panel > div")!
      .getBoundingClientRect();
    const left = Math.max(box.left, p.left);
    const right = Math.min(box.right, p.right);
    const top = Math.max(box.top, p.top);
    const bottom = Math.min(box.bottom, p.bottom);
    if (right <= left || bottom <= top)
      return { overlap: false, inPanel: false };
    const el = document.elementFromPoint(
      (left + right) / 2,
      (top + bottom) / 2,
    );
    return {
      overlap: true,
      inPanel: !!el && !!el.closest("#style-panel > div"),
    };
  });
  expect(hit.overlap).toBe(true);
  expect(hit.inPanel).toBe(true);
});

test("#239: assignment and return replies sit at the same place in their occurrences", async ({
  page,
}) => {
  await open(
    page,
    "c b\na = b.m() {\n  c.method\n}\n\nb.m() {\n  c.method\n  return a\n}",
  );
  const bOcc = await rects(page, '.occurrence[data-belongs-to="b"]');
  const cOcc = await rects(page, '.occurrence[data-belongs-to="c"]');
  const replies = await rects(page, ".interaction.return .message");
  expect(bOcc).toHaveLength(2);
  expect(cOcc).toHaveLength(2);
  expect(replies).toHaveLength(2);

  const offset0 = replies[0].top - bOcc[0].top;
  const offset1 = replies[1].top - bOcc[1].top;
  expect(Math.abs(offset0 - offset1)).toBeLessThanOrEqual(1);
  expect(
    Math.abs(cOcc[0].bottom - cOcc[0].top - (cOcc[1].bottom - cOcc[1].top)),
  ).toBeLessThanOrEqual(1);
});

test("#241: par branch separators clear the occurrences above and below", async ({
  page,
}) => {
  await open(page, "par {\n  A.method_EEE\n  B.method_EEE\n  C.method_EEE\n}");
  const rows = await page.evaluate(() => {
    const items = [
      ...document.querySelectorAll(
        ".fragment-par .block > .statement-container",
      ),
    ];
    return items.map((c) => {
      const r = c.getBoundingClientRect();
      return {
        top: r.top,
        borderTop: parseFloat(getComputedStyle(c).borderTopWidth),
        occurrenceBottom: c
          .querySelector(".occurrence")!
          .getBoundingClientRect().bottom,
        messageTop: c.querySelector(".message")!.getBoundingClientRect().top,
      };
    });
  });
  expect(rows).toHaveLength(3);
  expect(rows[0].borderTop).toBe(0);
  for (let i = 1; i < rows.length; i++) {
    expect(rows[i].borderTop).toBeGreaterThan(0);
    expect(rows[i].top).toBeGreaterThanOrEqual(rows[i - 1].occurrenceBottom);
    expect(rows[i].top).toBeLessThanOrEqual(rows[i].messageTop);
  }
});

test("#319: assignment and return occurrences have the same height and reply offset", async ({
  page,
}) => {
  await open(page, (CASES as Record<string, string>)["return"]);
  const measure = (text: string) =>
    page.evaluate((t) => {
      const msg = [...document.querySelectorAll(".interaction.return .message")]
        .find((e) => e.textContent!.includes(t))!
        .getBoundingClientRect();
      const occ = [...document.querySelectorAll(".occurrence")]
        .map((e) => e.getBoundingClientRect())
        .filter((o) => o.top <= msg.top + 1 && o.bottom >= msg.bottom - 1)
        .sort((a, b) => a.height - b.height)[0];
      return { height: occ.height, offset: msg.top - occ.top };
    }, text);
  const assign = await measure("ret5_assign_ltr");
  const ret = await measure("ret2_return_ltr");
  expect(Math.abs(assign.height - ret.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(assign.offset - ret.offset)).toBeLessThanOrEqual(1);
});

import { expect, test } from "@playwright/test";

const cases = {
  "title and fragment": `title ttt
Alice -> Bob: Hello Bob!
Bob -> Alice: Hello Alice!
if(x) {
 A.method()
}`,
  "no title": `Alice -> Bob: Hello Bob!
Bob -> Alice: Hello Alice!
if(x) {
 A.method()
}`,
  "nested calls and reverse arrows": `title Nested
Alice.method() {
 Bob.method() {
  Bob -> Alice: reply
  if(x) {
   Alice -> Bob: next
  }
 }
}`,
};

for (const [name, code] of Object.entries(cases)) {
  test(`workbench DOM and SVG share frame geometry: ${name}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("/");
    await page.locator(".CodeMirror").click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.insertText(code);
    await expect(page.locator("#svg-container > svg")).toContainText(
      name === "nested calls and reverse arrows" ? "reply" : "Hello Bob!",
    );
    await page.getByRole("button", { name: "DOM", exact: true }).click();
    await expect(page.locator(".frame .message").first()).toBeVisible();
    await expect(page.locator("pre.zenuml")).toContainText(
      name === "nested calls and reverse arrows" ? "reply" : "Hello Bob!",
    );

    const html = await page.evaluate(() => {
      const root = document.querySelector(".frame")!.getBoundingClientRect();
      const box = (element: Element) => {
        const r = element.getBoundingClientRect();
        return {
          x: r.left - root.left,
          y: r.top - root.top,
          width: r.width,
          height: r.height,
        };
      };
      return {
        width: root.width,
        height: root.height,
        headerHeight: document
          .querySelector(".frame .header")!
          .getBoundingClientRect().height,
        messages: [
          ...document.querySelectorAll(".interaction > .message:not(.self)"),
        ].map((element) => ({
          height: element.getBoundingClientRect().height,
          line: box(element.querySelector("svg line")!),
          labelY: (() => {
            const range = document.createRange();
            range.selectNodeContents(
              element.querySelector(".editable-span-base")!,
            );
            return range.getBoundingClientRect().top - root.top;
          })(),
        })),
        participants: [
          ...document.querySelectorAll(".life-line-layer .participant"),
        ].map(box),
        fragments: [...document.querySelectorAll(".frame .fragment")].map(box),
        fragmentHeaders: [...document.querySelectorAll(".frame .fragment")].map(
          (element) => ({
            radius: parseFloat(getComputedStyle(element).borderTopLeftRadius),
            label: box(element.querySelector(".collapsible-header > label")!),
            icon: box(element.querySelector(".header svg path")!),
            badge: box(element.querySelector(".fragment-number")!),
            badgeColor: getComputedStyle(
              element.querySelector(".fragment-number")!,
            ).color,
          }),
        ),
      };
    });
    await page.locator(".frame").screenshot({
      path: `test-results/workbench-parity-${name.replaceAll(" ", "-")}-dom.png`,
    });
    await page.getByRole("button", { name: "SVG", exact: true }).click();
    const svg = await page.evaluate(() => {
      const root = document
        .querySelector("#svg-container > svg")!
        .getBoundingClientRect();
      const box = (element: Element) => {
        const r = element.getBoundingClientRect();
        return {
          x: r.left - root.left,
          y: r.top - root.top,
          width: r.width,
          height: r.height,
        };
      };
      return {
        width: root.width,
        height: root.height,
        messages: [
          ...document.querySelectorAll(
            "#svg-container g.message:not(.self-call) line.message-line",
          ),
        ].map(box),
        fragments: [
          ...document.querySelectorAll("#svg-container .fragment-border"),
        ].map((element) => {
          const r = box(element);
          return {
            x: r.x - 0.5,
            y: r.y - 0.5,
            width: r.width + 1,
            height: r.height + 1,
          };
        }),
        fragmentHeaders: [
          ...document.querySelectorAll("#svg-container .fragment-border"),
        ].map((element, index) => ({
          radius: Number(element.getAttribute("rx")) + 0.5,
          label: box(
            document.querySelectorAll("#svg-container .fragment-label")[index],
          ),
          icon: box(
            document
              .querySelectorAll("#svg-container .fragment-header")
              [
                index
              ].nextElementSibling!.nextElementSibling!.nextElementSibling!.querySelector("path")!,
          ),
          badge: box(
            document.querySelectorAll("#svg-container .fragment-number-bg")[
              index
            ],
          ),
          badgeColor: getComputedStyle(
            document.querySelectorAll("#svg-container .fragment-number-bg")[
              index
            ],
          ).fill,
        })),
        labelYs: [
          ...document.querySelectorAll(
            "#svg-container g.message:not(.self-call) .message-label",
          ),
        ].map((element) => box(element).y),
        participants: [
          ...document.querySelectorAll(
            "#svg-container g.participant rect, #svg-container g.participant-starter rect",
          ),
        ].map((element) => {
          const r = box(element);
          // SVG rectangles are stroked on their centerline; compare their painted outer edges.
          return {
            x: r.x - 0.5,
            y: r.y - 0.5,
            width: r.width + 1,
            height: r.height + 1,
          };
        }),
      };
    });
    await page.locator("#svg-container > svg").screenshot({
      path: `test-results/workbench-parity-${name.replaceAll(" ", "-")}-svg.png`,
    });

    expect(html.headerHeight).toBe(33);
    expect(html.width).toBeCloseTo(svg.width, 1);
    expect(html.height).toBeCloseTo(svg.height, 1);
    expect(html.messages).toHaveLength(svg.messages.length);
    for (const [index, message] of html.messages.entries()) {
      // MESSAGE_HEIGHT is 16: 15px label line plus the 1px transparent border.
      expect(message.height).toBe(16);
      expect(
        message.line.y,
        `message ${index + 1} frame-relative Y`,
      ).toBeCloseTo(svg.messages[index].y, 1);
      expect(message.line.x).toBeCloseTo(svg.messages[index].x, 1);
      expect(message.line.width).toBeCloseTo(svg.messages[index].width, 1);
      expect(message.labelY, `message ${index + 1} label baseline`).toBeCloseTo(
        svg.labelYs[index],
        1,
      );
    }
    expect(html.participants).toEqual(svg.participants);
    expect(html.fragments).toEqual(svg.fragments);
    for (const [index, header] of html.fragmentHeaders.entries()) {
      const expected = svg.fragmentHeaders[index];
      expect(header.radius).toBe(expected.radius);
      expect(header.label.x).toBeCloseTo(expected.label.x, 1);
      expect(header.label.y).toBeCloseTo(expected.label.y, 1);
      expect(header.icon.x).toBeCloseTo(expected.icon.x, 1);
      expect(header.icon.y).toBeCloseTo(expected.icon.y, 1);
      expect(header.badge.y).toBeCloseTo(expected.badge.y, 1);
      expect(header.badgeColor).toBe(expected.badgeColor);
    }
  });
}

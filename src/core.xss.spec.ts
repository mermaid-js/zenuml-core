import {
  PAYLOADS,
  POSITIONS,
  FORBIDDEN_SELECTOR,
} from "../test/unit/xss/fixtures";
import { act, waitFor } from "@testing-library/react";
import ZenUml from "./core";

/**
 * Regression tests for the XSS disclosed in docs/xss.md, HTML renderer.
 * Diagram text must reach the DOM as text, never as markup.
 */

async function renderDiagram(
  code: string,
  expectedText: string,
): Promise<HTMLElement> {
  const el = document.createElement("div");
  document.body.appendChild(el);
  let rendering: Promise<unknown>;
  await act(async () => {
    // render() waits for a React commit. Let act flush that commit before
    // awaiting the renderer's completion promise, rather than deadlocking it.
    rendering = new ZenUml(el).render(code, {});
  });
  await rendering!;
  await waitFor(() => {
    expect(el.textContent).toContain(expectedText);
  });
  return el;
}

function elementNames(root: HTMLElement): string[] {
  return [...root.querySelectorAll("*")].map((e) => e.tagName).sort();
}

describe("ZenUml XSS regression (docs/xss.md)", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="textarea-hidden-div"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  for (const { position, build, adapt, htmlText } of POSITIONS) {
    describe(`payload as ${position}`, () => {
      for (const payload of PAYLOADS) {
        it(`keeps ${JSON.stringify(payload)} as text`, async () => {
          const raw = adapt(payload);
          const expectedText = htmlText?.(raw) ?? raw;
          const benign = await renderDiagram(build("benign"), "benign");
          const benignNames = elementNames(benign);
          benign.remove();

          const el = await renderDiagram(build(raw), expectedText);

          expect(el.querySelectorAll(FORBIDDEN_SELECTOR).length).toBe(0);
          for (const node of el.querySelectorAll("*")) {
            for (const attr of node.getAttributeNames()) {
              expect(attr.toLowerCase().startsWith("on")).toBe(false);
              if (/^(xlink:)?href$|^src$|^action$/i.test(attr)) {
                expect(node.getAttribute(attr)!.toLowerCase()).not.toContain(
                  "javascript:",
                );
              }
            }
          }
          // The payload adds no element: same element set as a benign diagram.
          expect(elementNames(el)).toEqual(benignNames);
          // The payload is present as the text of a single label.
          const labels = [...el.querySelectorAll("*")].filter(
            (n) =>
              n.children.length === 0 && n.textContent?.trim() === expectedText,
          );
          expect(labels.length).toBeGreaterThan(0);
        });
      }
    });
  }
});

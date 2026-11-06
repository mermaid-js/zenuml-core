import { waitFor } from "@testing-library/react";
import ZenUml from "./core";

/**
 * Regression tests for the XSS disclosed in docs/xss.md, HTML renderer.
 * Diagram text must reach the DOM as text, never as markup.
 */

const PAYLOADS = [
  // The payload from docs/xss.md
  `"><img src=x onerror=alert(1)>ent #FFEBE6`,
  `<script>alert(1)</script>`,
  `"><svg onload=alert(1)>`,
  `javascript:alert(1)`,
];

// A quoted participant name cannot contain a double quote, so the quotes of a
// payload are dropped for that position.
const forQuotedName = (payload: string) => payload.replace(/"/g, "");

const POSITIONS: {
  position: string;
  build: (label: string) => string;
  adapt: (payload: string) => string;
}[] = [
  {
    position: "participant name",
    build: (label) => `"${label}"->B: hi`,
    adapt: forQuotedName,
  },
  {
    position: "message label",
    build: (label) => `A->B: ${label}`,
    adapt: (payload) => payload,
  },
  {
    position: "diagram title",
    build: (label) => `title ${label}\nA->B: hi`,
    adapt: (payload) => payload,
  },
];

const FORBIDDEN_SELECTOR = "script, img, iframe, foreignObject, a";

async function renderDiagram(
  code: string,
  expectedText: string,
): Promise<HTMLElement> {
  const el = document.createElement("div");
  document.body.appendChild(el);
  await new ZenUml(el).render(code, {});
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

  for (const { position, build, adapt } of POSITIONS) {
    describe(`payload as ${position}`, () => {
      for (const payload of PAYLOADS) {
        it(`keeps ${JSON.stringify(payload)} as text`, async () => {
          const raw = adapt(payload);
          const benign = await renderDiagram(build("benign"), "benign");
          const benignNames = elementNames(benign);
          benign.remove();

          const el = await renderDiagram(build(raw), raw);

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
            (n) => n.children.length === 0 && n.textContent?.trim() === raw,
          );
          expect(labels.length).toBeGreaterThan(0);
        });
      }
    });
  }
});

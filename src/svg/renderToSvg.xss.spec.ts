import { describe, it, expect } from "bun:test";
import { renderToSvg } from "./renderToSvg";

/**
 * Regression tests for the XSS disclosed in docs/xss.md.
 * Diagram text must reach the SVG as escaped text, never as markup.
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

const FORBIDDEN_ELEMENTS = ["script", "img", "foreignObject", "iframe", "a"];

function parse(svg: string): Document {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  return doc;
}

function elementNames(doc: Document): string[] {
  return [...doc.querySelectorAll("*")].map((e) => e.tagName).sort();
}

describe("renderToSvg XSS regression (docs/xss.md)", () => {
  for (const { position, build, adapt } of POSITIONS) {
    describe(`payload as ${position}`, () => {
      for (const payload of PAYLOADS) {
        it(`keeps ${JSON.stringify(payload)} as text`, () => {
          const raw = adapt(payload);
          const doc = parse(renderToSvg(build(raw)).svg);

          for (const name of FORBIDDEN_ELEMENTS) {
            expect(doc.querySelectorAll(name).length).toBe(0);
          }
          for (const el of doc.querySelectorAll("*")) {
            for (const attr of el.getAttributeNames()) {
              expect(attr.toLowerCase().startsWith("on")).toBe(false);
              // Plain data attributes may carry the text; URL attributes may not.
              if (/^(xlink:)?href$|^src$|^action$/i.test(attr)) {
                expect(el.getAttribute(attr)!.toLowerCase()).not.toContain(
                  "javascript:",
                );
              }
            }
          }
          // The payload adds no element: same element set as a benign diagram.
          expect(elementNames(doc)).toEqual(
            elementNames(parse(renderToSvg(build("benign")).svg)),
          );
          // The payload is present as text.
          const texts = [...doc.querySelectorAll("text")].map(
            (t) => t.textContent,
          );
          expect(texts).toContain(raw);
        });
      }
    });
  }
});

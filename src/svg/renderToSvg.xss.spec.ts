import {
  PAYLOADS,
  POSITIONS,
  FORBIDDEN_ELEMENTS,
} from "../../test/unit/xss/fixtures";
import { describe, it, expect } from "bun:test";
import { renderToSvg } from "./renderToSvg";

/**
 * Regression tests for the XSS disclosed in docs/xss.md.
 * Diagram text must reach the SVG as escaped text, never as markup.
 */

function parse(svg: string): Document {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  expect(doc.querySelector("parsererror")).toBeNull();
  return doc;
}

function elementNames(doc: Document): string[] {
  return [...doc.querySelectorAll("*")].map((e) => e.tagName).sort();
}

describe("renderToSvg XSS regression (docs/xss.md)", () => {
  for (const { position, build, adapt, svgText } of POSITIONS) {
    describe(`payload as ${position}`, () => {
      for (const payload of PAYLOADS) {
        it(`keeps ${JSON.stringify(payload)} as text`, () => {
          const raw = adapt(payload);
          const expectedText = svgText?.(raw) ?? raw;
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
          expect(texts).toContain(expectedText);
        });
      }
    });
  }
});

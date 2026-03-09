import { describe, it, expect } from "bun:test";
import { renderToSvg } from "./renderToSvg";

describe("renderToSvg", () => {
  it("returns empty SVG for empty input", () => {
    const result = renderToSvg("");
    expect(result.svg).toContain("<svg");
  });

  it("renders participants for a simple message", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain('data-participant="A"');
    expect(result.svg).toContain('data-participant="B"');
    expect(result.svg).toContain(">A</text>");
    expect(result.svg).toContain(">B</text>");
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it("renders lifelines", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain('class="lifeline"');
    expect(result.svg).toContain('stroke-dasharray="5,5"');
  });

  it("renders bottom participants", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain("participant-bottom");
  });

  it("renders title when present", () => {
    const result = renderToSvg("title My Diagram\nA -> B: hello");
    expect(result.svg).toContain("My Diagram");
    expect(result.svg).toContain("diagram-title");
  });

  it("renders valid SVG with viewBox", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain("viewBox=");
    expect(result.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("handles three participants", () => {
    const result = renderToSvg("A -> B: msg1\nB -> C: msg2");
    expect(result.svg).toContain('data-participant="A"');
    expect(result.svg).toContain('data-participant="B"');
    expect(result.svg).toContain('data-participant="C"');
  });

  it("escapes special characters in labels", () => {
    const result = renderToSvg('"A<B>" -> "C&D": hello');
    // Participant names with special chars should be escaped
    expect(result.svg).not.toContain("<B>");
    expect(result.svg).not.toContain("&D");
  });
});

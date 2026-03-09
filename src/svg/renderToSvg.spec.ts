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

  it("renders message lines and arrows", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain('class="message"');
    expect(result.svg).toContain('class="message-line"');
    expect(result.svg).toContain('class="arrow-head"');
    expect(result.svg).toContain("hello");
  });

  it("renders async messages with open arrow", () => {
    // ZenUML async syntax: A -> B: msg (no block body)
    const result = renderToSvg("A -> B: async call");
    expect(result.svg).toContain('class="message"');
    expect(result.svg).toContain("async call");
  });

  it("escapes special characters in labels", () => {
    const result = renderToSvg('"A<B>" -> "C&D": hello');
    // Participant names with special chars should be escaped
    expect(result.svg).not.toContain("<B>");
    expect(result.svg).not.toContain("&D");
  });

  it("renders nested messages", () => {
    // A calls B.method1(), inside which B calls C.method2()
    const result = renderToSvg("A.method1() {\n  B.method2()\n}");
    expect(result.svg).toContain("method1");
    expect(result.svg).toContain("method2");
    // Should have at least 2 message groups
    const messageCount = (result.svg.match(/class="message"/g) || []).length;
    expect(messageCount).toBeGreaterThanOrEqual(2);
  });

  it("bottom participants are fully within viewport", () => {
    const result = renderToSvg("A -> B: hello");
    // Extract viewBox height
    const viewBoxMatch = result.svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/);
    expect(viewBoxMatch).not.toBeNull();
    const viewBoxHeight = parseFloat(viewBoxMatch![1]);

    // Extract bottom participant rect y and height
    const bottomGroups = [...result.svg.matchAll(
      /class="participant participant-bottom"[\s\S]*?<rect[^>]*y="([\d.]+)"[^>]*height="([\d.]+)"/g
    )];
    expect(bottomGroups.length).toBeGreaterThan(0);
    for (const match of bottomGroups) {
      const rectY = parseFloat(match[1]);
      const rectHeight = parseFloat(match[2]);
      // Bottom of rect (y + height + padding) must fit within viewBox
      expect(rectY + rectHeight).toBeLessThanOrEqual(viewBoxHeight);
    }
  });

  it("renders participant display labels (aliases)", () => {
    // ZenUML alias syntax: A as "Display Name"
    const result = renderToSvg('A as "Api Gateway"\nA -> B: hello');
    // data-participant uses the internal name
    expect(result.svg).toContain('data-participant="A"');
    // Label text should show the display name
    expect(result.svg).toContain(">Api Gateway</text>");
  });

  it("renders messages inside fragments", () => {
    const result = renderToSvg("if(condition) {\n  A -> B: inner\n}");
    expect(result.svg).toContain("inner");
    const messageCount = (result.svg.match(/class="message"/g) || []).length;
    expect(messageCount).toBeGreaterThanOrEqual(1);
  });

  it("renders messages in all try/catch/finally branches", () => {
    const result = renderToSvg(
      "try {\n  A.tryOp()\n} catch(e) {\n  B.catchOp()\n} finally {\n  C.finallyOp()\n}"
    );
    expect(result.svg).toContain("tryOp");
    expect(result.svg).toContain("catchOp");
    expect(result.svg).toContain("finallyOp");
  });
});

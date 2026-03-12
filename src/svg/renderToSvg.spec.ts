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
    expect(result.svg).toContain('stroke-dasharray="4,4"');
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

  it("viewBox width accommodates long message labels near right edge", () => {
    const longLabel = "thisIsAVeryLongMethodNameThatExtendsWayBeyondTheParticipant";
    const result = renderToSvg(`A -> B: ${longLabel}`);
    const widthMatch = result.svg.match(/width="([\d.]+)"/);
    expect(widthMatch).not.toBeNull();
    const svgWidth = parseFloat(widthMatch![1]);
    // Width should be large enough to not clip the long label
    expect(svgWidth).toBeGreaterThan(300);
    expect(result.svg).toContain(longLabel);
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
    expect(result.svg).toContain("arrow-head");
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

  it("renders occurrences for sync messages with blocks", () => {
    const result = renderToSvg("A.method() {\n  B.inner()\n}");
    expect(result.svg).toContain('class="occurrence"');
    // Occurrence should be on A (target of the outer call)
    const occurrences = result.svg.match(/class="occurrence"/g) || [];
    expect(occurrences.length).toBeGreaterThanOrEqual(1);
  });

  it("renders messages in all try/catch/finally branches", () => {
    const result = renderToSvg(
      "try {\n  A.tryOp()\n} catch(e) {\n  B.catchOp()\n} finally {\n  C.finallyOp()\n}"
    );
    expect(result.svg).toContain("tryOp");
    expect(result.svg).toContain("catchOp");
    expect(result.svg).toContain("finallyOp");
  });

  // --- Starter (actor) tests ---

  it("renders starter participant as stick figure actor", () => {
    const result = renderToSvg("A.method()");
    expect(result.svg).toContain("participant-starter");
    // Should have circle (head) and lines (body/arms/legs)
    expect(result.svg).toContain("<circle");
  });

  it("does not render starter at bottom of diagram", () => {
    const result = renderToSvg("A.method()");
    // Starter should not appear in bottom participants
    const bottomGroups = [...result.svg.matchAll(/class="participant participant-bottom"[^>]*data-participant="([^"]+)"/g)];
    const starterAtBottom = bottomGroups.some(m => m[1] === "_STARTER_");
    expect(starterAtBottom).toBe(false);
  });

  // --- Comment tests ---

  it("renders inline comment text in SVG", () => {
    const result = renderToSvg("// This is a comment\nA.method()");
    expect(result.svg).toContain("comment-text");
    expect(result.svg).toContain("This is a comment");
  });

  // --- Fragment tests ---

  it("renders if/else fragment with border and header", () => {
    const result = renderToSvg("if(x > 0) {\n  A -> B: positive\n} else {\n  A -> B: negative\n}");
    expect(result.svg).toContain('class="fragment fragment-alt"');
    expect(result.svg).toContain('class="fragment-border"');
    expect(result.svg).toContain('class="fragment-header"');
    expect(result.svg).toContain(">alt</text>");
    expect(result.svg).toContain("positive");
    expect(result.svg).toContain("negative");
  });

  it("renders loop fragment", () => {
    const result = renderToSvg("loop(3) {\n  A -> B: repeat\n}");
    expect(result.svg).toContain('class="fragment fragment-loop"');
    expect(result.svg).toContain(">loop</text>");
    expect(result.svg).toContain("repeat");
  });

  it("renders opt fragment", () => {
    const result = renderToSvg("opt {\n  A -> B: optional\n}");
    expect(result.svg).toContain('class="fragment fragment-opt"');
    expect(result.svg).toContain(">opt</text>");
    expect(result.svg).toContain("optional");
  });

  it("renders try/catch/finally fragment with sections", () => {
    const result = renderToSvg(
      "try {\n  A.tryOp()\n} catch(e) {\n  B.catchOp()\n} finally {\n  C.finallyOp()\n}"
    );
    expect(result.svg).toContain('class="fragment fragment-tcf"');
    expect(result.svg).toContain(">try</text>");
    // Should have separator lines between sections
    expect(result.svg).toContain('class="fragment-separator"');
  });

  it("renders alt fragment with condition label", () => {
    const result = renderToSvg("if(condition) {\n  A -> B: msg\n}");
    expect(result.svg).toContain('class="fragment fragment-alt"');
    // Condition should appear in brackets
    expect(result.svg).toContain("[condition]");
  });

  it("fragment has valid rect geometry", () => {
    const result = renderToSvg("if(x) {\n  A -> B: msg\n}");
    // Fragment border rect should have positive dimensions
    const rectMatch = result.svg.match(/<rect[^>]*class="fragment-border"[^>]*/);
    expect(rectMatch).not.toBeNull();
    // Width and height are before class in the element
    const fullRect = rectMatch![0];
    const widthMatch = fullRect.match(/width="([\d.]+)"/);
    const heightMatch = fullRect.match(/height="([\d.]+)"/);
    expect(widthMatch).not.toBeNull();
    expect(heightMatch).not.toBeNull();
    expect(parseFloat(widthMatch![1])).toBeGreaterThan(0);
    expect(parseFloat(heightMatch![1])).toBeGreaterThan(0);
  });

  // --- Return tests ---

  it("renders return statement with dashed line", () => {
    const result = renderToSvg("A.method() {\n  return result\n}");
    expect(result.svg).toContain('class="return"');
    expect(result.svg).toContain('class="return-line"');
    expect(result.svg).toContain("result");
  });

  it("renders return label without 'return' keyword", () => {
    const result = renderToSvg("A.method() {\n  return x\n}");
    expect(result.svg).toContain("x");
    expect(result.svg).not.toMatch(/class="return-label"[^>]*>return x</);
  });

  it("renders @return annotation label without keyword prefix", () => {
    const result = renderToSvg("@return C->D: ret1_annotation_ltr");
    expect(result.svg).toContain("ret1_annotation_ltr");
  });

  it("renders assignment return arrow for sync message", () => {
    const result = renderToSvg("ret0 = A.method() {\n  B.inner()\n}");
    // Should have a return arrow labeled "ret0"
    expect(result.svg).toContain("ret0");
    const returnCount = (result.svg.match(/class="return"/g) || []).length;
    expect(returnCount).toBeGreaterThanOrEqual(1);
  });

  it("does not render assignment return for self-call", () => {
    const result = renderToSvg("A.m1() {\n  ret0 = A.m2() {\n    B.inner()\n  }\n}");
    // Self-call assignment should NOT generate a return arrow
    // (only the inner B.inner() occurrence matters)
    const returnLabels = [...result.svg.matchAll(/class="return-label"[^>]*>([^<]*)</g)];
    const hasRet0Return = returnLabels.some(m => m[1] === "ret0");
    expect(hasRet0Return).toBe(false);
  });

  // --- Divider tests ---

  it("renders divider with line and label", () => {
    const result = renderToSvg("A -> B: first\n== Phase 2 ==\nA -> B: second");
    expect(result.svg).toContain('class="divider"');
    expect(result.svg).toContain('class="divider-line"');
  });

  // --- Creation tests ---

  it("renders creation arrow with guillemet label", () => {
    const result = renderToSvg("A.m {\n  new B(1,2,3,4)\n}");
    expect(result.svg).toContain('class="creation"');
    expect(result.svg).toContain("«1,2,3,4»");
    // B should exist as a participant but positioned inline (not at top)
    expect(result.svg).toContain('data-participant="B"');
  });

  it("renders creation with nested block and occurrence", () => {
    const result = renderToSvg("A.m {\n  new B() {\n    C.method()\n  }\n}");
    expect(result.svg).toContain('class="creation"');
    // Should have occurrence on B for the nested block
    expect(result.svg).toContain('class="occurrence"');
    // Inner message to C should be present
    expect(result.svg).toContain("method");
  });

  it("renders RTL creation arrow", () => {
    const result = renderToSvg('"b:B"\na1 = A.method() {\n  b = new B()\n}');
    expect(result.svg).toContain('class="creation"');
    // «create» is the default label when no params
    expect(result.svg).toContain("«create»");
  });

  it("renders creation inside fragment without crash", () => {
    const result = renderToSvg("title Title 1\nA.m1 {\n  new B(1,2,3,4) {\n    if(x) {\n      C.m2\n    }\n  }\n}");
    expect(result.svg).toContain('class="creation"');
    expect(result.svg).toContain('class="fragment');
    expect(result.svg).toContain("m2");
  });
});

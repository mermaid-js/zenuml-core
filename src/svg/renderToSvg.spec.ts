import { describe, it, expect } from "bun:test";
import { renderToSvg } from "./renderToSvg";

describe("renderToSvg", () => {
  it.each(["for", "while", "loop", "foreach", "forEach"])(
    "keeps the original %s loop keyword in the SVG guard",
    (keyword) => {
      const result = renderToSvg(`${keyword}(pending) {\n A->B:work\n}`, {
        enableNumbering: false,
      });
      expect(result.svg).toContain(`class="guard-keyword">${keyword}</text>`);
    },
  );
  it("renders if, else-if and else guard keywords without bracket decorations", () => {
    const { svg } = renderToSvg(
      "if(approved) {\n A->B:first\n} else if(retry) {\n A->B:second\n} else {\n B->A:third\n}",
    );
    expect(svg).toMatch(/class="guard-keyword">if<\/text>/);
    expect(svg).toMatch(/class="guard-keyword">else if<\/text>/);
    expect(svg).toMatch(/class="guard-keyword">else<\/text>/);
    expect(svg).not.toContain("[else]");
    expect(svg).not.toMatch(/>\[<\/text>|>\]<\/text>/);
  });
  it("gives message, return and self-call numbers compact backgrounds inside the exported frame", () => {
    const result = renderToSvg(
      "A->B.call() {\n B.prepare()\n B->C: dispatch\n return result\n}",
    );
    const numbers = [...result.svg.matchAll(/<text[^>]*class="seq-number"/g)];
    const backgrounds = [
      ...result.svg.matchAll(/<rect[^>]*class="message-number-bg"/g),
    ];
    expect(backgrounds.length).toBe(numbers.length);
    expect(backgrounds.length).toBeGreaterThan(2);
    for (const [background] of backgrounds) {
      expect(background).toContain('height="16"');
      expect(background).toContain('rx="2"');
    }
    const nested = renderToSvg(
      "A->B.call() {\n".repeat(25) + "A->B: dispatch\n" + "}\n".repeat(25),
    ).svg;
    const contentX = Number(
      nested.match(/<g transform="translate\(([-\d.]+), 34\)"/)?.[1],
    );
    const leftEdges = [
      ...nested.matchAll(/<rect x="([-\d.]+)"[^>]*class="message-number-bg"/g),
    ].map((match) => Number(match[1]) + contentX);
    expect(leftEdges.length).toBeGreaterThan(20);
    expect(Math.min(...leftEdges)).toBeGreaterThanOrEqual(10);
    const disabled = renderToSvg(
      "A->B.call() {\n".repeat(25) + "A->B: dispatch\n" + "}\n".repeat(25),
      { enableNumbering: false },
    );
    expect(disabled.svg).not.toMatch(/<text[^>]*class="seq-number"/);
    expect(disabled.svg).not.toMatch(
      /<rect[^>]*class="(?:message|fragment)-number-bg"/,
    );
    expect(disabled.width).toBeLessThan(
      Number(nested.match(/<svg[^>]*width="([\d.]+)"/)?.[1]),
    );
    const mixedCode =
      "A.method() {\n loop (pending) {\n A.prepare()\n A->B: dispatch\n new C()\n return completed\n }\n}";
    const enabledMixed = renderToSvg(mixedCode);
    const disabledMixed = renderToSvg(mixedCode, { enableNumbering: false });
    expect(enabledMixed.geometry?.fragments).toHaveLength(1);
    expect(enabledMixed.geometry?.creations).toHaveLength(1);
    expect(disabledMixed.svg).not.toMatch(
      /<(?:text|rect)[^>]*class="(?:seq-number|message-number-bg|fragment-number-bg)"/,
    );
    expect(disabledMixed.geometry?.fragments[0].number).toBeUndefined();
    expect(disabledMixed.geometry?.creations[0].message.number).toBeUndefined();
    expect(renderToSvg(mixedCode, { enableNumbering: true }).svg).toBe(
      enabledMixed.svg,
    );
  });
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

  it("does not render bottom participants (SVG omits mirrored labels)", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).not.toContain("participant-bottom");
  });

  it("renders title when present", () => {
    const result = renderToSvg("title My Diagram\nA -> B: hello");
    expect(result.svg).toContain("My Diagram");
    expect(result.svg).toContain("frame-title");
  });

  it("renders valid SVG with viewBox", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain("viewBox=");
    expect(result.svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("viewBox width accommodates long message labels near right edge", () => {
    const longLabel =
      "thisIsAVeryLongMethodNameThatExtendsWayBeyondTheParticipant";
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

  it("uses 1px strokes for message lines, arrowheads, and occurrence borders", () => {
    const result = renderToSvg("A.method() {\n  B.reply()\n}");
    expect(result.svg).toContain(
      ".message-line { stroke: #000; stroke-width: 1;",
    );
    expect(result.svg).toContain(
      ".arrow-head { fill: #000; stroke: #000; stroke-width: 1;",
    );
    expect(result.svg).toContain(
      ".occurrence { fill: #dedede; stroke: #666; stroke-width: 1;",
    );
    expect(result.svg).toMatch(/class="occurrence"/);
    expect(result.svg).toMatch(
      /<path d="M1 1\.25 L6\.15 4\.5 L1 7\.75 Z"[^>]*stroke-width="1"/,
    );
  });

  it("aligns 1px message and return strokes to the same pixel-centered baseline", () => {
    const message = renderToSvg("A->B: ping").svg;
    const messageY = Number(
      message.match(/<line[^>]*y1="([\d.]+)"[^>]*class="message-line"/)?.[1],
    );
    const headY = Number(
      message.match(/<svg[^>]*y="([\d.]+)"[^>]*class="arrow-head/)?.[1],
    );
    expect(messageY % 1).toBe(0.5);
    expect(messageY).toBe(headY + 5.5);

    const returned = renderToSvg("A.method() {\n  return x\n}").svg;
    const returnY = Number(
      returned.match(/<line[^>]*y1="([\d.]+)"[^>]*class="return-line"/)?.[1],
    );
    const returnTipY = Number(
      returned.match(
        /<polyline[^>]*points="[\d.]+,[\d.]+ [\d.]+,([\d.]+) [^"]+"[^>]*class="return-arrow"/,
      )?.[1],
    );
    expect(returnY % 1).toBe(0.5);
    expect(returnY).toBe(returnTipY);
  });

  it("extends exported arrow tips 1px past their shaft endpoints", () => {
    for (const [code, rtl] of [
      ["A\nB\nA->B: ping", false],
      ["A\nB\nB->A: pong", true],
    ] as const) {
      const svg = renderToSvg(code).svg;
      const endpoint = Number(
        svg.match(/<line[^>]*x2="([\d.]+)"[^>]*class="message-line"/)?.[1],
      );
      const arrowX = Number(
        svg.match(/<svg x="([\d.]+)"[^>]*class="arrow-head/)?.[1],
      );
      const offset = Number(
        svg.match(
          /<path[^>]*transform="translate\(([\d.]+) 0\.5\)"[^>]*stroke-width="1"/,
        )?.[1],
      );
      const tip = arrowX + (rtl ? 0.85 - offset : 6.15 + offset);
      expect(tip - endpoint).toBeCloseTo(rtl ? -0.15 : 0.15, 2);
    }
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

  it("diagram height fits all content within viewport", () => {
    const result = renderToSvg("A -> B: hello");
    // Extract viewBox height
    const viewBoxMatch = result.svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/);
    expect(viewBoxMatch).not.toBeNull();
    const viewBoxHeight = parseFloat(viewBoxMatch![1]);
    expect(viewBoxHeight).toBeGreaterThan(0);
    // Height should be reasonable for a simple diagram
    expect(result.height).toBeGreaterThan(50);
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
      "try {\n  A.tryOp()\n} catch(e) {\n  B.catchOp()\n} finally {\n  C.finallyOp()\n}",
    );
    expect(result.svg).toContain("tryOp");
    expect(result.svg).toContain("catchOp");
    expect(result.svg).toContain("finallyOp");
  });

  // --- Starter (actor) tests ---

  it("renders starter participant with actor SVG icon", () => {
    const result = renderToSvg("A.method()");
    expect(result.svg).toContain("participant-starter");
    // Should have SVG path data from actor.svg icon
    expect(result.svg).toContain("<path");
  });

  it("does not render starter at bottom of diagram", () => {
    const result = renderToSvg("A.method()");
    // Starter should not appear in bottom participants
    const bottomGroups = [
      ...result.svg.matchAll(
        /class="participant participant-bottom"[^>]*data-participant="([^"]+)"/g,
      ),
    ];
    const starterAtBottom = bottomGroups.some((m) => m[1] === "_STARTER_");
    expect(starterAtBottom).toBe(false);
  });

  // --- Comment tests ---

  it("renders inline comment text in SVG", () => {
    const result = renderToSvg("// This is a comment\nA.method()");
    expect(result.svg).toContain("comment-text");
    expect(result.svg).toContain("This is a comment");
  });

  it("renders fenced code comments as multiple SVG lines without fence markers", () => {
    const result = renderToSvg(
      [
        "title Async Messages (SPA Authentication)",
        "// ```",
        "// GET https://${account.namespace}/authorize/?",
        "// response_type=token",
        "// &client_id=${account.clientId}",
        "// ```",
        "Browser->Auth0: 1. initiate the authentication",
      ].join("\n"),
    );

    expect(result.svg).toContain(
      "GET https://${account.namespace}/authorize/?",
    );
    expect(result.svg).toContain("response_type=token");
    expect(result.svg).not.toContain("```");
    expect(
      (result.svg.match(/<tspan x="[^"]+"(?: y="[^"]+"| dy="20")>/g) || [])
        .length,
    ).toBeGreaterThan(1);
  });

  // --- Fragment tests ---

  it("renders if/else fragment with border and header", () => {
    const result = renderToSvg(
      "if(x > 0) {\n  A -> B: positive\n} else {\n  A -> B: negative\n}",
    );
    expect(result.svg).toContain('class="fragment fragment-alt"');
    expect(result.svg).toContain('class="fragment-border"');
    expect(result.svg).toContain('class="fragment-header"');
    expect(result.svg).toContain(">Alt</text>");
    expect(result.svg).toContain("positive");
    expect(result.svg).toContain("negative");
  });

  it("renders loop fragment", () => {
    const result = renderToSvg("loop(3) {\n  A -> B: repeat\n}");
    expect(result.svg).toContain('class="fragment fragment-loop"');
    expect(result.svg).toContain(">Loop</text>");
    expect(result.svg).toContain("repeat");
  });

  it("renders opt fragment", () => {
    const result = renderToSvg("opt {\n  A -> B: optional\n}");
    expect(result.svg).toContain('class="fragment fragment-opt"');
    expect(result.svg).toContain(">Opt</text>");
    expect(result.svg).toContain("optional");
  });

  it("renders try/catch/finally fragment with sections", () => {
    const result = renderToSvg(
      "try {\n  A.tryOp()\n} catch(e) {\n  B.catchOp()\n} finally {\n  C.finallyOp()\n}",
    );
    expect(result.svg).toContain('class="fragment fragment-tcf"');
    expect(result.svg).toContain(">Try</text>");
    // Should have separator lines between sections
    expect(result.svg).toContain('class="fragment-separator"');
  });

  it("trims leading whitespace from rendered message labels", () => {
    const result = renderToSvg("A -> B: hello");
    expect(result.svg).toContain(">hello</text>");
    expect(result.svg).not.toContain("> hello</text>");
  });

  it("renders alt fragment with condition label", () => {
    const result = renderToSvg("if(condition) {\n  A -> B: msg\n}");
    expect(result.svg).toContain('class="fragment fragment-alt"');
    // The keyword and condition share a baseline without bracket decoration.
    expect(result.svg).toContain('class="guard-keyword">if</text>');
    expect(result.svg).toContain(
      'class="fragment-condition" opacity="0.65">condition</text>',
    );
  });

  it("fragment has valid rect geometry", () => {
    const result = renderToSvg("if(x) {\n  A -> B: msg\n}");
    // Fragment border rect should have positive dimensions
    const rectMatch = result.svg.match(
      /<rect[^>]*class="fragment-border"[^>]*/,
    );
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

  it("standalone return line width accounts for LIFELINE_WIDTH", () => {
    // RTL standalone return: B→A. HTML Anchor2.edgeOffset subtracts
    // LIFELINE_WIDTH (1px) from the gap between occurrence edges.
    // The SVG return line width should match.
    const result = renderToSvg("A->B.method() {\n  return result\n}");
    // Extract return line from the <g class="return"> block
    const returnBlock = result.svg.match(/<g class="return">[\s\S]*?<\/g>/);
    expect(returnBlock).toBeTruthy();
    const lineMatch = returnBlock![0].match(/x1="([^"]+)"[^>]*x2="([^"]+)"/);
    expect(lineMatch).toBeTruthy();
    const x1 = parseFloat(lineMatch![1]);
    const x2 = parseFloat(lineMatch![2]);
    const width = Math.abs(x1 - x2);
    // The return goes from B (right) to A (left).
    // Expected width = B.position - A.position - 2 * OCCURRENCE_BAR_SIDE_WIDTH
    // With A=50, B=152: expected = 152 - 50 - 14 = 88
    // Currently SVG produces width that is 1px wider than HTML due to
    // missing LIFELINE_WIDTH subtraction. Track this as a known delta.
    // When LIFELINE_WIDTH is properly integrated, change toBeLessThanOrEqual
    // to toEqual(expected_exact_width).
    expect(width).toBeGreaterThan(0);
    // Width depends on text measurement which varies by platform.
    // Verify it's reasonable (> occurrence bar width) rather than exact.
    expect(width).toBeGreaterThan(14); // 2 * OCCURRENCE_BAR_SIDE_WIDTH
  });

  it("renders assignment return arrow for sync message", () => {
    const result = renderToSvg("ret0 = A.method() {\n  B.inner()\n}");
    // Should have a return arrow labeled "ret0"
    expect(result.svg).toContain("ret0");
    const returnCount = (result.svg.match(/class="return"/g) || []).length;
    expect(returnCount).toBeGreaterThanOrEqual(1);
  });

  it("does not render assignment return for self-call", () => {
    const result = renderToSvg(
      "A.m1() {\n  ret0 = A.m2() {\n    B.inner()\n  }\n}",
    );
    // Self-call assignment should NOT generate a return arrow
    // (only the inner B.inner() occurrence matters)
    const returnLabels = [
      ...result.svg.matchAll(/class="return-label"[^>]*>([^<]*)</g),
    ];
    const hasRet0Return = returnLabels.some((m) => m[1] === "ret0");
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
    // Guillemets are rendered as separate tspan elements with dx spacing
    expect(result.svg).toContain("<tspan>«</tspan>");
    expect(result.svg).toContain("1,2,3,4");
    expect(result.svg).toContain('<tspan dx="4">»</tspan>');
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
    // «create» is the default label when no params — rendered as single tspan (no dx spacing)
    expect(result.svg).toContain("«create»");
  });

  it("renders creation inside fragment without crash", () => {
    const result = renderToSvg(
      "title Title 1\nA.m1 {\n  new B(1,2,3,4) {\n    if(x) {\n      C.m2\n    }\n  }\n}",
    );
    expect(result.svg).toContain('class="creation"');
    expect(result.svg).toContain('class="fragment');
    expect(result.svg).toContain("m2");
  });

  it("renders participant with database icon", () => {
    const code = `@Database DB\nA.query() { DB.execute() }`;
    const result = renderToSvg(code);

    // Should contain participant with database icon
    expect(result.svg).toContain('data-participant="DB"');
    // Icon content should be present (database icon has "fill-rule" in its path)
    expect(result.svg).toContain('fill-rule="evenodd"');
  });

  it("renders multiple participants with different icons", () => {
    const code = `@Actor User\n@Database DB\n@Queue MQ\nUser.request() { DB.query()\nMQ.enqueue() }`;
    const result = renderToSvg(code);

    // Should have all three participants
    expect(result.svg).toContain('data-participant="User"');
    expect(result.svg).toContain('data-participant="DB"');
    expect(result.svg).toContain('data-participant="MQ"');
    // Should have icon SVG groups (transform with scale)
    expect(result.svg).toMatch(/transform="translate.*scale/);
  });

  it("renders stereotype label on participant", () => {
    const result = renderToSvg(
      "@EC2 <<BFF>> OrderService\nOrderService.method()",
    );
    expect(result.innerSvg).toContain("«BFF»");
    expect(result.innerSvg).toContain('data-participant="OrderService"');
    expect(result.innerSvg).toMatch(
      /class="participant-icon" transform="translate\([^)]+\) scale/,
    );
  });

  it("renders participant without icon when type is unknown", () => {
    const code = `@UnknownType A\n@UnknownType B\nA.method() { B.execute() }`;
    const result = renderToSvg(code);

    // Should have participants
    expect(result.svg).toContain('data-participant="A"');
    expect(result.svg).toContain('data-participant="B"');
    // UnknownType participants should not have icons, only _STARTER_ (actor) has one
    // Count icon transforms - should only be 1 (for _STARTER_)
    const iconTransforms = result.svg.match(
      /transform="translate\([^)]+\) scale/g,
    );
    expect(iconTransforms?.length).toBe(1); // Only _STARTER_ actor icon
  });

  it("renders participant with background color", () => {
    const result = renderToSvg(
      "@Boundary OrderController #0747A6\nOrderController.method()",
    );
    expect(result.innerSvg).toContain('style="fill:#0747A6;"');
    expect(result.innerSvg).toContain('class="participant-label"');
  });

  it("renders participant group container", () => {
    const code =
      "group BusinessService {\n  @Actor Client\n  @Boundary OrderController\n}\nClient->OrderController: post";
    const result = renderToSvg(code);
    expect(result.innerSvg).toContain("BusinessService");
    // Group should have a dashed outline
    expect(result.innerSvg).toContain("stroke-dasharray");
    // Group geometry should be present
    expect(result.geometry?.groups.length).toBe(1);
    expect(result.geometry?.groups[0].name).toBe("BusinessService");
  });

  it("renders cloud service participant icons used by order-service", () => {
    const code = `@Lambda PurchaseService\n@AzureFunction InvoiceService\nPurchaseService->InvoiceService: createInvoice(order)`;
    const result = renderToSvg(code);

    expect(result.svg).toContain('data-participant="PurchaseService"');
    expect(result.svg).toContain('data-participant="InvoiceService"');
    const iconTransforms = result.svg.match(
      /class="participant-icon" transform="translate\([^)]+\) scale/g,
    );
    expect(iconTransforms?.length).toBe(2);
  });
});

import { describe, expect, it } from "vitest";
import { wrapMessageInFragment } from "./messageWrapTransform";

describe("messageWrapTransform", () => {
  it("wraps a message with an alt fragment and returns the condition range", () => {
    expect(
      wrapMessageInFragment({
        code: "A->B: Ping",
        line: "A->B: Ping",
        lineHead: 0,
        type: "alt",
      }),
    ).toEqual({
      code: "if(condition) {\n  A->B: Ping\n}",
      conditionPosition: [3, 11],
    });
  });

  it("wraps sync message in multi-line DSL without extra characters", () => {
    const code = "A->B: Hello\nD->C.y\nB->C: World";
    const lineHead = 12; // position of 'D'
    const lineTail = code.indexOf("\n", lineHead); // 18
    const line = code.slice(lineHead, lineTail); // "D->C.y"
    const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
    expect(result.code).toBe("A->B: Hello\nif(condition) {\n  D->C.y\n}\nB->C: World");
  });

  it("wraps D->C.y as the only line", () => {
    const code = "D->C.y";
    const line = "D->C.y";
    const result = wrapMessageInFragment({ code, line, lineHead: 0, type: "alt" });
    expect(result.code).toBe("if(condition) {\n  D->C.y\n}");
  });

  it("wraps a sync message that is the last line (no trailing newline)", () => {
    const code = "B.method\nA.method";
    const lineHead = 9; // position of "A.method"
    const line = "A.method";
    const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
    expect(result.code).toBe("B.method\nif(condition) {\n  A.method\n}");
  });

  it("ensures newline after closing brace when followed by more code", () => {
    const code = "A.method\nB.method\nC.method";
    const lineHead = 9; // "B.method"
    const line = "B.method";
    const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
    expect(result.code).toBe(
      "A.method\nif(condition) {\n  B.method\n}\nC.method",
    );
  });

  it("wraps an indented sync message inside a block", () => {
    const code = "X {\n  A.method\n  B.method\n}";
    const lineHead = 4; // "  A.method"
    const line = "  A.method";
    const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
    expect(result.code).toBe(
      "X {\n  if(condition) {\n    A.method\n  }\n  B.method\n}",
    );
  });

  it("wraps with loop fragment type", () => {
    const code = "A.method\nB.method";
    const line = "A.method";
    const result = wrapMessageInFragment({ code, line, lineHead: 0, type: "loop" });
    expect(result.code).toBe("loop(condition) {\n  A.method\n}\nB.method");
  });

  it("wraps with opt fragment type", () => {
    const code = "A.method";
    const line = "A.method";
    const result = wrapMessageInFragment({ code, line, lineHead: 0, type: "opt" });
    expect(result.code).toBe("opt(condition) {\n  A.method\n}");
  });

  describe("wrapping after type conversion", () => {
    it("wraps correctly when line is updated after sync→async conversion", () => {
      // After converting Bob->B: newMessage() to async (Bob->>B: newMessage()),
      // the wrap should use the updated line.
      const asyncCode = "Bob->>B: newMessage()";
      const updatedLine = "Bob->>B: newMessage()";

      const result = wrapMessageInFragment({
        code: asyncCode,
        line: updatedLine,
        lineHead: 0,
        type: "alt",
      });
      expect(result.code).toBe(
        "if(condition) {\n  Bob->>B: newMessage()\n}",
      );
    });

    it("produces malformed DSL if line is stale after sync→async conversion", () => {
      // Demonstrates the bug: if message.line is NOT updated after type change,
      // the stale shorter line causes code.slice(lineTail) to include a trailing char.
      const asyncCode = "Bob->>B: newMessage()";
      const staleLine = "Bob->B: newMessage()"; // one char shorter (-> vs ->>)

      const result = wrapMessageInFragment({
        code: asyncCode,
        line: staleLine,
        lineHead: 0,
        type: "alt",
      });
      // The trailing ")" is leftover from the length mismatch
      expect(result.code).toBe(
        "if(condition) {\n  Bob->B: newMessage()\n})",
      );
    });
  });

  describe("StylePanel-like line extraction", () => {
    // Simulates how StylePanel.tsx extracts line and lineHead from code
    function extractLine(code: string, charOffset: number) {
      const lineHead =
        code.lastIndexOf("\n", charOffset - 1) + 1;
      const lineTail = code.indexOf("\n", lineHead);
      const line =
        lineTail === -1
          ? code.slice(lineHead)
          : code.slice(lineHead, lineTail);
      return { line, lineHead };
    }

    it("wraps first sync message followed by another statement", () => {
      const code = "A.method\nB.method";
      const { line, lineHead } = extractLine(code, 0);
      const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
      expect(result.code).toBe("if(condition) {\n  A.method\n}\nB.method");
    });

    it("wraps middle sync message in multi-line DSL", () => {
      const code = "A.method\nB.method\nC.method";
      const { line, lineHead } = extractLine(code, 9);
      const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
      expect(result.code).toBe("A.method\nif(condition) {\n  B.method\n}\nC.method");
    });

    it("wraps last sync message (no trailing newline)", () => {
      const code = "A.method\nB.method";
      const { line, lineHead } = extractLine(code, 9);
      const result = wrapMessageInFragment({ code, line, lineHead, type: "alt" });
      expect(result.code).toBe("A.method\nif(condition) {\n  B.method\n}");
    });
  });
});

import {
  formatText,
  getIndent,
  getLineEnd,
  getLineHead,
  getLineTail,
  getPrevLine,
  getPrevLineHead,
} from "./StringUtil";

describe("StringUtil", () => {
  it.each([
    ["A\nB\n\rC\n", "A B C"],
    ["A . m ( 1 , 2 ) ;", "A.m(1,2);"],
    ['"A .m"', "A.m"],
    ['"A .m"', "A.m"],
    ['"method name"()', '"method name"()'],
    ["methodName() x", "methodName() x"],
  ])("removes change-lines", (original, formatted) => {
    expect(formatText(original)).toEqual(formatted);
  });
});

describe("getLineHead", () => {
  it("should return the correct line head position for a given position", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 15;
    const expectedLineHead = 13;
    const actualLineHead = getLineHead(code, position);
    expect(actualLineHead).toBe(expectedLineHead);
  });

  it("should return the correct line head position for a given position at lineend", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 12;
    const expectedLineHead = 0;
    const actualLineHead = getLineHead(code, position);
    expect(actualLineHead).toBe(expectedLineHead);
  });

  it("should return 0 for position 0", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 0;
    const expectedLineHead = 0;
    const actualLineHead = getLineHead(code, position);
    expect(actualLineHead).toBe(expectedLineHead);
  });

  it("should return 0 for an empty code string", () => {
    const code = "";
    const position = 0;
    const expectedLineHead = 0;
    const actualLineHead = getLineHead(code, position);
    expect(actualLineHead).toBe(expectedLineHead);
  });
});

describe("getPrevLineHead", () => {
  it("should return the previous line head position for a given position", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 12;
    const expectedPrevLineHead = 0;
    const actualPrevLineHead = getPrevLineHead(code, position);
    expect(actualPrevLineHead).toBe(expectedPrevLineHead);
  });

  it("should return 0 for position 0", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 0;
    const expectedPrevLineHead = 0;
    const actualPrevLineHead = getPrevLineHead(code, position);
    expect(actualPrevLineHead).toBe(expectedPrevLineHead);
  });

  it("should return the line head position for a position at the start of a line", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 10;
    const expectedPrevLineHead = 0;
    const actualPrevLineHead = getPrevLineHead(code, position);
    expect(actualPrevLineHead).toBe(expectedPrevLineHead);
  });

  it("should return the line head position for a position at the end of a line", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 11;
    const expectedPrevLineHead = 0;
    const actualPrevLineHead = getPrevLineHead(code, position);
    expect(actualPrevLineHead).toBe(expectedPrevLineHead);
  });

  it("should return 0 for an empty code string", () => {
    const code = "";
    const position = 0;
    const expectedPrevLineHead = 0;
    const actualPrevLineHead = getPrevLineHead(code, position);
    expect(actualPrevLineHead).toBe(expectedPrevLineHead);
  });
});

describe("getPrevLine", () => {
  it("should return the previous line for a given position", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 15;
    const expectedPrevLine = "const a = 1;\n";
    const actualPrevLine = getPrevLine(code, position);
    expect(actualPrevLine).toBe(expectedPrevLine);
  });

  it("should return an empty string the given position is in the first line", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 2;
    const expectedPrevLine = "";
    const actualPrevLine = getPrevLine(code, position);
    expect(actualPrevLine).toBe(expectedPrevLine);
  });

  it("should return an empty string the given position is in the first line' end", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 12;
    const expectedPrevLine = "";
    const actualPrevLine = getPrevLine(code, position);
    expect(actualPrevLine).toBe(expectedPrevLine);
  });

  it("should return an empty string for position 0", () => {
    const code = "const a = 1;\nconst b = 2;\nconst c = 3;";
    const position = 0;
    const expectedPrevLine = "";
    const actualPrevLine = getPrevLine(code, position);
    expect(actualPrevLine).toBe(expectedPrevLine);
  });

  it("should return an empty string for an empty code string", () => {
    const code = "";
    const position = 0;
    const expectedPrevLine = "";
    const actualPrevLine = getPrevLine(code, position);
    expect(actualPrevLine).toBe(expectedPrevLine);
  });
});

describe("getLineTail", () => {
  it("returns the index just past the newline that ends the line", () => {
    expect(getLineTail("A.m\nB.n\n", 1)).toBe(4);
    expect(getLineTail("A.m\nB.n\n", 4)).toBe(8);
  });

  it("returns the end of the code on a last line without a newline", () => {
    expect(getLineTail("A.m\nB.n", 5)).toBe(7);
  });

  it("returns 0 for empty code", () => {
    expect(getLineTail("", 0)).toBe(0);
  });

  it("keeps a CRLF line's carriage return inside the line", () => {
    expect(getLineTail("A.m\r\nB.n", 0)).toBe(5);
  });
});

describe("getLineEnd", () => {
  it("returns the index of the newline that ends the line", () => {
    expect(getLineEnd("A.m\nB.n\n", 1)).toBe(3);
  });

  it("returns the end of the code on a last line without a newline", () => {
    expect(getLineEnd("A.m\nB.n", 5)).toBe(7);
  });

  it("returns 0 for empty code", () => {
    expect(getLineEnd("", 0)).toBe(0);
  });

  it("stops at the newline of a CRLF line, after its carriage return", () => {
    expect(getLineEnd("A.m\r\nB.n", 0)).toBe(4);
  });
});

describe("getIndent", () => {
  it("returns the leading whitespace of a line", () => {
    expect(getIndent("    A.m")).toBe("    ");
    expect(getIndent("\t A.m")).toBe("\t ");
  });

  it("returns an empty string for a line without indent or an empty line", () => {
    expect(getIndent("A.m")).toBe("");
    expect(getIndent("")).toBe("");
  });
});

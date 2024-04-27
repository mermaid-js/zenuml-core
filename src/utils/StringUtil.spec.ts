import {
  formatText,
  getLineHead,
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

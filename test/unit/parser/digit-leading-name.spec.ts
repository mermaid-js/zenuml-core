import antlr4 from "antlr4";
import { describe, expect, it } from "bun:test";
import sequenceLexer from "../../../src/generated-parser/sequenceLexer";
import { Fixture } from "./fixture/Fixture";

function visibleTokens(input: string) {
  const chars = new antlr4.InputStream(input);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  tokens.fill();
  return tokens.tokens
    .filter((token) => token.type !== antlr4.Token.EOF && token.channel === antlr4.Token.DEFAULT_CHANNEL)
    .map((token) => ({
      text: token.text,
      type: sequenceLexer.symbolicNames[token.type],
    }));
}

describe("digit-leading names", () => {
  it("parses digit-leading condition labels", () => {
    const ast = Fixture.firstStatement(`
      if(5xx_error) {
        A.method()
      }
    `);

    const condition = ast.alt().ifBlock().parExpr().condition();
    expect(condition.getFormattedText()).toBe("5xx_error");
    expect(condition.atom().DIGIT_LEADING_NAME().getText()).toBe("5xx_error");
  });

  it("parses digit-leading participant and method-like names", () => {
    const ast = Fixture.firstStatement("2FAService.3DSecure()");
    const messageBody = ast.message().messageBody();

    expect(messageBody.fromTo().to().getText()).toBe("2FAService");
    expect(messageBody.func().signature()[0].methodName().getText()).toBe("3DSecure");
  });

  it("parses digit-leading names in async messages and returns", () => {
    const message = Fixture.firstStatement("API->5xx_error: retry").asyncMessage();
    expect(message.to().getText()).toBe("5xx_error");

    const ret = Fixture.firstStatement("return 5xx_error").ret();
    expect(ret.expr().atom().DIGIT_LEADING_NAME().getText()).toBe("5xx_error");
  });

  it("keeps known units as NUMBER_UNIT and status-like names as DIGIT_LEADING_NAME", () => {
    expect(visibleTokens("1kg 100day 0.5h .5m 10ms")).toEqual([
      { text: "1kg", type: "NUMBER_UNIT" },
      { text: "100day", type: "NUMBER_UNIT" },
      { text: "0.5h", type: "NUMBER_UNIT" },
      { text: ".5m", type: "NUMBER_UNIT" },
      { text: "10ms", type: "NUMBER_UNIT" },
    ]);

    expect(visibleTokens("5xx 5xx_error 2FAService 404Page")).toEqual([
      { text: "5xx", type: "DIGIT_LEADING_NAME" },
      { text: "5xx_error", type: "DIGIT_LEADING_NAME" },
      { text: "2FAService", type: "DIGIT_LEADING_NAME" },
      { text: "404Page", type: "DIGIT_LEADING_NAME" },
    ]);
  });

  it("does not treat underscore-separated numbers as digit-leading names", () => {
    expect(visibleTokens("1_000")).toEqual([
      { text: "1", type: "INT" },
      { text: "_000", type: "ID" },
    ]);
  });
});

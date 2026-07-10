import antlr4 from "antlr4";
import { default as sequenceLexer } from "../../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../../generated-parser/sequenceParser";
import type { AugmentedContext } from "../AntlrTypes";

// AtomContext is a labeled-alternative ANTLR rule: parser.atom() is
// statically typed as the base AtomContext, but at runtime returns one of
// its subclasses (NumberUnitAtomContext here). getFormattedText is installed
// on the shared base's prototype below; TS can't see prototype patches
// applied from another file (see AntlrTypes.AugmentedContext's doc comment),
// so the assignment target and parseAtom's return are cast explicitly.
type NumberUnitContext = { NUMBER_UNIT?(): { getText(): string } };

const AtomContext = sequenceParser.AtomContext as any as {
  prototype: AugmentedContext & NumberUnitContext;
};

// Add getFormattedText to the atom context prototype
AtomContext.prototype.getFormattedText = function (
  this: AugmentedContext & NumberUnitContext,
) {
  const numberUnit = this.NUMBER_UNIT?.();
  if (numberUnit) {
    return numberUnit.getText();
  }
  return this.getText();
};

type NumberUnitAtomContextInstance = InstanceType<
  typeof sequenceParser.NumberUnitAtomContext
> &
  AugmentedContext;

// @types/antlr4 mis-declares ParserRuleContext#getToken (and so
// NUMBER_UNIT()) as returning a Token; the antlr4 runtime actually returns
// the TerminalNode wrapping it (see node_modules/antlr4
// .../ParserRuleContext.js getToken()), whose `.symbol` is the real Token.
type TerminalTokenNode = { symbol: { type: number } };

function parseAtom(input: string): NumberUnitAtomContextInstance {
  const chars = new antlr4.InputStream(input);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  return parser.atom() as unknown as NumberUnitAtomContextInstance;
}

describe("NumberUnit", () => {
  describe("valid cases", () => {
    it("should parse simple number with unit and verify token", () => {
      const ast = parseAtom("1kg");
      const token = (ast.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;
      expect(ast.getFormattedText()).toBe("1kg");
      expect(sequenceParser.symbolicNames[token.type]).toBe("NUMBER_UNIT");
    });

    it("should parse zero with unit and verify token", () => {
      const ast = parseAtom("0kg");
      const token = (ast.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;
      expect(ast.getFormattedText()).toBe("0kg");
      expect(sequenceParser.symbolicNames[token.type]).toBe("NUMBER_UNIT");
    });

    it("should parse large number with unit and verify token", () => {
      const ast = parseAtom("100day");
      const token = (ast.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;
      expect(ast.getFormattedText()).toBe("100day");
      expect(sequenceParser.symbolicNames[token.type]).toBe("NUMBER_UNIT");
    });

    it("should parse multi-character units", () => {
      const ast1 = parseAtom("100day");
      const ast2 = parseAtom("5km");
      expect(ast1.getFormattedText()).toBe("100day");
      expect(ast2.getFormattedText()).toBe("5km");
    });

    it("should parse unit without number", () => {
      const ast = parseAtom("kg");
      expect(ast.getFormattedText()).toBe("kg");
    });

    it("should parse number with leading zeros", () => {
      const ast = parseAtom("01h");
      expect(ast.getFormattedText()).toBe("01h");
    });

    it("should parse large number with leading zeros", () => {
      const ast = parseAtom("010hours");
      expect(ast.getFormattedText()).toBe("010hours");
    });

    it("should parse decimal numbers with unit and verify token", () => {
      const ast1 = parseAtom("1.5kg");
      const token1 = (ast1.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;
      const ast2 = parseAtom("0.5h");
      const token2 = (ast2.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;
      const ast3 = parseAtom(".5m");
      const token3 = (ast3.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;

      expect(ast1.getFormattedText()).toBe("1.5kg");
      expect(sequenceParser.symbolicNames[token1.type]).toBe("NUMBER_UNIT");
      expect(ast2.getFormattedText()).toBe("0.5h");
      expect(sequenceParser.symbolicNames[token2.type]).toBe("NUMBER_UNIT");
      expect(ast3.getFormattedText()).toBe(".5m");
      expect(sequenceParser.symbolicNames[token3.type]).toBe("NUMBER_UNIT");
    });

    // Debug helper to print all token information
    it("should print token debug information", () => {
      const ast = parseAtom("1kg");
      const token = (ast.NUMBER_UNIT() as unknown as TerminalTokenNode).symbol;
      console.log("Token type:", token.type);
      console.log("Symbolic names:", sequenceParser.symbolicNames);
      console.log("Rule names:", sequenceParser.ruleNames);
    });
  });
});

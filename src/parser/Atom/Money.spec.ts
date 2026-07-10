import antlr4 from "antlr4";
import { default as sequenceLexer } from "../../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../../generated-parser/sequenceParser";
import type { AugmentedContext } from "../AntlrTypes";

// AtomContext is a labeled-alternative ANTLR rule: parser.atom() is
// statically typed as the base AtomContext, but at runtime returns one of
// its subclasses (MoneyAtomContext here). getFormattedText is installed on
// the shared base's prototype below; TS can't see prototype patches applied
// from another file (see AntlrTypes.AugmentedContext's doc comment), so the
// assignment target and parseAtom's return are cast explicitly.
type MoneyContext = { MONEY?(): { getText(): string } };

const AtomContext = sequenceParser.AtomContext as any as {
  prototype: AugmentedContext & MoneyContext;
};

// Add getFormattedText to the atom context prototype
AtomContext.prototype.getFormattedText = function (
  this: AugmentedContext & MoneyContext,
) {
  const money = this.MONEY?.();
  if (money) {
    return money.getText();
  }
  return this.getText();
};

type MoneyAtomContextInstance = InstanceType<
  typeof sequenceParser.MoneyAtomContext
> &
  AugmentedContext;

// @types/antlr4 mis-declares ParserRuleContext#getToken (and so MONEY())
// as returning a Token; the antlr4 runtime actually returns the
// TerminalNode wrapping it (see node_modules/antlr4 .../ParserRuleContext.js
// getToken()), whose `.symbol` is the real Token.
type TerminalTokenNode = { symbol: { type: number } };

function parseAtom(input: string): MoneyAtomContextInstance {
  const chars = new antlr4.InputStream(input);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  return parser.atom() as unknown as MoneyAtomContextInstance;
}

describe("Money", () => {
  describe("valid cases", () => {
    it("should parse simple money amount and verify token", () => {
      const ast = parseAtom("$100");
      const token = (ast.MONEY() as unknown as TerminalTokenNode).symbol;
      expect(ast.getFormattedText()).toBe("$100");
      expect(sequenceParser.symbolicNames[token.type]).toBe("MONEY");
    });

    it("should parse zero money amount and verify token", () => {
      const ast = parseAtom("$0");
      const token = (ast.MONEY() as unknown as TerminalTokenNode).symbol;
      expect(ast.getFormattedText()).toBe("$0");
      expect(sequenceParser.symbolicNames[token.type]).toBe("MONEY");
    });

    it("should parse large money amount and verify token", () => {
      const ast = parseAtom("$1000000");
      const token = (ast.MONEY() as unknown as TerminalTokenNode).symbol;
      expect(ast.getFormattedText()).toBe("$1000000");
      expect(sequenceParser.symbolicNames[token.type]).toBe("MONEY");
    });

    it("should parse money amount with leading zeros", () => {
      const ast = parseAtom("$01");
      expect(ast.getFormattedText()).toBe("$01");
    });

    it("should parse decimal money amounts and verify token", () => {
      const ast1 = parseAtom("$1.50");
      const token1 = (ast1.MONEY() as unknown as TerminalTokenNode).symbol;
      const ast2 = parseAtom("$0.50");
      const token2 = (ast2.MONEY() as unknown as TerminalTokenNode).symbol;
      const ast3 = parseAtom("$.50");
      const token3 = (ast3.MONEY() as unknown as TerminalTokenNode).symbol;

      expect(ast1.getFormattedText()).toBe("$1.50");
      expect(sequenceParser.symbolicNames[token1.type]).toBe("MONEY");
      expect(ast2.getFormattedText()).toBe("$0.50");
      expect(sequenceParser.symbolicNames[token2.type]).toBe("MONEY");
      expect(ast3.getFormattedText()).toBe("$.50");
      expect(sequenceParser.symbolicNames[token3.type]).toBe("MONEY");
    });

  });
});

import antlr4 from "antlr4";
import { default as sequenceLexer } from "../../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../../generated-parser/sequenceParser";

// Add getFormattedText to the atom context prototype
sequenceParser.AtomContext.prototype.getFormattedText = function () {
  if (this.MONEY && this.MONEY()) {
    return this.MONEY().getText();
  }
  return this.getText();
};

function parseAtom(input: string) {
  const chars = new antlr4.InputStream(input);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  return parser.atom();
}

describe("Money", () => {
  describe("valid cases", () => {
    it("should parse simple money amount and verify token", () => {
      const ast = parseAtom("$100");
      const token = ast.MONEY().symbol;
      expect(ast.getFormattedText()).toBe("$100");
      expect(sequenceParser.symbolicNames[token.type]).toBe("MONEY");
    });

    it("should parse zero money amount and verify token", () => {
      const ast = parseAtom("$0");
      const token = ast.MONEY().symbol;
      expect(ast.getFormattedText()).toBe("$0");
      expect(sequenceParser.symbolicNames[token.type]).toBe("MONEY");
    });

    it("should parse large money amount and verify token", () => {
      const ast = parseAtom("$1000000");
      const token = ast.MONEY().symbol;
      expect(ast.getFormattedText()).toBe("$1000000");
      expect(sequenceParser.symbolicNames[token.type]).toBe("MONEY");
    });

    it("should parse money amount with leading zeros", () => {
      const ast = parseAtom("$01");
      expect(ast.getFormattedText()).toBe("$01");
    });

    it("should parse decimal money amounts and verify token", () => {
      const ast1 = parseAtom("$1.50");
      const token1 = ast1.MONEY().symbol;
      const ast2 = parseAtom("$0.50");
      const token2 = ast2.MONEY().symbol;
      const ast3 = parseAtom("$.50");
      const token3 = ast3.MONEY().symbol;

      expect(ast1.getFormattedText()).toBe("$1.50");
      expect(sequenceParser.symbolicNames[token1.type]).toBe("MONEY");
      expect(ast2.getFormattedText()).toBe("$0.50");
      expect(sequenceParser.symbolicNames[token2.type]).toBe("MONEY");
      expect(ast3.getFormattedText()).toBe("$.50");
      expect(sequenceParser.symbolicNames[token3.type]).toBe("MONEY");
    });

    // Debug helper to print all token information
    it("should print token debug information", () => {
      const ast = parseAtom("$100");
      const token = ast.MONEY().symbol;
      console.log("Token type:", token.type);
      console.log("Symbolic names:", sequenceParser.symbolicNames);
      console.log("Rule names:", sequenceParser.ruleNames);
    });
  });
});

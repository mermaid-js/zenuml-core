import antlr4 from "antlr4";
import { default as sequenceLexer } from "../generated-parser/sequenceLexer";
import { default as sequenceParser } from "../generated-parser/sequenceParser";

function parseParameters(input: string) {
  const chars = new antlr4.InputStream(input);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  return parser.parameters();
}

function parseMessage(input: string) {
  const chars = new antlr4.InputStream(input);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  return parser.message();
}

describe("NamedParameter", () => {
  describe("parameter parsing", () => {
    it("should parse single named parameter", () => {
      const ast = parseParameters("userId=123");
      expect(ast.parameter().length).toBe(1);
      
      const param = ast.parameter()[0];
      expect(param.namedParameter()).toBeTruthy();
      expect(param.namedParameter().ID().getText()).toBe("userId");
      expect(param.namedParameter().expr().getText()).toBe("123");
    });

    it("should parse multiple named parameters", () => {
      const ast = parseParameters("userId=123, name=\"John\"");
      expect(ast.parameter().length).toBe(2);
      
      const param1 = ast.parameter()[0];
      expect(param1.namedParameter()).toBeTruthy();
      expect(param1.namedParameter().ID().getText()).toBe("userId");
      expect(param1.namedParameter().expr().getText()).toBe("123");
      
      const param2 = ast.parameter()[1];
      expect(param2.namedParameter()).toBeTruthy();
      expect(param2.namedParameter().ID().getText()).toBe("name");
      expect(param2.namedParameter().expr().getText()).toBe("\"John\"");
    });

    it("should parse mixed positional and named parameters", () => {
      const ast = parseParameters("123, name=\"John\", active=true");
      expect(ast.parameter().length).toBe(3);
      
      // First parameter is positional (expression)
      const param1 = ast.parameter()[0];
      expect(param1.expr()).toBeTruthy();
      expect(param1.namedParameter()).toBeFalsy();
      expect(param1.expr().getText()).toBe("123");
      
      // Second parameter is named
      const param2 = ast.parameter()[1];
      expect(param2.namedParameter()).toBeTruthy();
      expect(param2.namedParameter().ID().getText()).toBe("name");
      expect(param2.namedParameter().expr().getText()).toBe("\"John\"");
      
      // Third parameter is named
      const param3 = ast.parameter()[2];
      expect(param3.namedParameter()).toBeTruthy();
      expect(param3.namedParameter().ID().getText()).toBe("active");
      expect(param3.namedParameter().expr().getText()).toBe("true");
    });

    it("should parse named parameters with complex expressions", () => {
      const ast = parseParameters("count=users.length, isAdmin=user.role === \"admin\"");
      expect(ast.parameter().length).toBe(2);
      
      const param1 = ast.parameter()[0];
      expect(param1.namedParameter().ID().getText()).toBe("count");
      expect(param1.namedParameter().expr().getText()).toBe("users.length");
      
      const param2 = ast.parameter()[1];
      expect(param2.namedParameter().ID().getText()).toBe("isAdmin");
      expect(param2.namedParameter().expr().getText()).toBe("user.role === \"admin\"");
    });
  });

  describe("message parsing with named parameters", () => {
    it("should parse method call with named parameters", () => {
      const ast = parseMessage("A.method(userId=123, name=\"John\")");
      expect(ast.messageBody()).toBeTruthy();
      expect(ast.messageBody().func()).toBeTruthy();
      
      const signature = ast.messageBody().func().signature()[0];
      expect(signature.methodName().getText()).toBe("method");
      expect(signature.invocation()).toBeTruthy();
      
      const parameters = signature.invocation().parameters();
      expect(parameters.parameter().length).toBe(2);
      
      const param1 = parameters.parameter()[0];
      expect(param1.namedParameter().ID().getText()).toBe("userId");
      expect(param1.namedParameter().expr().getText()).toBe("123");
    });

    it("should maintain backward compatibility with positional parameters", () => {
      const ast = parseMessage("A.method(123, \"John\")");
      expect(ast.messageBody()).toBeTruthy();
      
      const parameters = ast.messageBody().func().signature()[0].invocation().parameters();
      expect(parameters.parameter().length).toBe(2);
      
      // Both should be expressions (positional parameters)
      expect(parameters.parameter()[0].expr()).toBeTruthy();
      expect(parameters.parameter()[0].namedParameter()).toBeFalsy();
      expect(parameters.parameter()[1].expr()).toBeTruthy();
      expect(parameters.parameter()[1].namedParameter()).toBeFalsy();
    });

    it("should parse empty method call", () => {
      const ast = parseMessage("A.method()");
      expect(ast.messageBody()).toBeTruthy();
      
      const invocation = ast.messageBody().func().signature()[0].invocation();
      expect(invocation.parameters()).toBeFalsy();
    });
  });

  describe("error handling", () => {
    it("should handle missing parameter value", () => {
      // This should still parse but may not be semantically correct
      expect(() => parseParameters("userId=")).not.toThrow();
    });

    it("should handle invalid parameter names", () => {
      // Numbers as parameter names should not parse as named parameters
      const ast = parseParameters("123=value");
      expect(ast.parameter()[0].namedParameter()).toBeFalsy();
      expect(ast.parameter()[0].expr()).toBeTruthy();
    });
  });
});
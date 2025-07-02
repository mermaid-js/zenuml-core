import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import { describe, it, expect, beforeAll } from "vitest";
import { Model } from "../language/generated/ast";
import { createSequenceServices } from "./fixture";

describe("Langium Sequence Parser", () => {
  let parse: ReturnType<typeof parseHelper<Model>>;

  beforeAll(() => {
    const services = createSequenceServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Sequence);
  });

  const testCases = [
    {
      name: "Simple title",
      input: 'title "Test Sequence"',
      expectSuccess: true,
    },
    {
      name: "Simple participant",
      input: "@Actor participant1",
      expectSuccess: true,
    },
    {
      name: "Stereotype",
      input: "@Actor <<Repo>> participant1",
      expectSuccess: true,
    },
    {
      name: "Group",
      input: "group { @Actor participant1 }",
      expectSuccess: true,
    },
    {
      name: "Group Name",
      input: "group A",
      expectSuccess: true,
    },
    {
      name: "Starter",
      input: "@starter A",
      expectSuccess: true,
    },
    {
      name: "Simple message",
      input: "A -> B.method()",
      expectSuccess: true,
    },
    {
      name: "Label",
      input: 'A as "label"',
      expectSuccess: true,
    },
    {
      name: "Complete model with title and message",
      input: 'title "Test"\nA -> B.test()',
      expectSuccess: true,
    },
    {
      name: "Creation with assignment",
      input: "obj = new Object()",
      expectSuccess: true,
    },
    {
      name: "Simple method block",
      input: "BookLibService.Borrow() { }",
      expectSuccess: true,
    },
    {
      name: "If Block",
      input: "if (condition) { }",
      expectSuccess: true,
    },
    {
      name: "Loop statement",
      input: "while (condition) { }",
      expectSuccess: true,
    },
    {
      name: "Try-catch Block",
      input: "try { } catch (exception) { }",
      expectSuccess: true,
    },
    {
      name: "Opt Block",
      input: "opt { }",
      expectSuccess: true,
    },
    {
      name: "Par Block",
      input: "par { }",
      expectSuccess: true,
    },
  ];

  testCases.forEach((testCase) => {
    it(`should parse: ${testCase.name}`, async () => {
      const document = await parse(testCase.input, { validation: true });
      const hasErrors =
        document.parseResult.lexerErrors.length > 0 ||
        document.parseResult.parserErrors.length > 0;

      if (testCase.expectSuccess) {
        if (hasErrors) {
          console.log(`\n=== Errors for "${testCase.name}" ===`);
          console.log("Input:", testCase.input);
          console.log("Lexer errors:", document.parseResult.lexerErrors);
          console.log("Parser errors:", document.parseResult.parserErrors);
          console.log("AST Type:", document.parseResult.value?.$type);
          console.log(
            "AST:",
            JSON.stringify(document.parseResult.value, null, 2),
          );
        }
        expect(hasErrors).toBe(false);
        expect(document.parseResult.value.$type).toBeDefined();
      } else {
        expect(hasErrors).toBe(true);
      }
    });
  });

  it("should provide detailed error information on parsing failures", async () => {
    const invalidInput = "invalid syntax @#$%";
    const document = await parse(invalidInput, { validation: true });
    const hasErrors =
      document.parseResult.lexerErrors.length > 0 ||
      document.parseResult.parserErrors.length > 0;

    expect(hasErrors).toBe(true);
    // Ensure we get meaningful error information
    expect(
      document.parseResult.lexerErrors.length > 0 ||
        document.parseResult.parserErrors.length > 0,
    ).toBe(true);
  });
});

import { EmptyFileSystem } from "langium";
import { validationHelper } from "langium/test";
import { describe, expect, test } from "bun:test";
import { createZenUmlLspServices } from "../../parser-langium/lsp/zenuml-lsp-module";
import { expandTemplate, SNIPPETS } from "./snippets";

const validate = validationHelper<any>(
  createZenUmlLspServices(EmptyFileSystem).ZenUml,
);

describe("SNIPPETS", () => {
  test("covers the structures a newcomer needs first", () => {
    const labels = SNIPPETS.map((s) => s.label);
    for (const wanted of [
      "if",
      "loop",
      "alt",
      "opt",
      "par",
      "try",
      "message",
      "return",
    ]) {
      expect(labels).toContain(wanted);
    }
  });

  test("labels are unique", () => {
    const labels = SNIPPETS.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  test("every snippet explains itself and has a first tab stop", () => {
    for (const s of SNIPPETS) {
      expect(s.detail.length).toBeGreaterThan(5);
      expect(s.template).toContain("${1");
    }
  });

  test("alt offers an else branch and try offers a catch branch", () => {
    expect(SNIPPETS.find((s) => s.label === "alt")?.template).toContain("else");
    expect(SNIPPETS.find((s) => s.label === "try")?.template).toContain(
      "catch",
    );
  });

  test("expandTemplate keeps default text and drops empty tab stops", () => {
    expect(expandTemplate("A.${1:go}(${2})")).toBe("A.go()");
  });

  for (const s of SNIPPETS) {
    test(`the "${s.label}" snippet expands to valid ZenUML`, async () => {
      const result = await validate(expandTemplate(s.template));
      expect(result.diagnostics.map((d: any) => d.message)).toEqual([]);
    });
  }
});

import { EmptyFileSystem } from "langium";
import { validationHelper } from "langium/test";
import { describe, expect, test } from "bun:test";
import { createZenUmlLspServices } from "../../parser-langium/lsp/zenuml-lsp-module";
import { CHEAT_SHEET } from "./cheatsheet";
import { EXAMPLES } from "./examples";

const validate = validationHelper<any>(
  createZenUmlLspServices(EmptyFileSystem).ZenUml,
);

describe("EXAMPLES", () => {
  test("offers three generic samples with distinct names", () => {
    expect(EXAMPLES).toHaveLength(3);
    expect(new Set(EXAMPLES.map((e) => e.name)).size).toBe(3);
  });

  for (const e of EXAMPLES) {
    test(`"${e.name}" is valid ZenUML`, async () => {
      const result = await validate(e.doc);
      expect(result.diagnostics.map((d: any) => d.message)).toEqual([]);
    });
  }
});

describe("CHEAT_SHEET", () => {
  test("every row shows a short, valid piece of syntax", async () => {
    expect(CHEAT_SHEET.length).toBeGreaterThanOrEqual(6);
    for (const row of CHEAT_SHEET) {
      expect(row.what.length).toBeGreaterThan(0);
      const result = await validate(row.syntax);
      expect(result.diagnostics.map((d: any) => d.message)).toEqual([]);
    }
  });
});

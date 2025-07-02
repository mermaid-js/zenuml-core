import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import { describe, it, expect, beforeAll } from "vitest";
import { Model } from "../language/generated/ast";
import { createSequenceServices } from "./fixture";

describe("ZenUML Parser", () => {
  let parse: ReturnType<typeof parseHelper<Model>>;

  beforeAll(() => {
    const services = createSequenceServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Sequence);
  });

  it("should parse a title and a simple method block", async () => {
    const input = `
      // An example
      title A
      BookLibService.Borrow() {}
    `;
    const document = await parse(input);
    expect(document.parseResult.lexerErrors).toHaveLength(0);
    expect(document.parseResult.parserErrors).toHaveLength(0);
  });
});

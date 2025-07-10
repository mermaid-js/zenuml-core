import { EmptyFileSystem } from "langium";
import { parseHelper } from "langium/test";
import { describe, it, beforeAll } from "vitest";
import { Model } from "../language/generated/ast";
import { createSequenceServices, genValidateParser } from "./fixture";
import demo1 from "./demo1";
import demo2 from "./demo2";
import demo3 from "./demo3";
import demo4 from "./demo4";
import demo5 from "./demo5";
import demo6 from "./demo6";

describe("ZenUML Parser", () => {
  let parse: ReturnType<typeof parseHelper<Model>>;
  let validateParser: (text: string) => Promise<void>;

  beforeAll(async () => {
    const services = createSequenceServices(EmptyFileSystem);
    parse = parseHelper<Model>(services.Sequence);
    validateParser = await genValidateParser(parse);
  });
  it("should parse a title and a simple method block", async () => {
    const input = `
      // An example
      title A
      // another comment
      BookLibService.Borrow() {}
    `;
    await validateParser(input);
  });

  it("should parse a demo1", async () => {
    await validateParser(demo1);
  });

  it("should parse a demo2", async () => {
    await validateParser(demo2);
  });

  it("should parse a demo3", async () => {
    await validateParser(demo3);
  });

  it("should parse a demo4", async () => {
    await validateParser(demo4);
  });

  it("should parse a demo5", async () => {
    await validateParser(demo5);
  });

  it("should parse a demo6", async () => {
    await validateParser(demo6);
  });
});

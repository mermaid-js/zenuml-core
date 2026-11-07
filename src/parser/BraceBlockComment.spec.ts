import { afterEach, beforeEach, describe, expect, it } from "vitest";
import sequenceParser from "@/generated-parser/sequenceParser";
import { parse } from "./index";

// The published bundles minify class names: `BraceBlockContext` ships as `p` in
// dist/parser/index.mjs. Unit tests and the dev server keep the original name,
// so a check against the class name passes here and does nothing in production.
// Renaming the class reproduces what the minifier does to it.
const MINIFIED_NAME = "p";

const BraceBlockContext = sequenceParser.BraceBlockContext;

function firstBraceBlock(code: string): any {
  const { rootContext } = parse(code);
  const find = (node: any): any => {
    if (node instanceof BraceBlockContext) return node;
    for (const child of node.children ?? []) {
      const found = find(child);
      if (found) return found;
    }
    return null;
  };
  return find(rootContext);
}

describe("BraceBlockContext.getComment", () => {
  describe.each([
    ["original class name", null],
    ["minified class name", MINIFIED_NAME],
  ])("with the %s", (_label, renamedTo) => {
    const original = Object.getOwnPropertyDescriptor(BraceBlockContext, "name");

    beforeEach(() => {
      if (renamedTo) {
        Object.defineProperty(BraceBlockContext, "name", {
          value: renamedTo,
          configurable: true,
        });
      }
    });

    afterEach(() => {
      Object.defineProperty(BraceBlockContext, "name", original!);
    });

    it("runs against the expected class name", () => {
      const block = firstBraceBlock("A.method() { }");
      expect(block.constructor.name).toBe(renamedTo ?? "BraceBlockContext");
    });

    it("reads the comment left of the closing brace", () => {
      const block = firstBraceBlock("A.method() { // comment \n }");
      expect(block.getComment()).toBe(" comment ");
    });

    it("does not read the comment left of the opening brace", () => {
      const block = firstBraceBlock("A.method() // before\n{\n}");
      expect(block.getComment()).toBeNull();
    });
  });
});

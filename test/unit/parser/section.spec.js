import { expect } from "vitest";
import { Fixture } from "./fixture/Fixture";

test("Empty `section`", () => {
  let section = Fixture.firstStatement("section {}").section();
  expectText(section).toBe("section{}");
  let braceBlock = section.braceBlock();
  expectText(braceBlock).toBe("{}");
});

test("section with parameter", () => {
  let section = Fixture.firstStatement("section(A) {}").section();
  expectText(section).toBe("section(A){}");
  let atom = section.atom();
  expectText(atom).toBe("A");
});

function expectText(context) {
  return expect(context.getText());
}

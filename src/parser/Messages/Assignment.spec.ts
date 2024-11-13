import { Assignment } from "../../parser/Messages/MessageContext";
import { MessageContextFixture } from "@/parser/ContextsFixture";

describe("Assignment", function () {
  test.each([
    ["A", "B", "A:B"],
    ["A", undefined, "A"],
  ])(
    "getText: assignee: %s, type: %s, text: %s",
    function (assignee, type, text) {
      const assignment = new Assignment(assignee, type);
      expect(assignment.getLabel()).toEqual(text);
    },
  );

  // expect throws error if assignee is undefined and type is defined
  test("throws error if assignee is undefined and type is defined", function () {
    expect(() => new Assignment(undefined, "B")).toThrow(
      "assignee must be defined if type is defined",
    );
  });
});

describe("MessageContext - isSimpleAssignment", () => {
  test.each([
    ["a = b", true],
    ["a", false],
    ["a = b.m", false],
    ["a = b()", false],
    ["a = b(c)", false],
    ["a = b { ... }", false],
  ])("Check if `%s` is a simple assignment: %s", (code, expected) => {
    const isSimpleAssignment = MessageContextFixture(code).isSimpleAssignment();
    expect(isSimpleAssignment).toBe(expected);
  });
});

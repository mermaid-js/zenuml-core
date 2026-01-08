import { Assignment } from "./Assignment";

describe("Assignment", function () {
  test.each([
    ["A", "B", "A:B"],
    ["A", undefined, "A"],
  ])(
    "getText: assignee: %s, type: %s, text: %s",
    function (assignee, type, text) {
      const assignment = new Assignment(assignee, type, [-1, -1]);
      expect(assignment.getText()).toEqual(text);
    },
  );

  // expect throws error if assignee is undefined and type is defined
  test("throws error if assignee is undefined and type is defined", function () {
    expect(() => new Assignment(undefined, "B", [-1, -1])).toThrow(
      "assignee must be defined if type is defined",
    );
  });

  test.each([
    [[10, 20], [10, 20]],
    [[-1, -1], [-1, -1]],
  ])(
    "labelPosition: input: %s, expected: %s",
    function (labelPosition, expected) {
      const assignment = new Assignment("A", "B", labelPosition);
      expect(assignment.labelPosition).toEqual(expected);
    },
  );
});

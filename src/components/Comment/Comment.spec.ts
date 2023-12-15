import Comment from "./Comment";

describe("Comment", function () {
  test.each([
    [
      "[red] comment1 \n",
      "comment1",
      { color: "red" },
      { color: "red" },
      [],
      [],
    ],
    [
      "[red] comment \n multiple-line\n",
      "[red] comment \n multiple-line",
      {},
      {},
      [],
      [],
    ],
    ["comment \n", "comment", {}, {}, [], []],
    ["[red] \n", "", { color: "red" }, { color: "red" }, [], []],
    ["[bold] \n", "", { fontWeight: "bold" }, { fontWeight: "bold" }, [], []],
    [
      "[italic] \n",
      "",
      { fontStyle: "italic" },
      { fontStyle: "italic" },
      [],
      [],
    ],
    [
      "[underline] \n",
      "",
      { textDecoration: "underline" },
      { textDecoration: "underline" },
      [],
      [],
    ],
    [
      "[red, bold] \n",
      "",
      { color: "red", fontWeight: "bold" },
      { color: "red", fontWeight: "bold" },
      [],
      [],
    ],
    ["<red> (bold) \ncomment \n", "<red> (bold) \ncomment", {}, {}, [], []],
    [
      "<red> (bold) comment \n",
      "comment",
      { color: "red" },
      { fontWeight: "bold" },
      [],
      [],
    ],
    ["[color-red] comment \n", "comment", {}, {}, ["color-red"], ["color-red"]],
  ])(
    "parse %s as text %s and color %s",
    function (
      raw,
      text,
      commentStyle,
      messageStyle,
      commentClassNames,
      messageClassNames,
    ) {
      const comment = new Comment(raw);
      expect(comment.commentStyle).toEqual(commentStyle);
      expect(comment.messageStyle).toEqual(messageStyle);
      expect(comment.commentClassNames).toEqual(commentClassNames);
      expect(comment.messageClassNames).toEqual(messageClassNames);
      expect(comment.text).toBe(text);
    },
  );
});

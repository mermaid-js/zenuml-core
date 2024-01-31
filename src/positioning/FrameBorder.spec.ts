import FrameBorder from "./FrameBorder";
describe("FrameBorder", function () {
  it("1 point 1 group", function () {
    const frame = { left: "a", right: "a" };
    expect(FrameBorder(frame)).toEqual({ left: 10, right: 10 });
  });
  it("1 point 2 groups", function () {
    const frame = {
      left: "a",
      right: "a",
      children: [{ left: "a", right: "a" }],
    };
    expect(FrameBorder(frame)).toEqual({ left: 20, right: 20 });
  });

  it("2 points 2 groups", function () {
    const frame = {
      left: "a",
      right: "b",
      children: [{ left: "a", right: "b" }],
    };
    expect(FrameBorder(frame)).toEqual({ left: 20, right: 20 });
  });

  it("2 points 2 groups", function () {
    const frame = {
      left: "a",
      right: "b",
      children: [{ left: "b", right: "b" }],
    };
    expect(FrameBorder(frame)).toEqual({ left: 10, right: 20 });
  });

  it("2 points 3 groups", function () {
    const frame = {
      left: "a",
      right: "b",
      children: [
        { left: "a", right: "a" },
        { left: "b", right: "b" },
      ],
    };
    expect(FrameBorder(frame)).toEqual({ left: 20, right: 20 });
  });

  it("a lot points a lot groups", function () {
    const frame = {
      left: "a",
      right: "d",
      children: [
        { left: "b", right: "b" },
        {
          left: "b",
          right: "d",
          children: [
            { left: "b", right: "c" },
            { left: "c", right: "d" },
          ],
        },
        { left: "b", right: "c" },
        { left: "a", right: "b" },
        { left: "c", right: "c" },
        {
          left: "d",
          right: "d",
          children: [
            { left: "d", right: "d", children: [{ left: "d", right: "d" }] },
          ],
        },
        { left: "d", right: "d" },
        { left: "d", right: "d" },
      ],
    };
    expect(FrameBorder(frame)).toEqual({ left: 20, right: 40 });
  });
});

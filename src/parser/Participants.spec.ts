import { Participants } from "../parser/Participants";

describe("Participants", () => {
  test("Get implicitly declared participants", () => {
    const participants = new Participants();
    participants.Add("A");
    expect(participants.ImplicitArray()).toEqual([
      {
        name: "A",
        isStarter: undefined,
        stereotype: undefined,
        width: undefined,
      },
    ]);
    expect(participants.Starter()).toBeUndefined();
  });

  test("Test order of participants", () => {
    const participants = new Participants();
    participants.Add("B");
    participants.Add("A");
    expect(participants.ImplicitArray()).toEqual([
      {
        name: "B",
        isStarter: undefined,
        stereotype: undefined,
        width: undefined,
      },
      {
        name: "A",
        isStarter: undefined,
        stereotype: undefined,
        width: undefined,
      },
    ]);
    expect(participants.Starter()).toBeUndefined();
  });

  test("Get Starter", () => {
    const participants = new Participants();
    participants.Add("A", { isStarter: true });
    expect(participants.Starter()).toEqual({
      name: "A",
      isStarter: true,
      stereotype: undefined,
      width: undefined,
    });
    participants.Add("A", {
      isStarter: false,
      start: 1,
      end: 2,
      explicit: true,
    });
    expect(participants.Starter()).toEqual({
      name: "A",
      isStarter: true,
      stereotype: undefined,
      width: undefined,
      explicit: true,
    });
    expect(participants.GetPositions("A")?.has("[1,2]"));
  });
});

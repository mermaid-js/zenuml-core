import { blankParticipant, Participants } from "../parser/Participants";

describe("Participants", () => {
  test("Get implicitly declared participants", () => {
    const participants = new Participants();
    participants.Add("A");
    expect(participants.ImplicitArray().map((p) => p.ToValue())).toEqual([
      {
        ...blankParticipant,
        name: "A",
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
        ...blankParticipant,
        name: "B",
      },
      {
        ...blankParticipant,
        name: "A",
      },
    ]);
    expect(participants.Starter()).toBeUndefined();
  });

  test("Get Starter", () => {
    const participants = new Participants();
    participants.Add("A", { isStarter: true });
    expect(participants.Starter()).toEqual({
      ...blankParticipant,
      name: "A",
      isStarter: true,
    });
    participants.Add("A", {
      ...blankParticipant,
      isStarter: false,
      position: [1, 2],
      explicit: true,
    });
    expect(participants.Starter()).toEqual({
      ...blankParticipant,
      name: "A",
      isStarter: true,
      explicit: true,
      positions: new Set([[1, 2]]),
    });
  });
});

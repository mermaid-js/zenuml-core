import { Fixture } from "./fixture/Fixture";
import { RootContext } from "../../../src/parser/index";
import ToCollector from "../../../src/parser/ToCollector";
import { expect } from "vitest";
import { blankParticipant } from "../../../src/parser/Participants";

test("smoke test2", () => {
  const code = `
    C
    // comment
    <<A>> "B 1" 1024
    @Starter("B 1")
    C.m
    D->E:m
    new F
  `;
  let participants = getParticipants(code);
  const participant = participants.Get("B 1");
  expect(participant.ToValue()).toEqual({
    ...blankParticipant,
    name: "B 1",
    comment: " comment\n",
    isStarter: true,
    explicit: true,
    stereotype: "A",
    width: 1024,
    positions: new Set([
      [32, 37],
      [56, 61],
    ]),
  });
});

describe("Plain participants", () => {
  test.each(["A", "A\n", "A\n\r"])(
    "get participant with width and stereotype undefined",
    (code) => {
      // `A` will be parsed as a participant which matches `participant EOF`
      let participants = getParticipants(code, true);
      expect(participants.Size()).toBe(1);
      expect(participants.Get("A").width).toBeUndefined();
      expect(participants.Get("A").stereotype).toBeUndefined();
    },
  );
});
describe("with width", () => {
  test.each([
    ["A 1024", 1024],
    ["A 1024 A 1025", 1024],
    ["A 1024\nA 1025", 1024],
  ])("code:%s => width:%s", (code, width) => {
    // `A` will be parsed as a participant which matches `participant EOF`
    let participants = getParticipants(code, true);
    expect(participants.Size()).toBe(1);
    expect(participants.First().name).toBe("A");
    expect(participants.Get("A").name).toBe("A");
    expect(participants.Get("A").width).toBe(width);
  });
});

describe("with interface", () => {
  test.each([
    ["<<A>> X 1024", "A"],
    ["<<A>> X <<B>> X", "A"], // Ignore redefining
    ["<<A>> X\n<<B>> X", "A"],
  ])("code:%s => width:%s", (code, stereotype) => {
    // `A` will be parsed as a participant which matches `participant EOF`
    let participants = getParticipants(code, true);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("X").name).toBe("X");
    expect(participants.Get("X").stereotype).toBe(stereotype);
  });
});

describe("with group", () => {
  test.each([
    ["group { A }", "A", undefined],
    ["group group1 { A }", "A", "group1"],
    ['group "group 2" { A }', "A", "group 2"],
    ['group "group 2" { A } group "group 3" { A }', "A", "group 2"],
  ])("code:%s => participant:%s", (code, participant, groupId) => {
    // `A` will be parsed as a participant which matches `participant EOF`
    let participants = getParticipants(code, true);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A").name).toBe(participant);
    expect(participants.Get("A").groupId).toBe(groupId);
  });
});

describe("without starter", () => {
  test.each([
    ["A.method", "A", 2],
    ["@Starter(A)", "A", 1],
  ])("code:%s => participant:%s", (code, participant, numberOfParticipants) => {
    // `A` will be parsed as a participant which matches `participant EOF`
    let participants = getParticipants(code, true);
    expect(participants.Size()).toBe(numberOfParticipants);
    expect(participants.Get("A").name).toBe(participant);
  });
});

describe("with label", () => {
  test.each([
    ["A as AA", "AA"],
    ['A as "AA"', "AA"],
  ])("code:%s => label:%s", (code, label) => {
    let participants = getParticipants(code, true);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A").name).toBe("A");
    expect(participants.Get("A").label).toBe(label);
  });
  test("participant position with label", () => {
    let participants = getParticipants("A as AA A.method", true);
    expect(participants.GetPositions("A")).toEqual(new Set([[5, 7]]));
  });
});

describe("with participantType", () => {
  test.each([
    ["@actor A", "actor"],
    ["@actor A\nA", "actor"],
    ["@Actor A", "Actor"],
    ["@database A", "database"],
  ])("code:%s => participantType:%s", (code, participantType) => {
    let participants = getParticipants(code, true);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A").name).toBe("A");
    expect(participants.Get("A").type).toBe(participantType);
  });
});

function getParticipants(code, withStarter) {
  let rootContext = RootContext(code);
  return ToCollector.getParticipants(rootContext, withStarter);
}

describe("Add Starter to participants", () => {
  test("Empty context", () => {
    let rootContext = RootContext("");
    const participants = ToCollector.getParticipants(rootContext, true);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("_STARTER_").name).toBe("_STARTER_");
    expect(participants.Get("_STARTER_").isStarter).toBeTruthy();
    expect(participants.GetPositions("_STARTER_")).toEqual(new Set());
  });

  test("A B->A.m", () => {
    let rootContext = RootContext("A B B->A.m");
    const participants = ToCollector.getParticipants(rootContext, true);
    expect(participants.Size()).toBe(2);
    expect(participants.Get("_STARTER_")).toBeUndefined();
    expect(participants.Get("B").isStarter).toBeTruthy();
    expect(participants.Names()).toStrictEqual(["B", "A"]);
  });
});

describe("implicit", () => {
  describe("from new", () => {
    test("from new", () => {
      let participants = getParticipants("new A()", true);
      const participant = participants.Get("A");
      expect(participant.ToValue()).toEqual({
        ...blankParticipant,
        name: "A",
        isStarter: false,
        positions: new Set([[4, 5]]),
      });
    });
    test("seqDsl should treat creation as a participant - assignment", () => {
      let participants = getParticipants("a = new A()", true);
      expect(participants.Size()).toBe(2);
      expect(participants.Get("a:A").width).toBeUndefined();
      expect(participants.GetPositions("a:A")).toEqual(new Set([[8, 9]]));
    });
    test("seqDsl should treat creation as a participant - assignment with type", () => {
      // We need @Starter, otherwise IA becomes a participant declaration
      let participants = getParticipants("@Starter(X) IA a = new A()", true);
      expect(participants.Size()).toBe(2);
      expect(participants.Get("X").width).toBeUndefined();
      expect(participants.Get("a:A").width).toBeUndefined();
      expect(participants.GetPositions("X").size).toBe(1);
      expect(participants.GetPositions("X")).toEqual(new Set([[9, 10]]));
      expect(participants.GetPositions("a:A")).toEqual(new Set([[23, 24]]));
    });

    test("seqDsl should treat creation as a participant - assignment & method call ", () => {
      let participants = getParticipants(
        `ret = new A() "ret:A".method()`,
        true,
      );
      expect(participants.Size()).toBe(2);
      expect(participants.Get("ret:A").width).toBeUndefined();
      expect(participants.GetPositions("ret:A")).toEqual(
        new Set([
          [10, 11],
          [19, 20],
        ]),
      );
    });
  });

  describe("from method call", () => {
    test("get participants", () => {
      const participants = getParticipants("A.method", true);
      const participant = participants.Get("A");
      expect(participant.ToValue()).toEqual({
        ...blankParticipant,
        name: "A",
        isStarter: false,
        positions: new Set([[0, 1]]),
      });
    });
    test("seqDsl should get all participants but ignore parameters - method call", () => {
      let participants = getParticipants('"b:B".method(x.m)', true);
      expect(participants.Size()).toBe(2);
      expect(participants.Get("b:B").width).toBeUndefined();
      expect(participants.GetPositions("b:B")).toEqual(new Set([[0, 5]]));
    });
    test("seqDsl should get all participants but ignore parameters - creation", () => {
      let participants = getParticipants('"b:B".method(new X())', true);
      expect(participants.Size()).toBe(2);
      expect(participants.Get("b:B").width).toBeUndefined();
      expect(participants.GetPositions("b:B")).toEqual(new Set([[0, 5]]));
    });
    test("seqDsl should get all participants including from", () => {
      let participants = getParticipants("A->B.m", true);
      expect(participants.Size()).toBe(2);
      expect(participants.GetPositions("A")).toEqual(new Set([[0, 1]]));
      expect(participants.GetPositions("B")).toEqual(new Set([[3, 4]]));
    });
  });

  describe("partial context", () => {
    // TODO: this was to reproduce an issue. It can be simplified.
    test("seqDsl should get all participants from a node of the root context", () => {
      const firstGrandChild = Fixture.firstGrandChild(`A->B.m {
        C.m {
          D.m {
            if(x) {
              @return B->A:m
            }
          }
        }
      }`);

      const ifBlock = firstGrandChild.children[0]
        .braceBlock()
        .block()
        .stat()[0];
      const participants = ToCollector.getParticipants(ifBlock, false);
      expect(participants.ImplicitArray().map((p) => p.name)).toStrictEqual([
        "B",
        "A",
      ]);
      expect(participants.GetPositions("A").size).toEqual(1);
      expect(participants.GetPositions("B").size).toEqual(1);
    });

    test("seqDsl should get all participants from a node of the root context", () => {
      const firstGrandChild = Fixture.firstGrandChild(`A->B.m {
        C.m {
          D.m {
            if(x) {
              return m
            }
          }
        }
      }`);

      const ifBlock = firstGrandChild.children[0]
        .braceBlock()
        .block()
        .stat()[0];
      const participants = ToCollector.getParticipants(ifBlock, false);
      expect(participants.ImplicitArray().map((p) => p.name)).toStrictEqual([
        "D",
        "C",
      ]);
      expect(participants.GetPositions("C").size).toEqual(0);
      expect(participants.GetPositions("D").size).toEqual(0);
    });
  });
});

describe("Invalid input", () => {
  test("<<", () => {
    let participants = getParticipants("<<", false);
    expect(participants.First().name).toBe("Missing `Participant`");
  });
});

describe("enterRef", () => {
  test("should add participants from ref statement with multiple participants", () => {
    let participants = getParticipants("ref(someId, A, B)", false);
    expect(participants.Size()).toBe(2);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("someId")).toBeUndefined();
  });

  test("should not add any participants for empty ref", () => {
    let participants = getParticipants("ref()", false);
    expect(participants.Size()).toBe(0);
  });

  test("should not add any participants for ref with only ID", () => {
    let participants = getParticipants("ref(someId)", false);
    expect(participants.Size()).toBe(0);
  });

  test("should add one participant for ref with ID and one participant", () => {
    let participants = getParticipants("ref(someId, A,)", false);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A")).toBeDefined();
  });

  test("should set correct positions for participants in ref", () => {
    let participants = getParticipants("ref(someId, A, B)", false);
    expect(participants.GetPositions("A")).toEqual(new Set(["[12,13]"]));
    expect(participants.GetPositions("B")).toEqual(new Set(["[15,16]"]));
  });

  test("should not affect existing participants", () => {
    let participants = getParticipants("A\nB\nref(someId, B, C)", false);
    expect(participants.Size()).toBe(3);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("C")).toBeDefined();
    expect(participants.GetPositions("B")).toEqual(
      new Set(["[2,3]", "[16,17]"]),
    );
  });

  test("should handle multiple ref statements", () => {
    let participants = getParticipants("ref(id1, A, B)\nref(id2, C, D)", false);
    expect(participants.Size()).toBe(4);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("C")).toBeDefined();
    expect(participants.Get("D")).toBeDefined();
  });

  test("should not add ID as participant if it matches an existing participant", () => {
    let participants = getParticipants("A\nref(A, B, C)", false);
    expect(participants.Size()).toBe(3);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("C")).toBeDefined();
    expect(participants.GetPositions("A")).toEqual(new Set(["[0,1]"]));
    expect(participants.GetPositions("B")).toEqual(new Set(["[9,10]"]));
    expect(participants.GetPositions("C")).toEqual(new Set(["[13,14]"]));
  });
});

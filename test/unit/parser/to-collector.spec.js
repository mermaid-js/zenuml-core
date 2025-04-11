import { Fixture } from "./fixture/Fixture";
import { RootContext } from "../../../src/parser/index";
import ToCollector from "../../../src/parser/ToCollector";
import { expect } from "vitest";
import { blankParticipant } from "../../../src/parser/Participants";

test("@return", () => {
  let participants = getParticipants("@return A->B.m");
  expect(participants.Size()).toBe(2);
  expect(participants.First().name).toBe("A");
});

test("if block", () => {
  let participants = getParticipants("if(x) { A->B.m }");
  expect(participants.Size()).toBe(2);
  expect(participants.First().name).toBe("A");
});

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
    declaration: {
      name: {
        rawText: '"B 1"',
        position: [32, 37],
      },
      stereotype: {
        rawText: "A",
        position: [28, 29],
      },
      width: {
        rawText: "1024",
        position: [38, 42],
      },
    },
  });
});

describe("Plain participants", () => {
  test.each(["A", "A\n", "A\n\r"])(
    "get participant with width and stereotype undefined",
    (code) => {
      // `A` will be parsed as a participant which matches `participant EOF`
      let participants = getParticipants(code);
      expect(participants.Size()).toBe(1);
      expect(participants.Get("A").width).toBeNull();
      expect(participants.Get("A").stereotype).toBeUndefined();
    },
  );
});

describe("With color", () => {
  test.each(["A #000000", "A   #000000", "<<s>> A #000000"])(
    "get participant with color and declaration",
    (code) => {
      let participants = getParticipants(code);
      const participant = participants.Get("A");
      expect(participant.color).toBe("#000000");
      expect(participant.declaration).toBeDefined();
      expect(participant.declaration.name.rawText).toBe("A");
      expect(participant.declaration.color.rawText).toBe("#000000");
      if (code.includes("<<s>>")) {
        expect(participant.declaration.stereotype.rawText).toBe("s");
      }
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
    let participants = getParticipants(code);
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
    let participants = getParticipants(code);
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
    let participants = getParticipants(code);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A").name).toBe(participant);
    expect(participants.Get("A").groupId).toBe(groupId);
  });
});

describe("without starter", () => {
  test.each([
    ["A.method", "A", 1],
    ["@Starter(A)", "A", 1],
  ])("code:%s => participant:%s", (code, participant, numberOfParticipants) => {
    // `A` will be parsed as a participant which matches `participant EOF`
    let participants = getParticipants(code);
    expect(participants.Size()).toBe(numberOfParticipants);
    expect(participants.Get("A").name).toBe(participant);
  });
});

describe("with label", () => {
  test.each([
    ["A as AA", "AA"],
    ['A as "AA"', "AA"],
  ])("code:%s => label:%s", (code, label) => {
    let participants = getParticipants(code);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A").name).toBe("A");
    expect(participants.Get("A").label).toBe(label);
  });
  test("participant position with label", () => {
    let participants = getParticipants("A as AA A.method");
    expect(participants.GetPositions("A")).toEqual(new Set([[5, 7]]));
  });
});

describe("with participantType", () => {
  test.each([
    ["@actor A", "actor"],
    ["@actor A\nA", "actor"],
    ["@Actor A", "Actor"],
    ["@database A", "database"],
  ])("code:%s => type:%s", (code, type) => {
    let participants = getParticipants(code);
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A").name).toBe("A");
    expect(participants.Get("A").type).toBe(type);
  });
});

describe("with participantType and declaration", () => {
  test.each([
    ["@actor A", "actor"],
    ["@actor A\nA", "actor"],
    ["@Actor A", "Actor"],
  ])("code:%s => type:%s", (code, type) => {
    let participants = getParticipants(code);
    const participant = participants.Get("A");
    expect(participant.type).toBe(type);
    expect(participant.declaration).toBeDefined();
    expect(participant.declaration.participantType.rawText).toBe("@" + type);
    expect(participant.declaration.name.rawText).toBe("A");
  });
});

describe("without starter", () => {
  test.each([
    ["A.method", "A", 1],
    ["@Starter(A)", "A", 1],
  ])("code:%s => participant:%s", (code, participant, numberOfParticipants) => {
    // `A` will be parsed as a participant which matches `participant EOF`
    let participants = getParticipants(code);
    expect(participants.Size()).toBe(numberOfParticipants);
    expect(participants.Get("A").name).toBe(participant);
  });
});

describe("implicit", () => {
  describe("from new", () => {
    test("from new", () => {
      let participants = getParticipants("new A()");
      const participant = participants.Get("A");
      expect(participant.ToValue()).toEqual({
        ...blankParticipant,
        name: "A",
        isStarter: false,
        positions: new Set([[4, 5]]),
      });
    });
    test("seqDsl should treat creation as a participant - assignment", () => {
      let participants = getParticipants("a = new A()");
      expect(participants.Size()).toBe(1);
      expect(participants.Get("a:A").width).toBeUndefined();
      expect(participants.GetPositions("a:A")).toEqual(new Set([[8, 9]]));
    });
    test("seqDsl should treat creation as a participant - assignment with type", () => {
      // We need @Starter, otherwise IA becomes a participant declaration
      let participants = getParticipants("@Starter(X) IA a = new A()");
      expect(participants.Size()).toBe(2);
      expect(participants.Get("X").width).toBeUndefined();
      expect(participants.Get("a:A").width).toBeUndefined();
      expect(participants.GetPositions("X").size).toBe(1);
      expect(participants.GetPositions("X")).toEqual(new Set([[9, 10]]));
      expect(participants.GetPositions("a:A")).toEqual(new Set([[23, 24]]));
    });

    test("seqDsl should treat creation as a participant - assignment & method call ", () => {
      let participants = getParticipants(`ret = new A() "ret:A".method()`);
      expect(participants.Size()).toBe(1);
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
      const participants = getParticipants("A.method");
      const participant = participants.Get("A");
      expect(participant.ToValue()).toEqual({
        ...blankParticipant,
        name: "A",
        isStarter: false,
        positions: new Set([[0, 1]]),
      });
    });
    test("seqDsl should get all participants but ignore parameters - method call", () => {
      let participants = getParticipants('"b:B".method(x.m)');
      expect(participants.Size()).toBe(1);
      expect(participants.Get("b:B").width).toBeUndefined();
      expect(participants.GetPositions("b:B")).toEqual(new Set([[0, 5]]));
    });
    test("seqDsl should get all participants but ignore parameters - creation", () => {
      let participants = getParticipants('"b:B".method(new X())');
      expect(participants.Size()).toBe(1);
      expect(participants.Get("b:B").width).toBeUndefined();
      expect(participants.GetPositions("b:B")).toEqual(new Set([[0, 5]]));
    });
    test("seqDsl should get all participants including from", () => {
      let participants = getParticipants("A->B.m");
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
      const participants = ToCollector.getParticipants(ifBlock);
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
      const participants = ToCollector.getParticipants(ifBlock);
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
    let participants = getParticipants("<<");
    expect(participants.First().name).toBe("Missing `Participant`");
  });
});

describe("enterRef", () => {
  test("should add participants from ref statement with multiple participants", () => {
    let participants = getParticipants("ref(someId, A, B)");
    expect(participants.Size()).toBe(2);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("someId")).toBeUndefined();
  });

  test("should not add any participants for empty ref", () => {
    let participants = getParticipants("ref()");
    expect(participants.Size()).toBe(0);
  });

  test("should not add any participants for ref with only ID", () => {
    let participants = getParticipants("ref(someId)");
    expect(participants.Size()).toBe(0);
  });

  test("should add one participant for ref with ID and one participant", () => {
    let participants = getParticipants("ref(someId, A,)");
    expect(participants.Size()).toBe(1);
    expect(participants.Get("A")).toBeDefined();
  });

  test("should set correct positions for participants in ref", () => {
    let participants = getParticipants("ref(someId, A, B)");
    expect(participants.GetPositions("A")).toEqual(new Set([[12, 13]]));
    expect(participants.GetPositions("B")).toEqual(new Set([[15, 16]]));
  });

  test("should not affect existing participants", () => {
    let participants = getParticipants("A\nB\nref(someId, B, C)");
    expect(participants.Size()).toBe(3);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("C")).toBeDefined();
    expect(participants.GetPositions("B")).toEqual(
      new Set([
        [2, 3],
        [16, 17],
      ]),
    );
  });

  test("should handle multiple ref statements", () => {
    let participants = getParticipants("ref(id1, A, B)\nref(id2, C, D)");
    expect(participants.Size()).toBe(4);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("C")).toBeDefined();
    expect(participants.Get("D")).toBeDefined();
  });

  test("should not add ID as participant if it matches an existing participant", () => {
    let participants = getParticipants("A\nref(A, B, C)");
    expect(participants.Size()).toBe(3);
    expect(participants.Get("A")).toBeDefined();
    expect(participants.Get("B")).toBeDefined();
    expect(participants.Get("C")).toBeDefined();
    expect(participants.GetPositions("A")).toEqual(new Set([[0, 1]]));
    expect(participants.GetPositions("B")).toEqual(new Set([[9, 10]]));
    expect(participants.GetPositions("C")).toEqual(new Set([[12, 13]]));
  });
});

function getParticipants(code) {
  let rootContext = RootContext(code);
  return ToCollector.getParticipants(rootContext);
}

describe("Add Starter to participants", () => {
  test("Empty context", () => {
    let rootContext = RootContext("");
    const participants = ToCollector.getParticipants(rootContext);
    expect(participants.Size()).toBe(0);
  });

  test("A B->A.m", () => {
    let rootContext = RootContext("A B B->A.m");
    const participants = ToCollector.getParticipants(rootContext);
    expect(participants.Size()).toBe(2);
    expect(participants.Get("B").isStarter).toBeFalsy();
    expect(participants.Names()).toStrictEqual(["A", "B"]);
  });
});

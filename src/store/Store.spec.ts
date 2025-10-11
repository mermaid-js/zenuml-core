import { createStore } from "jotai";
import { showTipsAtom, participantMessagesAtom } from "./Store";

const store = createStore();

describe("Store", () => {
  it("should create an instance", () => {
    expect(store.get(showTipsAtom)).toBeDefined();
    expect(store.get(showTipsAtom)).toBeFalsy();
  });

  describe("participantMessagesAtom", () => {
    it("should initialize as empty object", () => {
      const messages = store.get(participantMessagesAtom);
      expect(messages).toEqual({});
    });

    it("should store message records for participants", () => {
      store.set(participantMessagesAtom, {
        A: [
          { type: "sync", top: 16 },
          { type: "return", top: 32 },
        ],
        B: [{ type: "creation", top: 48 }],
      });

      const messages = store.get(participantMessagesAtom);
      expect(messages.A).toHaveLength(2);
      expect(messages.A[0]).toEqual({ type: "sync", top: 16 });
      expect(messages.B).toHaveLength(1);
      expect(messages.B[0]).toEqual({
        type: "creation",
        top: 48,
      });
    });

    it("should support all message types", () => {
      store.set(participantMessagesAtom, {
        participant: [
          { type: "creation", top: 0 },
          { type: "sync", top: 10 },
          { type: "async", top: 20 },
          { type: "return", top: 30 },
        ],
      });

      const messages = store.get(participantMessagesAtom);
      expect(messages.participant).toHaveLength(4);
      expect(messages.participant.map((m) => m.type)).toEqual([
        "creation",
        "sync",
        "async",
        "return",
      ]);
    });
  });
});

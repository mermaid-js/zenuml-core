import { describe, expect, test, vi } from "vitest";
import Store, { RenderMode, updateParticipantColorInText } from "./Store";
import { RootContext } from "@/parser";
import ToCollector from "@/parser/ToCollector";

describe("Store", () => {
  describe("updateParticipantColor", () => {
    test("should update color for explicitly declared participant", () => {
      // Setup initial state
      const code = "A #000000";
      const rootContext = RootContext(code);
      // @ts-ignore
      const participants = ToCollector.getParticipants(rootContext);
      const participant = participants.Get("A");
      const state = {
        code,
        participants,
        mode: RenderMode.Static,
        scale: 1,
        selected: [],
        cursor: null,
        showTips: false,
        numbering: false,
        onElementClick: vi.fn(),
      };

      // Get the store actions
      const { actions } = Store();
      const context = {
        state,
        commit: (type: string, payload: any) => {
          if (type === "code") {
            state.code = payload;
          }
        },
      };

      // Update color
      actions.updateParticipantColor(context, {
        name: "A",
        color: "#111111",
        participant,
      });

      // Only check code was updated - participant updates happen through re-parsing
      expect(state.code).toBe("A #111111");
    });

    test("should remove color when color parameter is undefined", () => {
      // Setup initial state with colored participant
      const code = "A #000000";
      const rootContext = RootContext(code);
      const participants = ToCollector.getParticipants(rootContext);
      const participant = participants.Get("A");
      const state = {
        code,
        participants,
        mode: RenderMode.FULL,
        scale: 1,
        selected: [],
        cursor: null,
        showTips: false,
        numbering: false,
        onElementClick: vi.fn(),
      };

      // Get the store actions
      const { actions } = Store();
      const context = {
        state,
        commit: (type: string, payload: any) => {
          if (type === "code") {
            state.code = payload;
          }
        },
      };

      // Remove color
      actions.updateParticipantColor(context, {
        name: "A",
        color: undefined,
        participant,
      });

      // Only check code was updated - participant updates happen through re-parsing
      expect(state.code).toBe("A");
    });

    test("should not update color for implicit participant", () => {
      // Setup initial state with implicit participant
      const code = "A->B"; // B is implicit
      const rootContext = RootContext(code);
      const participants = ToCollector.getParticipants(rootContext);
      const participant = participants.Get("B");
      const state = {
        code,
        participants,
        mode: RenderMode.FULL,
        scale: 1,
        selected: [],
        cursor: null,
        showTips: false,
        numbering: false,
        onElementClick: vi.fn(),
      };

      // Get the store actions
      const { actions } = Store();
      const context = {
        state,
        commit: (type: string, payload: any) => {
          if (type === "code") {
            state.code = payload;
          }
        },
      };

      // Try to update color of implicit participant
      actions.updateParticipantColor(context, {
        name: "B",
        color: "#111111",
        participant,
      });

      // Check code wasn't modified
      expect(state.code).toBe("A->B");
    });

    test("should handle participant with label", () => {
      // Setup initial state with labeled participant
      const code = '"User A" #000000';
      const rootContext = RootContext(code);
      const participants = ToCollector.getParticipants(rootContext);
      const participant = participants.Get("User A");
      const state = {
        code,
        participants,
        mode: RenderMode.FULL,
        scale: 1,
        selected: [],
        cursor: null,
        showTips: false,
        numbering: false,
        onElementClick: vi.fn(),
      };

      // Get the store actions
      const { actions } = Store();
      const context = {
        state,
        commit: (type: string, payload: any) => {
          if (type === "code") {
            state.code = payload;
          }
        },
      };

      // Update color
      actions.updateParticipantColor(context, {
        name: "User A",
        color: "#111111",
        participant,
      });

      // Only check code was updated - participant updates happen through re-parsing
      expect(state.code).toBe('"User A" #111111');
    });
  });

  describe("updateParticipantColorInText", () => {
    test.each([
      ["A", "#000000", "A #000000"],
      ["B #000000", "#111111", "B #111111"],
      ["C #000000", undefined, "C"],
      ['"D"', "#000000", '"D" #000000'],
      ['"E" #000000', "#111111", '"E" #111111'],
      ["<<interface>> F #000000", "#111111", "<<interface>> F #111111"],
      ["G   #000000", "#111111", "G #111111"], // Multiple spaces
      ["H #000000 ", "#111111", "H #111111"], // Trailing space
      ["I #000000\n", "#111111", "I #111111"], // Trailing newline
      ["J #abcdef", "#111111", "J #111111"], // Different color format
    ])("should update color in '%s' to '%s'", (text, color, expected) => {
      expect(updateParticipantColorInText(text, color)).toBe(expected);
    });
  });
});

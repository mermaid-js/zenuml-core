import {
  depthOnParticipant,
  depthOnParticipant4Stat,
  getParticipantDepth,
  getParticipantDepthForStat,
  getParticipantDepthInfo,
} from "./DepthCalculator";
import { Fixture } from "../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/parser/OrderedParticipants";

describe("DepthCalculator", () => {
  describe("legacy functions", () => {
    test("depthOnParticipant should return 0 for simple message", () => {
      const context = Fixture.firstStatement("A.method");
      expect(depthOnParticipant(context, "A")).toBe(0);
    });

    test("depthOnParticipant should return 1 for nested message", () => {
      const context = Fixture.firstStatement("A.method { B.method }");
      const nestedContext = context.children[0].children[0];
      expect(depthOnParticipant(nestedContext, "A")).toBe(1);
    });

    test("depthOnParticipant4Stat should return 0 for non-stat context", () => {
      const context = Fixture.firstMessage("A.method");
      expect(depthOnParticipant4Stat(context, "A")).toBe(0);
    });
  });

  describe("new structured functions", () => {
    test("getParticipantDepth should return structured data", () => {
      const context = Fixture.firstStatement("A.method");
      const result = getParticipantDepth(context, "A");

      expect(result).toEqual({
        participant: "A",
        depth: 0,
        layers: 0,
      });
    });

    test("getParticipantDepth should return correct depth for nested message", () => {
      const context = Fixture.firstStatement("A.method { B.method }");
      const nestedContext = context.children[0].children[0];
      const result = getParticipantDepth(nestedContext, "A");

      expect(result).toEqual({
        participant: "A",
        depth: 1,
        layers: 1,
      });
    });

    test("getParticipantDepthForStat should return structured data", () => {
      const context = Fixture.firstMessage("A.method");
      const result = getParticipantDepthForStat(context, "A");

      expect(result).toEqual({
        participant: "A",
        depth: 0,
        layers: 0,
      });
    });

    test("getParticipantDepthInfo should return all three participants", () => {
      const context = Fixture.firstStatement("A.method");
      const result = getParticipantDepthInfo(context, _STARTER_, "A", "B");

      expect(result).toEqual({
        origin: {
          participant: _STARTER_,
          depth: 0,
          layers: 0,
        },
        source: {
          participant: "A",
          depth: 0,
          layers: 0,
        },
        target: {
          participant: "B",
          depth: 0,
          layers: 0,
        },
      });
    });

    test("getParticipantDepthInfo should handle nested contexts", () => {
      const context = Fixture.firstStatement("A.method { B.method }");
      const nestedContext = context.children[0].children[0];
      const result = getParticipantDepthInfo(
        nestedContext,
        _STARTER_,
        "A",
        "B",
      );

      expect(result.origin.depth).toBe(0);
      expect(result.source.depth).toBe(1);
      expect(result.target.depth).toBe(0);
    });
  });
});

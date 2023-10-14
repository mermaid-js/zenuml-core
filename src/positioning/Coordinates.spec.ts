import { RootContext } from "@/parser";
// max(MIN_GAP, old_g, new_g, w/2 + left-part-w/2 + MARGIN)
import {
  ARROW_HEAD_WIDTH,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
  OCCURRENCE_WIDTH,
} from "@/positioning/Constants";
import { Coordinates } from "./Coordinates";
import { stubWidthProvider } from "../../test/unit/parser/fixture/Fixture";
import { clearCache } from "@/utils/RenderingCache";
describe("get absolute position of a participant", () => {
  beforeEach(() => {
    clearCache();
  });
  it("One wide participant", () => {
    clearCache();
    const rootContext = RootContext("A300");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("A300")).toBe(160);
  });

  it("wide participant label and error scenario", () => {
    clearCache();
    const rootContext = RootContext("A200 group {B300} C400");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);

    expect(() => coordinates.getPosition("NotExist")).toThrow(
      "Participant NotExist not found",
    );
    expect(coordinates.getPosition("A200")).toBe(110);
    expect(coordinates.getPosition("B300")).toBe(380);
    expect(coordinates.getPosition("C400")).toBe(750);
    expect(coordinates.getWidth()).toBe(960);
  });

  it.each([
    ["A1 B1", 0, 80, 240],
    ["A1 group {B1}", 0, 80, 240], // group does not change absolute positions
  ])("Use MINI_GAP (100) for %s", (code, posStarter, posA1, posB1) => {
    clearCache();
    const rootContext = RootContext(code);

    const coordinates = new Coordinates(rootContext, stubWidthProvider);

    expect(coordinates.getPosition("_STARTER_")).toBe(posStarter);
    // margin for _STARTER_ + half MINI_GAP
    expect(coordinates.getPosition("A1")).toBe(posA1);
    // margin + half MINI_GAP + position of A1
    expect(coordinates.getPosition("B1")).toBe(posB1);
  });

  it("wide method", () => {
    clearCache();
    const rootContext = RootContext("A1.m800");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("_STARTER_")).toBe(0);
    expect(coordinates.getPosition("A1")).toBe(824);
  });

  it("should not duplicate participants", () => {
    clearCache();
    const rootContext = RootContext("A1.a1 A1.a1 B1.a1");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("_STARTER_")).toBe(0);
    expect(coordinates.getPosition("A1")).toBe(80);
    expect(coordinates.getPosition("B1")).toBe(240);
  });

  it.each([
    ["new A1", "A1", 104],
    ["new A200", "A200", 134],
  ])("creation method: %s", (code, name, pos) => {
    clearCache();
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("_STARTER_")).toBe(0);
    // half participant width + Starter Position + margin
    expect(coordinates.getPosition(name)).toBe(pos);
  });

  it.each([
    ["A1->B1: m1\nB1->C1: m1\nA1->C1: m800"],
    ["A1->B1: m1\nB1->C1: m1\nC1->A1: m800"], // backwards
    ["A1->B1: m1\nB1->C1: m1\nB1->C1: m1\nC1->A1: m800"], // repeating message B1->C1:m1
  ])("non-adjacent long message: %s", (code: string) => {
    clearCache();
    const messageLength = 820;
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);

    const positionA = MIN_PARTICIPANT_WIDTH / 2 + MARGIN / 2;
    expect(coordinates.getPosition("A1")).toBe(80); //70

    // position is optimised for even distribution
    expect(coordinates.getPosition("B1")).toBe(492); //190

    // positionC is not impacted by position of B1
    const positionC =
      messageLength + positionA + ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH;
    expect(coordinates.getPosition("C1")).toBe(positionC);
  });
});

describe("Let us focus on order", () => {
  it("should add Starter to the left", () => {
    clearCache();
    const rootContext = RootContext("A1 B1->A1:m1");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("B1")).toBe(80);
    expect(coordinates.getPosition("A1")).toBe(240);
  });
});

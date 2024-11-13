import { RootContext } from "@/parser";
// max(MIN_GAP, old_g, new_g, w/2 + left-part-w/2 + MARGIN)
import {
  ARROW_HEAD_WIDTH,
  MARGIN,
  MINI_GAP,
  OCCURRENCE_WIDTH,
} from "@/positioning/Constants";
import { Coordinates } from "./Coordinates";
import {
  MOCK_CREATE_MESSAGE_WIDTH,
  stubWidthProvider,
} from "../../test/unit/parser/fixture/Fixture";
import { clearCache } from "@/utils/RenderingCache";
describe("get absolute position of a participant", () => {
  beforeEach(() => {
    clearCache();
  });

  it("One wide participant", () => {
    const rootContext = RootContext("A300");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("A300")).toBe(160);
  });

  it("wide participant label and error scenario", () => {
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
    ["A1 B1", MINI_GAP / 2, MINI_GAP + MINI_GAP / 2],
    ["A1 group {B1}", MINI_GAP / 2, MINI_GAP + MINI_GAP / 2], // group does not change absolute positions
  ])(`Use MINI_GAP ${MINI_GAP} for %s`, (code, posA1, posB1) => {
    const rootContext = RootContext(code);

    const coordinates = new Coordinates(rootContext, stubWidthProvider);

    expect(coordinates.getPosition("A1")).toBe(posA1);
    // margin + half MINI_GAP + position of A1
    expect(coordinates.getPosition("B1")).toBe(posB1);
  });

  it("wide method", () => {
    const rootContext = RootContext("A1.m800");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("_STARTER_")).toBe(0);
    expect(coordinates.getPosition("A1")).toBe(824);
  });

  it("should not duplicate participants", () => {
    const rootContext = RootContext("A1.a1 A1.a1 B1.a1");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("_STARTER_")).toBe(0);
    expect(coordinates.getPosition("A1")).toBe(MINI_GAP / 2);
    expect(coordinates.getPosition("B1")).toBe(MINI_GAP + MINI_GAP / 2);
  });

  it.each([
    [
      "new A1",
      "A1",
      MOCK_CREATE_MESSAGE_WIDTH +
        MINI_GAP / 2 +
        ARROW_HEAD_WIDTH +
        OCCURRENCE_WIDTH,
    ],
    [
      "new A200",
      "A200",
      MOCK_CREATE_MESSAGE_WIDTH +
        (200 + MARGIN) / 2 +
        ARROW_HEAD_WIDTH +
        OCCURRENCE_WIDTH,
    ],
  ])("creation method: %s", (code, name, pos) => {
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
    const messageLength = 800;
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);

    const positionA = MINI_GAP / 2;
    expect(coordinates.getPosition("A1")).toBe(positionA);

    // position is optimised for even distribution
    expect(coordinates.getPosition("B1")).toBe(467);

    // positionC is not impacted by position of B1
    const positionC =
      messageLength + positionA + ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH;
    expect(coordinates.getPosition("C1")).toBe(positionC);
  });
});

describe("Let us focus on order", () => {
  beforeEach(() => {
    clearCache();
  });
  it("should add Starter to the left", () => {
    const rootContext = RootContext("A1 B1->A1:m1");
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    expect(coordinates.getPosition("B1")).toBe(165);
    expect(coordinates.getPosition("A1")).toBe(MINI_GAP / 2);
  });
});

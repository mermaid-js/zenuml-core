import { TotalWidth } from "./WidthOfContext";
import { Fixture } from "../../../../test/unit/parser/fixture/Fixture";
import { Coordinates } from "@/positioning/Coordinates";
import { stubWidthProvider } from "@/../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";
import {
  FRAGMENT_PADDING_X,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
} from "@/positioning/Constants";

vi.mock("@/positioning/WidthProviderFunc", () => {
  return {
    default: (text: string) => {
      const number = parseInt(text.trim().substring(1) || "0");
      return isNaN(number) ? 0 : number;
    },
  };
});

describe("TotalWidth", function () {
  test("TotalWidth", () => {
    const code = "A.method";
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    const ctx = Fixture.firstStatement(code);
    // -====A====-
    expect(TotalWidth(ctx, coordinates)).toBe(100);
  });

  test("TotalWidth with depth", () => {
    const code = "if(x) {A.method}";
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    const ctx = Fixture.firstStatement(code);
    //  -====A====-  # participants
    // [           ] # alt fragment
    expect(TotalWidth(ctx, coordinates)).toBe(120);
  });

  test("TotalWidth with distance", () => {
    const code = "if(x) {A.method; B.method}";
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    const ctx = Fixture.firstStatement(code);
    // -====A====--====B====-  # participants
    //[                      ] # fragment
    expect(TotalWidth(ctx, coordinates)).toBe(220);
  });

  test("TotalWidth with extra width from self message", () => {
    const code = "if(x) {A.method; B.method { s100 }}";
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    const ctx = Fixture.firstStatement(code);
    // -====A====--====B====-
    //[     --------->  -self-<]
    const widthA = MIN_PARTICIPANT_WIDTH + MARGIN;
    const widthB = MIN_PARTICIPANT_WIDTH + MARGIN;
    const messageWidth = 100;
    const expected =
      FRAGMENT_PADDING_X +
      widthA +
      widthB / 2 +
      messageWidth +
      FRAGMENT_PADDING_X;
    expect(TotalWidth(ctx, coordinates)).toBe(expected);
  });

  test("TotalWidth with extra width from self message2", () => {
    const code = "if(x) {A1.method; B1.method { s200 } C1.method { s10 }}";
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    const ctx = Fixture.firstStatement(code);
    // -====A====--====B====--====C====-
    //[     --------->  -self---------------------<]
    const widthA = MIN_PARTICIPANT_WIDTH + MARGIN;
    const widthB = MIN_PARTICIPANT_WIDTH + MARGIN;
    const s200Width = 200;
    const expected =
      FRAGMENT_PADDING_X + widthA + widthB / 2 + s200Width + FRAGMENT_PADDING_X;
    expect(TotalWidth(ctx, coordinates)).toBe(expected);
  });
});

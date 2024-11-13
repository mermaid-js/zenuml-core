import { TotalWidth } from "./WidthOfContext";
import { Coordinates } from "@/positioning/Coordinates";
import { stubWidthProvider } from "@/../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";
import {
  FRAGMENT_PADDING_X,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
} from "@/positioning/Constants";

describe("TotalWidth", () => {
  const getTotalWidth = (code: string): number => {
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    return TotalWidth(rootContext, coordinates);
  };

  const getParticipantWidth = () => MIN_PARTICIPANT_WIDTH + MARGIN;

  test("calculates width for simple method call", () => {
    // -====A====-
    expect(getTotalWidth("A.method")).toBe(100);
  });

  test("calculates width with nested depth", () => {
    //  -====A====-  # participants
    // [           ] # alt fragment
    expect(getTotalWidth("if(x) {A.method}")).toBe(120);
  });

  test("calculates width with multiple participants", () => {
    // -====A====--====B====-  # participants
    //[                      ] # fragment
    expect(getTotalWidth("if(x) {A.method; B.method}")).toBe(220);
  });

  describe("self message width calculations", () => {
    test("includes extra width from single self message", () => {
      // -====A====--====B====-
      //[     --------->  -self-<]
      const totalWidth = getTotalWidth("if(x) {A.method; B.method { s100 }}");

      const expectedWidth =
        FRAGMENT_PADDING_X +
        getParticipantWidth() +
        getParticipantWidth() / 2 +
        100 + // self message width
        FRAGMENT_PADDING_X;

      expect(totalWidth).toBe(expectedWidth);
    });

    test("uses widest self message for total width", () => {
      // -====A====--====B====--====C====-
      //[     --------->  -self---------------------<]
      const totalWidth = getTotalWidth(
        "if(x) {A1.method; B1.method { s200 } C1.method { s10 }}",
      );

      const expectedWidth =
        FRAGMENT_PADDING_X +
        getParticipantWidth() +
        getParticipantWidth() / 2 +
        200 + // widest self message
        FRAGMENT_PADDING_X;

      expect(totalWidth).toBe(expectedWidth);
    });
  });
});

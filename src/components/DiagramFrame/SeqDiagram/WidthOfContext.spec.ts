import { TotalWidth } from "./WidthOfContext";
import { Coordinates } from "@/positioning/Coordinates";
import { stubWidthProvider } from "@/../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";
import {
  FRAGMENT_MIN_WIDTH,
  FRAGMENT_PADDING_X,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";

describe("TotalWidth", () => {
  const getTotalWidth = (code: string): number => {
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    return TotalWidth(rootContext, coordinates);
  };

  const getParticipantWidth = () => MIN_PARTICIPANT_WIDTH + MARGIN;

  test("self call at root level", () => {
    expect(getTotalWidth("a300")).toBe(320);
  });

  test("self call at root level 2", () => {
    expect(getTotalWidth("if(x) {a300}")).toBe(370);
  });

  test("calculates width for simple method call", () => {
    // -====S====--====A====-
    expect(getTotalWidth("A.method")).toBe(200);
  });

  test("calculates width with nested depth", () => {
    //  -====S====--====A====-  # participants
    // [           ] # alt fragment
    expect(getTotalWidth("if(x) {A.method}")).toBe(220);
  });

  test("calculates width with nested depth", () => {
    //  -====S====-  # participants
    // [                ] # alt fragment, min-width takes effect
    expect(getTotalWidth("if(x) {}")).toBe(
      FRAGMENT_MIN_WIDTH + FRAGMENT_PADDING_X * 2,
    );
    //  -====S====-  # participants
    // [                ] # alt fragment, min-width takes effect
    expect(getTotalWidth("if(x) { if(y() {}}")).toBe(
      FRAGMENT_MIN_WIDTH + FRAGMENT_PADDING_X * 4,
    );
  });

  test("calculates width with multiple participants", () => {
    // -====S====--====A====--====B====-  # participants
    //[                      ] # fragment
    expect(getTotalWidth("if(x) {A.method; B.method}")).toBe(320);
  });

  describe("self message width calculations", () => {
    // A self call is drawn from the right wall of its innermost activation
    // bar, so each enclosing activation on the same participant moves its
    // label right by one bar side.
    test.each([
      ["one activation", "if(x) { A.m { a300 } }", 470, 1],
      ["activation outside the fragment", "A.m { if(x) { a300 } }", 470, 1],
      ["three activations", "if(x) { A.m { b0 { c0 { a300 } } } }", 470, 3],
      ["an activation on the starter", "if(x) { b0 { a300 } }", 370, 1],
    ])("self call inside %s", (_, code, widthWithoutOffset, depth) => {
      expect(getTotalWidth(code)).toBe(
        widthWithoutOffset + depth * OCCURRENCE_BAR_SIDE_WIDTH,
      );
    });

    test("includes extra width from single self message", () => {
      // -====S====--====A====--====B====-
      //[     --------->  -self-<]
      const totalWidth = getTotalWidth("if(x) {A.method; B.method { s100 }}");
      const starterWidth = getParticipantWidth();
      const expectedWidth =
        starterWidth +
        FRAGMENT_PADDING_X +
        getParticipantWidth() +
        getParticipantWidth() / 2 +
        100 + // self message width
        OCCURRENCE_BAR_SIDE_WIDTH + // B.method's activation shifts the label
        FRAGMENT_PADDING_X;

      expect(totalWidth).toBe(expectedWidth);
    });

    test("uses widest self message for total width", () => {
      // -====S====--====A====--====B====--====C====-
      //[                --------->  -self---------------------<]
      const totalWidth = getTotalWidth(
        "if(x) {A1.method; B1.method { s200 } C1.method { s10 }}",
      );
      const starterWidth = getParticipantWidth();
      const expectedWidth =
        starterWidth +
        FRAGMENT_PADDING_X +
        getParticipantWidth() +
        getParticipantWidth() / 2 +
        200 + // widest self message
        OCCURRENCE_BAR_SIDE_WIDTH + // B1.method's activation shifts the label
        FRAGMENT_PADDING_X;

      expect(totalWidth).toBe(expectedWidth);
    });
  });
});

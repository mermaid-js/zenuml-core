import { RootContext } from "@/parser";
import { VerticalCoordinates } from "./VerticalCoordinates";
import { Coordinates } from "./Coordinates";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { WidthFunc, TextType } from "@/positioning/Coordinate";

const stubWidthProvider: WidthFunc = (text: string, type: TextType) => {
  const base = type === TextType.ParticipantName ? 10 : 8;
  return Math.max(40, text.length * base);
};

describe("VerticalCoordinates", () => {
  it("computes creation offsets for participants", () => {
    const code = "A.m{new Order}";
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      widthProvider: stubWidthProvider,
      originParticipant: _STARTER_,
      participantOrder,
    });
    const creationTop = vertical.getCreationTop("Order");
    expect(creationTop).toBeGreaterThan(0);
    const entries = vertical.entries();
    expect(entries.length).toBeGreaterThan(0);
  });
});

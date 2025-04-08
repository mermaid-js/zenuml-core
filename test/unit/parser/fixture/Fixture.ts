import { TextType, WidthFunc } from "../../../../src/positioning/Coordinate";
import { RootContext } from "../../../../src/parser/index";

export const MOCK_CREATE_MESSAGE_WIDTH = 100;

export class Fixture {
  static firstStatement(code: string) {
    const rootContext = RootContext(code);
    return rootContext && rootContext.block().stat()[0];
  }

  static firstMessage(code: string) {
    return Fixture.firstStatement(code).message();
  }

  static firstChild(code: string) {
    return Fixture.firstStatement(code)
      .children[0].braceBlock()
      .block()
      .stat()[0];
  }

  static firstGrandChild(code: string) {
    return Fixture.firstChild(code).children[0].Statements()[0];
  }
}

export const stubWidthProvider: WidthFunc = (text, textType) => {
  if (text === "«create»" && textType === TextType.MessageContent) {
    return MOCK_CREATE_MESSAGE_WIDTH;
  }
  const number = parseInt(text.trim().substring(1) || "0");

  return isNaN(number) ? 0 : number;
};

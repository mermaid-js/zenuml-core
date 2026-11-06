import { describe, expect, test } from "bun:test";
import FrameBuilder from "@/parser/FrameBuilder";
import { RootContext as AntlrRootContext } from "@/parser";
import {
  LangiumFrameBuilder,
  RootContext as LangiumRootContext,
} from "@/parser-langium/compat";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import FrameBorder from "@/positioning/FrameBorder";

// The diagram frame must be padded for the deepest top-level fragment, not only
// the first one, and both parsers must agree on it.
const code = `A B
if(x) {
  A->B.m()
}
try {
  A->B.m()
} catch {
  par {
    if(y) {
      A->B.m()
    }
  }
}`;
const participants = [_STARTER_, "A", "B"];

describe("FrameBuilder parity with several top-level fragments", () => {
  test("Langium pads the frame for the deepest top-level fragment", () => {
    const frame = new LangiumFrameBuilder(participants).getFrame(
      LangiumRootContext(code),
    );
    expect(FrameBorder(frame)).toEqual({ left: 30, right: 30 });
  });

  test("Langium and ANTLR build the same frame", () => {
    expect(
      new LangiumFrameBuilder(participants).getFrame(LangiumRootContext(code)),
    ).toEqual(new FrameBuilder(participants).getFrame(AntlrRootContext(code)));
  });
});

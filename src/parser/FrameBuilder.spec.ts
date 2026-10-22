import FrameBuilder from "./FrameBuilder";
import { Fixture } from "../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { RootContext } from "@/parser";
import FrameBorder from "@/positioning/FrameBorder";

describe("FrameBuilder", () => {
  test("getFrame should return a frame", () => {
    const orderedParticipants = ["A", "B", "C"];
    const frameBuilder = new FrameBuilder(orderedParticipants);
    const context = Fixture.firstStatement("A.method {if(x) {B.method}}");

    // Since there's no children, frameFunc(context) should return an empty frame
    const expectedFrame = { type: "alt", left: "A", right: "B", children: [] };
    expect(frameBuilder.getFrame(context)).toEqual(expectedFrame);
  });

  test("getFrame should return a frame", () => {
    const orderedParticipants = ["D", "C", "B", "A"];
    const frameBuilder = new FrameBuilder(orderedParticipants);

    const context = Fixture.firstStatement(`A.method {
      if(x) {
        B.method
        if(y) {
          C.method {
            if(z) {
              D.method
            }
          }
        }
      }
    }`);

    // Since there's no children, frameFunc(context) should return an empty frame
    const expectedFrame = {
      type: "alt",
      left: "D",
      right: "A",
      children: [
        {
          type: "alt",
          left: "D",
          right: "A",
          children: [
            {
              type: "alt",
              left: "D",
              right: "C",
              children: [],
            },
          ],
        },
      ],
    };

    const rootFrame = frameBuilder.getFrame(context);
    expect(rootFrame).toEqual(expectedFrame);
  });

  test("getFrame should return a frame", () => {
    const orderedParticipants = [_STARTER_, "d"];
    const frameBuilder = new FrameBuilder(orderedParticipants);

    const context = Fixture.firstStatement(`if(x) {
    d.method
    section(x) {
      v
    }
}`);

    // Since there's no children, frameFunc(context) should return an empty frame
    const expectedFrame = {
      type: "alt",
      left: _STARTER_,
      right: "d",
      children: [
        {
          type: "section",
          left: _STARTER_,
          right: _STARTER_,
          children: [],
        },
      ],
    };

    const rootFrame = frameBuilder.getFrame(context);
    expect(rootFrame).toEqual(expectedFrame);
  });

  // ... more tests here ...
});

describe("FrameBuilder with several top-level fragments", () => {
  test("the diagram frame border covers the deepest top-level fragment, not only the first", () => {
    // The first top-level fragment is one level deep, the second three levels
    // (try > par > alt). The diagram must reserve room for all three levels on
    // both sides, otherwise the try fragment overflows the frame.
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
    const rootContext = RootContext(code);
    const frame = new FrameBuilder([_STARTER_, "A", "B"]).getFrame(rootContext);
    expect(FrameBorder(frame)).toEqual({ left: 30, right: 30 });
  });
});

describe("FrameBuilder reuse", () => {
  test("a reused builder gives each fragment the same frame as a fresh builder", () => {
    // The opt is one level deep; the if before it is three levels deep. A
    // builder reused across fragments must not carry the if's frames into
    // the opt's result.
    const code = `A B C
if(x) {
  if(y) {
    if(z) {
      A->B.m
    }
  }
}
opt {
  B->C.n
}`;
    const rootContext = RootContext(code);
    const stats = rootContext.block().stat();
    const participants = [_STARTER_, "A", "B", "C"];

    const reused = new FrameBuilder(participants);
    const reusedBorders = stats.map((stat: any) =>
      FrameBorder(reused.getFrame(stat)),
    );
    const freshBorders = stats.map((stat: any) =>
      FrameBorder(new FrameBuilder(participants).getFrame(stat)),
    );

    expect(freshBorders).toEqual([
      { left: 30, right: 30 },
      { left: 10, right: 10 },
    ]);
    expect(reusedBorders).toEqual(freshBorders);
  });
});

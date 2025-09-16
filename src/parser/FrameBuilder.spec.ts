import { buildFramesModel } from "@/ir/frames";
import { Fixture } from "../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/parser/OrderedParticipants";

describe("FrameBuilder", () => {
  test("getFrame should return a frame", () => {
    const orderedParticipants = ["A", "B", "C"];
    const context = Fixture.firstStatement("A.method {if(x) {B.method}}");

    // Since there's no children, frameFunc(context) should return an empty frame
    const expectedFrame = { type: "alt", left: "A", right: "B", children: [] };
    const frame = buildFramesModel(context, orderedParticipants).root;
    expect(frame).toMatchObject(expectedFrame);
    expect(frame?.id).toBeDefined();
  });

  test("getFrame should return a frame", () => {
    const orderedParticipants = ["D", "C", "B", "A"];

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

    const rootFrame = buildFramesModel(context, orderedParticipants).root;
    expect(rootFrame).toMatchObject(expectedFrame);
    expect(rootFrame?.id).toBeDefined();
    expect(rootFrame?.children?.[0]?.id).toBeDefined();
  });

  test("getFrame should return a frame", () => {
    const orderedParticipants = [_STARTER_, "d"];

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

    const rootFrame = buildFramesModel(context, orderedParticipants).root;
    expect(rootFrame).toMatchObject(expectedFrame);
    expect(rootFrame?.id).toBeDefined();
    expect(rootFrame?.children?.[0]?.id).toBeDefined();
  });

  // ... more tests here ...
});

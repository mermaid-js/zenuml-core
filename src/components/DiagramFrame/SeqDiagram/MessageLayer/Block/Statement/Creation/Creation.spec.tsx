import { Fixture } from "../../../../../../../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/constants";
import Anchor2 from "@/positioning/Anchor2";
import { codeAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { Creation } from "./Creation";
import { createStore, Provider } from "jotai";
import type { MessageVM } from "@/vm/messages";
import { StatementKind } from "@/ir/tree-types";

const store = createStore();

function mountCreationWithVM(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
  vm: MessageVM & { arrow: { translateX: number; interactionWidth: number; rightToLeft: boolean } },
) {
  store.set(codeAtom, code);

  const creationContext = contextLocator(code);
  const props = {
    origin,
    fragmentOffset: 100,
    vm,
  };

  return render(
    <Provider store={store}>
      <Creation {...props} />
    </Provider>,
  );
}

describe.skip("Creation", () => {
  it("data, props and computed properties", async () => {
    /**
     * Known limitations:
     * 1. `IA a = new A()` cannot be the first statement in the file. `IA` will be recognised as a Participant.
     */
    const anchorStarter = new Anchor2(100, 0);
    const anchorA = new Anchor2(200, 1);
    const expected = anchorStarter.edgeOffset(anchorA);

    const mockVM: MessageVM & { arrow: { translateX: number; interactionWidth: number; rightToLeft: boolean } } = {
      type: StatementKind.Creation,
      from: _STARTER_,
      to: "A",
      signature: "«create»",
      isSelf: false,
      assignee: "a", // For "a = new A"
      arrow: {
        translateX: 0,
        interactionWidth: expected,
        rightToLeft: false,
      },
    };

    const creationWrapper = mountCreationWithVM(
      "a = new A",
      Fixture.firstStatement,
      _STARTER_,
      mockVM,
    );

    expect(
      creationWrapper.container.querySelector("div")?.dataset.signature,
    ).toBe("«create»");
    expect(
      creationWrapper.container.querySelector(".message label")?.textContent,
    ).toBe("a");

    // -------------==a:A==-
    // --<<create>>-->[]
    // In the above demonstration,
    // `-` is for margin and `=` is for participant width.
    // `---xxx--->` is for message arrow and `[]` is for occurrence.
    // TODO: add a test case where the width is caused by the message
    expect(creationWrapper.container.querySelector("div")?.style.width).toBe(
      expected + "px",
    );
    expect(
      creationWrapper.container
        .querySelector("div")
        ?.classList.contains("right-to-left"),
    ).toBeFalsy();
  });

  it("right to left", async () => {
    const anchorA = new Anchor2(100, 2);
    const anchorB = new Anchor2(200, 1);
    const expected = anchorA.edgeOffset(anchorB);

    const mockVM: MessageVM & { arrow: { translateX: number; interactionWidth: number; rightToLeft: boolean } } = {
      type: StatementKind.Creation,
      from: "B",
      to: "A",
      signature: "«create»",
      isSelf: false,
      assignee: "", // For "new A" (no assignment)
      arrow: {
        translateX: 0,
        interactionWidth: expected,
        rightToLeft: true,
      },
    };

    const creationWrapper = mountCreationWithVM(
      "A.m{B.m{new A}}",
      Fixture.firstGrandChild,
      "B",
      mockVM,
    );

    expect(
      creationWrapper.container
        .querySelector("div")
        ?.classList.contains("right-to-left"),
    ).toBeTruthy();
    // -====A====--====B====-
    //      []]<--<<c>>--
    // There is enough space for the message arrow and occurrence.
    expect(creationWrapper.container.querySelector("div")?.style.width).toBe(
      expected + "px",
    );
  });

  it("right to left within alt fragment", async () => {
    function contextLocator(code: string) {
      return Fixture.firstGrandChild(code)
        .alt()
        .ifBlock()
        .braceBlock()
        .block()
        .stat()[0];
    }

    const anchorA = new Anchor2(100, 2);
    const anchorB = new Anchor2(200, 1);
    const expected = anchorA.edgeOffset(anchorB);

    const mockVM: MessageVM & { arrow: { translateX: number; interactionWidth: number; rightToLeft: boolean } } = {
      type: StatementKind.Creation,
      from: "B",
      to: "A",
      signature: "«create»",
      isSelf: false,
      assignee: "", // For "new A" (no assignment)
      arrow: {
        translateX: 0,
        interactionWidth: expected,
        rightToLeft: true,
      },
    };

    const creationWrapper = mountCreationWithVM(
      "A.m{B.m{if(x){new A}}}",
      contextLocator,
      "B",
      mockVM,
    );

    expect(
      creationWrapper.container
        .querySelector("div")
        ?.classList.contains("right-to-left"),
    ).toBeTruthy();
    // -====A====--====B====-
    //      []]--<<c>>--
    // There is enough space for the message and occurrence.
    expect(creationWrapper.container.querySelector("div")?.style.width).toBe(
      expected + "px",
    );
  });
});

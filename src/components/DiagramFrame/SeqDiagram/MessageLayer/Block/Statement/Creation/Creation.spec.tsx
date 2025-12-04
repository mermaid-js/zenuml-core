import { Fixture } from "../../../../../../../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import Anchor2 from "@/positioning/Anchor2";
import { codeAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { Creation } from "./Creation";
import { createStore, Provider } from "jotai";

const store = createStore();

function mountCreationWithCode(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
) {
  store.set(codeAtom, code);

  const creationContext = contextLocator(code);
  const props = {
    context: creationContext,
    origin,
    fragmentOffset: 100,
  };

  return render(
    <Provider store={store}>
      <Creation {...props} />
    </Provider>,
  );
}
describe("Creation", () => {
  it("data, props and computed properties", async () => {
    /**
     * Known limitations:
     * 1. `IA a = new A()` cannot be the first statement in the file. `IA` will be recognised as a Participant.
     */
    const creationWrapper = mountCreationWithCode(
      "a = new A",
      Fixture.firstStatement,
      _STARTER_,
    );

    expect(
      creationWrapper.container.querySelector("div")?.dataset.signature,
    ).toBe("«create»");
    expect(
      creationWrapper.container.querySelector(".message span")?.textContent,
    ).toBe("a");

    // -------------==a:A==-
    // --<<create>>-->[]
    // In the above demonstration,
    // `-` is for margin and `=` is for participant width.
    // `---xxx--->` is for message arrow and `[]` is for occurrence.
    // TODO: add a test case where the width is caused by the message
    const anchorStarter = new Anchor2(100, 0);
    const anchorA = new Anchor2(200, 1);
    const expected = anchorStarter.edgeOffset(anchorA);
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
    const creationWrapper = mountCreationWithCode(
      "A.m{B.m{new A}}",
      Fixture.firstGrandChild,
      "B",
    );
    expect(
      creationWrapper.container
        .querySelector("div")
        ?.classList.contains("right-to-left"),
    ).toBeTruthy();
    // -====A====--====B====-
    //      []]<--<<c>>--
    // There is enough space for the message arrow and occurrence.
    const anchorA = new Anchor2(100, 2);
    const anchorB = new Anchor2(200, 1);
    const expected = anchorA.edgeOffset(anchorB);
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
    const creationWrapper = mountCreationWithCode(
      "A.m{B.m{if(x){new A}}}",
      contextLocator,
      "B",
    );
    expect(
      creationWrapper.container
        .querySelector("div")
        ?.classList.contains("right-to-left"),
    ).toBeTruthy();
    // -====A====--====B====-
    //      []]--<<c>>--
    // There is enough space for the message and occurrence.
    const anchorA = new Anchor2(100, 2);
    const anchorB = new Anchor2(200, 1);
    const expected = anchorA.edgeOffset(anchorB);
    expect(creationWrapper.container.querySelector("div")?.style.width).toBe(
      expected + "px",
    );
  });
});

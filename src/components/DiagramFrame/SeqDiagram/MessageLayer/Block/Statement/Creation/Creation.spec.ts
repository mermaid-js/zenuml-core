import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import { VueSequence } from "@/index";
// @ts-ignore
import Creation from "./Creation.vue";
import { Fixture } from "../../../../../../../../test/unit/parser/fixture/Fixture";
import { configureCompat } from "vue";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import Anchor2 from "@/positioning/Anchor2";

function mountCreationWithCode(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
) {
  const storeConfig = VueSequence.Store();
  // @ts-ignore
  storeConfig.state.code = code;
  const store = createStore(storeConfig);

  const creationContext = contextLocator(code);
  const props = {
    context: creationContext,
    origin,
    fragmentOffset: 100,
  };

  return shallowMount(Creation, { global: { plugins: [store] }, props });
}
beforeEach(() => {
  configureCompat({
    RENDER_FUNCTION: false,
  });
});
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

    const vm = creationWrapper.vm as any;
    expect(vm.signature).toBe("«create»");
    expect(vm.assignee).toBe("a");
    // -------------==a:A==-
    // --<<create>>-->[]
    // In the above demonstration,
    // `-` is for margin and `=` is for participant width.
    // `---xxx--->` is for message arrow and `[]` is for occurrence.
    // TODO: add a test case where the width is caused by the message
    const anchorStarter = new Anchor2(100, 0);
    const anchorA = new Anchor2(200, 1);
    const expected = anchorStarter.edgeOffset(anchorA);
    expect(vm.interactionWidth).toBe(expected);
    expect(vm.rightToLeft).toBeFalsy();
  });

  it("right to left", async () => {
    const creationWrapper = mountCreationWithCode(
      "A.m{B.m{new A}}",
      Fixture.firstGrandChild,
      "B",
    );
    const vm = creationWrapper.vm as any;
    expect(vm.rightToLeft).toBeTruthy();
    // -====A====--====B====-
    //      []]<--<<c>>--
    // There is enough space for the message arrow and occurrence.
    const anchorA = new Anchor2(100, 2);
    const anchorB = new Anchor2(200, 1);
    const expected = anchorA.edgeOffset(anchorB);
    expect(vm.interactionWidth).toBe(expected);
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
    const vm = creationWrapper.vm as any;
    expect(vm.rightToLeft).toBeTruthy();
    // -====A====--====B====-
    //      []]--<<c>>--
    // There is enough space for the message and occurrence.
    const anchorA = new Anchor2(100, 2);
    const anchorB = new Anchor2(200, 1);
    const expected = anchorA.edgeOffset(anchorB);
    expect(vm.interactionWidth).toBe(expected);
  });
});

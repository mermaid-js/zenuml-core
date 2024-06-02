import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import { VueSequence } from "@/index";
import Creation from "./Creation.vue";
import { Fixture } from "../../../../../../../../test/unit/parser/fixture/Fixture";

function mountCreationWithCode(
  code: string,
  contextLocator: (code: string) => any,
) {
  const storeConfig = VueSequence.Store();
  // @ts-ignore
  storeConfig.state.code = code;
  const store = createStore(storeConfig);

  const creationContext = contextLocator(code);
  const props = {
    context: creationContext,
    fragmentOffset: 100,
  };

  return shallowMount(Creation, { global: { plugins: [store] }, props });
}

describe("Creation", () => {
  it("data , props and computed properties", async () => {
    /**
     * Known limitations:
     * 1. `IA a = new A()` cannot be the first statement in the file. `IA` will be recognised as a Participant.
     */
    const creationWrapper = mountCreationWithCode(
      "a = new A",
      Fixture.firstStatement,
    );

    const vm = creationWrapper.vm as any;
    expect(vm.from).toBe("_STARTER_");
    expect(vm.signature).toBe("«create»");
    expect(vm.assignee).toBe("a");
    expect(vm.distance2).toStrictEqual(expect.any(Function));
    expect(vm.interactionWidth).toBe(83);
    expect(vm.rightToLeft).toBeFalsy();
  });

  it("right to left", async () => {
    const creationWrapper = mountCreationWithCode(
      "A.m{B.m{new A}}",
      Fixture.firstGrandChild,
    );
    const vm = creationWrapper.vm as any;
    console.log(creationWrapper);
    expect(vm.rightToLeft).toBeTruthy();
    expect(vm.interactionWidth).toBe(119);
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
    );
    const vm = creationWrapper.vm as any;
    expect(vm.rightToLeft).toBeTruthy();
    expect(vm.interactionWidth).toBe(119);
  });
});

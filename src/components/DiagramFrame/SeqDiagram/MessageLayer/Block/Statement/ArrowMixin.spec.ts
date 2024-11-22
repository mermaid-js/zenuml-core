import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import { VueSequence } from "@/index";
// @ts-ignore
import Interaction from "./Interaction/Interaction.vue";
// @ts-ignore
import Return from "./Return/Return.vue";
// @ts-ignore
import InteractionAsync from "./InteractionAsync/Interaction-async.vue";
import { Fixture } from "../../../../../../../test/unit/parser/fixture/Fixture";
import { configureCompat } from "vue";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { expect } from "vitest";

function mountInteractionWithCode(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
) {
  const storeConfig = VueSequence.Store();
  // @ts-ignore
  storeConfig.state.code = code;
  const store = createStore(storeConfig);

  const context = contextLocator(code);
  const props = {
    context,
    origin,
    fragmentOffset: 100,
  };

  return shallowMount(Interaction, { global: { plugins: [store] }, props });
}

function mountInteractionAsyncWithCode(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
) {
  const storeConfig = VueSequence.Store();
  // @ts-ignore
  storeConfig.state.code = code;
  const store = createStore(storeConfig);

  const context = contextLocator(code);
  const props = {
    context,
    origin,
    fragmentOffset: 100,
  };

  return shallowMount(InteractionAsync, {
    global: { plugins: [store] },
    props,
  });
}

function mountReturnWithCode(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
) {
  const storeConfig = VueSequence.Store();
  // @ts-ignore
  storeConfig.state.code = code;
  const store = createStore(storeConfig);

  const context = contextLocator(code);
  const props = {
    context,
    origin,
    fragmentOffset: 100,
  };

  return shallowMount(Return, { global: { plugins: [store] }, props });
}

beforeEach(() => {
  configureCompat({
    RENDER_FUNCTION: false,
  });
});
describe("ArrowMixin", () => {
  describe("targetOffset", () => {
    it("sync message", async () => {
      const creationWrapper = mountInteractionWithCode(
        "A.method() { B.method() }",
        Fixture.firstChild,
        "A",
      );

      const vm = creationWrapper.vm as any;
      expect(vm.target).toBe("B");
      expect(vm.originOffset).toBe(7);
      expect(vm.sourceOffset).toBe(7);
      expect(vm.targetOffset).toBe(0);
    });

    it("async message", async () => {
      const creationWrapper = mountInteractionAsyncWithCode(
        "A.method() { B.method() { B->A: async } }",
        Fixture.firstGrandChild,
        "A",
      );

      const vm = creationWrapper.vm as any;
      expect(vm.target).toBe("A");
      expect(vm.originOffset).toBe(7);
      expect(vm.sourceOffset).toBe(7);
      expect(vm.targetOffset).toBe(7);
    });

    it("return message", async () => {
      const creationWrapper = mountReturnWithCode(
        "A.method() { B.method() { return r } }",
        Fixture.firstGrandChild,
        "B",
      );

      const vm = creationWrapper.vm as any;
      expect(vm.context.getFormattedText()).toBe("return r");
      expect(vm.context.ret().ReturnTo()).toBe("A");
      expect(vm.target).toBe("A");
      expect(vm.originOffset).toBe(7);
      expect(vm.sourceOffset).toBe(7);
      expect(vm.targetOffset).toBe(7);
    });
  });

  it("isJointOccurrence", async () => {
    const creationWrapper = mountInteractionWithCode(
      "A.method() { B.method() }",
      Fixture.firstChild,
      _STARTER_,
    );

    const vm = creationWrapper.vm as any;
    expect(vm.isJointOccurrence("A")).toBe(true);
  });

  it("self message 1", async () => {
    const interaction = mountInteractionWithCode(
      "self()",
      Fixture.firstStatement,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.isJointOccurrence(_STARTER_)).toBeFalsy();
  });

  it("sync message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m()",
      Fixture.firstStatement,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.isJointOccurrence(_STARTER_)).toBeFalsy();
    expect(vm.isJointOccurrence("A")).toBeTruthy();
  });

  it("creation message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m() { new B }",
      Fixture.firstChild,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.isJointOccurrence("A")).toBeTruthy();
    expect(vm.isJointOccurrence("B")).toBeTruthy();
  });
});

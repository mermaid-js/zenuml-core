import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import { VueSequence } from "@/index";
// @ts-ignore
import Interaction from "./Interaction/Interaction.vue";
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
beforeEach(() => {
  configureCompat({
    RENDER_FUNCTION: false,
  });
});
describe("ArrowMixin", () => {
  it("findContextForReceiver", async () => {
    const creationWrapper = mountInteractionWithCode(
      "A.method() { B.method() }",
      Fixture.firstChild,
      _STARTER_,
    );

    const vm = creationWrapper.vm as any;
    expect(vm.findContextForReceiver("C")).toBe(null);
    expect(vm.findContextForReceiver("B").getFormattedText()).toBe(
      "B.method()",
    );
    expect(vm.findContextForReceiver("A").getFormattedText()).toBe(
      "A.method() { B.method() }",
    );
  });

  // findContextForReceiver search for Ancestors only for self messages
  // and does not include the current context
  it("findContextForReceiver self message 1", async () => {
    const interaction = mountInteractionWithCode(
      "self()",
      Fixture.firstStatement,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.findContextForReceiver(_STARTER_).getFormattedText()).toBe(
      "self()",
    );
  });

  it("findContextForReceiver sync message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m()",
      Fixture.firstStatement,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.findContextForReceiver("A").getFormattedText()).toBe("A.m()");
  });

  it("findContextForReceiver creation message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m() { new B }",
      Fixture.firstChild,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.findContextForReceiver("B").getFormattedText()).toBe("new B");
  });
});

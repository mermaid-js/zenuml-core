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
    expect(vm.findContextForReceiver("B").getFormattedText()).toBe(
      "B.method()",
    );
    expect(vm.findContextForReceiver("A").getFormattedText()).toBe(
      "A.method() { B.method() }",
    );
  });
});

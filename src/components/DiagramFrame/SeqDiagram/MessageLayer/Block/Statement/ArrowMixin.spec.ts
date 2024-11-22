import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import { VueSequence } from "@/index";
// @ts-ignore
import Interaction from "./Interaction/Interaction.vue";
import { Fixture } from "../../../../../../../test/unit/parser/fixture/Fixture";
import { configureCompat } from "vue";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { expect } from "vitest";
import Anchor2 from "@/positioning/Anchor2";

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
  it("self message 1", async () => {
    const interaction = mountInteractionWithCode(
      "self()",
      Fixture.firstStatement,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.anchor2Origin).toStrictEqual(new Anchor2(50, 0));
  });

  it("sync message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m()",
      Fixture.firstStatement,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.anchor2Origin).toStrictEqual(new Anchor2(50, 0));
  });

  it("creation message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m() { new B }",
      Fixture.firstChild,
      _STARTER_,
    );

    const vm = interaction.vm as any;
    expect(vm.anchor2Origin).toStrictEqual(new Anchor2(50, 0));
    expect(vm.anchor2Source).toStrictEqual(new Anchor2(50, 0));
    expect(vm.anchor2Target).toStrictEqual(new Anchor2(50, 0));
  });
});

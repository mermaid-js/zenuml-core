import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import { createStore } from "vuex";
import { VueSequence } from "../../../src/index";
import Participant from "../../../src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.vue";
import { configureCompat } from "vue";

const storeConfig = VueSequence.Store();
storeConfig.state.code = "abc";
beforeEach(() => {
  configureCompat({
    RENDER_FUNCTION: false,
  });
});
afterEach(() => {
  configureCompat({ MODE: 3 });
});
const store = createStore(storeConfig);
vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(() => {
    return {
      observe() {},
      disconnect() {},
    };
  }),
);
describe("select a participant", () => {
  it("For VM and HTML and store", async () => {
    store.state.firstInvocations = {
      A: {
        top: 3,
      },
    };
    const props = { entity: { name: "A" } };
    let participantWrapper = shallowMount(Participant, {
      global: { plugins: [store] },
      props,
    });
    await participantWrapper.vm.$nextTick();
    expect(participantWrapper.vm.selected).toBeFalsy();
    expect(participantWrapper.find(".selected").exists()).toBeFalsy();

    participantWrapper.find(".participant").trigger("click");
    // TODO: we need to be able to verify that the computed property `selected` is true
    // But it seems that it does not re-evaluate the computed property in test.
    // expect(participantWrapper.vm.selected).toBeTruthy();
    expect(store.state.selected).toContain("A");
    // await participantWrapper.vm.$nextTick();
    // expect(participantWrapper.find('.selected').exists()).toBeTruthy();
    participantWrapper.find(".participant").trigger("click");
    expect(store.state.selected.includes("A")).toBeFalsy();
    expect(participantWrapper.find(".selected").exists()).toBeFalsy();
  });
});

import { shallowMount } from "@vue/test-utils";
import { configureCompat } from "vue";
import { createStore } from "vuex";
import Store from "@/store/Store";
import MessageLayer from "./MessageLayer.vue";
import Block from "./Block/Block.vue";
import { ProgContextFixture } from "../../../../parser/ContextsFixture";
const storeConfig = Store();
storeConfig.state.code = "a";
storeConfig.getters.centerOf = function () {
  return (p) => (p === "a" ? 100 : NaN);
};

const store = createStore(storeConfig);

beforeEach(() => {
  configureCompat({
    ATTR_FALSE_VALUE: false,
    RENDER_FUNCTION: false,
  });
});

describe("MessageLayer", () => {
  let messageLayerWrapper = shallowMount(MessageLayer, {
    global: {
      provide: {
        store: store,
      },
    },
    props: {
      context: ProgContextFixture("A->B.method()").block(),
    },
    components: {
      Block,
    },
  });
  it("should have a width", async () => {
    expect(messageLayerWrapper.find(".message-layer").exists()).toBeTruthy();
    // We do not need to wait until next tick in **test**.
    // await messageLayerWrapper.vm.$nextTick()
    expect(messageLayerWrapper.find(".pt-24").exists()).toBeTruthy();
  });
  it("gets participant names", async () => {
    expect(messageLayerWrapper.vm.participants.Names()[0]).toBe("a");
  });
});

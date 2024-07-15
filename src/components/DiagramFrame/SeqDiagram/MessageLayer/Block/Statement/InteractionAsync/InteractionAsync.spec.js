import { configureCompat } from "vue";
import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import Store from "@/store/Store";
import InteractionAsync from "./Interaction-async.vue";

function renderCode(code) {
  const storeConfig = Store();
  storeConfig.state.code = code;
  const store = createStore(storeConfig);
  return shallowMount(InteractionAsync, {
    global: {
      plugins: [store],
    },
    props: {
      context: store.getters.rootContext.block().stat()[0],
    },
  });
}

describe("Async Call", () => {
  beforeEach(() => {
    configureCompat({
      ATTR_FALSE_VALUE: false,
      RENDER_FUNCTION: false,
    });
  });
  // A -> B: m
  test.each([
    // A --- ?px ---> B
    ["A->B:m", "A", "B", "m", false],
    ["A->A:m", "A", "A", "m", true],
    // [ 'B:m',  'Starter', 'B', 'm', false], // Removed support of 'B:m'. This is confusing and dramatically increase parsing time (13 times slower)
  ])("code %s", function (code, source, target, message, isSelf) {
    const wrapper = renderCode(code);
    expect(wrapper.vm.source).toBe(source);
    expect(wrapper.vm.target).toBe(target);
    expect(wrapper.vm.signature).toBe(message);
    expect(wrapper.vm.isSelf).toBe(isSelf);
  });
});

import { configureCompat } from "vue";
import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import Interaction from "./Interaction.vue";
import Store from "@/store/Store";
import { ProgContextFixture } from "@/parser/ContextsFixture";

beforeEach(() => {
  configureCompat({
    ATTR_FALSE_VALUE: false,
    RENDER_FUNCTION: false,
  });
});

describe("Highlight current interact based on position of cursor", () => {
  // afterEach(() => {
  //   Vue.configureCompat({ MODE: 3 });
  // });

  test.each([
    ["A.bc", null, false],
    ["A.bc", undefined, false],
    ["A.bc", -1, false],
    ["A.bc", 0, true],
    ["A.bc", 1, true],
    ["A.bc", 2, true],
    ["A.bc", 3, true],
    ["A.bc", 4, true],
    ["A.bc", 5, false],
  ])(
    "Interaction: for code: `%s` if cursor is %s then isCurrent will be %s ",
    (code, cursor, isCurrent) => {
      configureCompat({
        RENDER_FUNCTION: false,
      });
      const storeConfig = Store();
      const store = createStore(storeConfig);
      store.state.cursor = cursor;
      store.state.code = code;
      const rootContext = store.getters.rootContext;
      const wrapper = shallowMount(Interaction, {
        global: {
          plugins: [store],
        },
        props: {
          from: "A",
          context: rootContext.block().stat()[0],
        },
      });
      expect(wrapper.vm.isCurrent).toBe(isCurrent);
    },
  );
});
describe("Interaction width", () => {
  test.each([
    // A --- ?px ---> B
    [1, 10, 25, 13],
    [1, 25, 10, 15],
  ])(
    "If selfCallIndent is %s and distance is %s, interactionWidth should be %s",
    (selfCallIndent, a, b, width) => {
      Interaction.computed.to = () => "B";
      const storeConfig = Store();
      storeConfig.getters.centerOf = () => (participant) => {
        if (participant === "A") return a;
        if (participant === "B") return b;
      };
      const store = createStore(storeConfig);
      const wrapper = shallowMount(Interaction, {
        global: {
          plugins: [store],
        },
        props: {
          selfCallIndent: selfCallIndent,
          context: ProgContextFixture("A->B.method()").block().stat()[0],
        },
      });
      expect(wrapper.vm.interactionWidth).toBe(width);
    },
  );
});

describe("Translate X", () => {
  // A          B           C
  // provided   inherited   to
  it("when left to right", function () {
    Interaction.computed.providedFrom = () => "A";
    Interaction.computed.origin = () => "B";
    Interaction.computed.to = () => "C";
    const storeConfig = Store();
    storeConfig.getters.centerOf = () => (participant) => {
      if (participant === "A") return 10;
      if (participant === "B") return 25;
      if (participant === "C") return 35;
    };

    const store = createStore(storeConfig);
    const wrapper = shallowMount(Interaction, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.vm.translateX).toBe(-15);
    expect(wrapper.find(".right-to-left").exists()).toBeFalsy();
  });

  // A      B      C
  // to   real     from
  it("when right to left", function () {
    Interaction.computed.providedFrom = () => "B";
    Interaction.computed.origin = () => "C";
    Interaction.computed.to = () => "A";
    const storeConfig = Store();
    storeConfig.getters.centerOf = () => (participant) => {
      if (participant === "A") return 10;
      if (participant === "B") return 25;
      if (participant === "C") return 35;
    };

    const store = createStore(storeConfig);
    const wrapper = shallowMount(Interaction, {
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.vm.translateX).toBe(-25);
    expect(wrapper.find(".right-to-left").exists()).toBeTruthy();
  });
});

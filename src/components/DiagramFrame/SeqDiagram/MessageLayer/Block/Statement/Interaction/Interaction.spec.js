import { configureCompat } from "vue";
import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import Interaction from "./Interaction.vue";
import Store from "@/store/Store";
import { ProgContextFixture } from "@/parser/ContextsFixture";

describe("Highlight current interact based on position of cursor", () => {
  beforeEach(() => {
    configureCompat({
      ATTR_FALSE_VALUE: false,
      RENDER_FUNCTION: false,
    });
  });
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
    [1, 10, 25, 14],
    [1, 25, 10, 14],
  ])(
    "If selfCallIndent is %s and distance is %s, interactionWidth should be %s",
    (selfCallIndent, a, b, width) => {
      Interaction.computed.target = () => "B";
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
    const storeConfig = Store();
    storeConfig.getters.centerOf = () => (participant) => {
      if (participant === "A") return 10;
      if (participant === "B") return 25;
      if (participant === "C") return 35;
    };

    const store = createStore(storeConfig);
    Interaction.computed.providedSource = () => "A";
    Interaction.computed.target = () => "C";
    const wrapper = shallowMount(Interaction, {
      props: {
        origin: "B",
      },
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
    const storeConfig = Store();
    storeConfig.getters.centerOf = () => (participant) => {
      // A B C
      // C.m { B->A.m }
      // -====A====--====B====--====C====-
      //
      if (participant === "A") return 10;
      if (participant === "B") return 25;
      if (participant === "C") return 35;
    };

    const store = createStore(storeConfig);

    Interaction.computed.providedSource = () => "B";
    Interaction.computed.target = () => "A";
    const wrapper = shallowMount(Interaction, {
      props: {
        origin: "C",
      },
      global: {
        plugins: [store],
      },
    });
    expect(wrapper.vm.translateX).toBe(-25);
    expect(wrapper.find(".right-to-left").exists()).toBeTruthy();
  });
});

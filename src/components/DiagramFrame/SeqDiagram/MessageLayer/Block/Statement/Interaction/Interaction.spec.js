import { configureCompat } from "vue";
import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import Interaction from "./Interaction.vue";
import Store from "@/store/Store";
import { ProgContextFixture } from "@/parser/ContextsFixture";
import { OCCURRENCE_BAR_SIDE_WIDTH } from "@/positioning/Constants";

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
    [10, 25, 14],
    [25, 10, 14],
  ])("If A %s, B %s, interactionWidth should be %s", (a, b, width) => {
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
        context: ProgContextFixture("A->B.method()").block().stat()[0],
      },
    });
    expect(wrapper.vm.interactionWidth).toBe(width);
  });
});

/**
 * TranslateX is decided by the following factors:
 *
 */
describe("Translate X", () => {
  // Prepare participants
  const storeConfig = Store();
  let A = 10;
  let B = 25;
  let C = 35;
  storeConfig.getters.centerOf = () => (participant) => {
    if (participant === "A") return A;
    if (participant === "B") return B;
    if (participant === "C") return C;
  };

  const store = createStore(storeConfig);

  /**
   * A B C
   * B.m {
   *   self {
   *     A->C.method
   *   }
   * }
   */
  it("Left to Right", function () {
    Interaction.computed.source = () => "A";
    Interaction.computed.target = () => "C";
    Interaction.computed.originOffset = () => OCCURRENCE_BAR_SIDE_WIDTH;
    Interaction.computed.sourceOffset = () => 0;
    Interaction.computed.targetOffset = () => 0;
    const wrapper = shallowMount(Interaction, {
      props: {
        origin: "B",
      },
      global: {
        plugins: [store],
      },
    });
    const expected = A - B - OCCURRENCE_BAR_SIDE_WIDTH;
    expect(wrapper.vm.translateX).toBe(expected);
    expect(wrapper.find(".right-to-left").exists()).toBeFalsy();
  });

  /**
   * A B C
   * C.m {
   *   self {
   *     B->A.met <---- this method
   *   }
   * }
   */
  it("Right to Left", function () {
    Interaction.computed.source = () => "B";
    Interaction.computed.target = () => "A";
    Interaction.computed.originOffset = () => OCCURRENCE_BAR_SIDE_WIDTH;
    Interaction.computed.sourceOffset = () => 0;
    Interaction.computed.targetOffset = () => 0;
    const wrapper = shallowMount(Interaction, {
      props: {
        origin: "C",
      },
      global: {
        plugins: [store],
      },
    });
    const expected = A - C - OCCURRENCE_BAR_SIDE_WIDTH;
    expect(wrapper.vm.translateX).toBe(expected);
    expect(wrapper.find(".right-to-left").exists()).toBeTruthy();
  });
});

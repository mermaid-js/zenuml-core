import { shallowMount } from "@vue/test-utils";
import { createStore } from "vuex";
import Statement from "./Statement.vue";
import { VueSequence } from "@/index";

function renderCode(code: string) {
  const storeConfig = VueSequence.Store();
  if (!storeConfig.state) return;
  // @ts-ignore
  storeConfig.state.code = code;

  // @ts-ignore
  const store = new createStore(storeConfig);
  return shallowMount(Statement, {
    global: {
      plugins: [store],
    },
    props: {
      context: store.getters.rootContext.block().stat()[0],
    },
  });
}

describe("Statement", () => {
  test.each([
    ["// comment \n A->B:m", "comment", {}, {}],
    [
      "// [red] comment \n A->B:m",
      "comment",
      { color: "red" },
      { color: "red" },
    ],
  ])("code %s", function (code, text, commentStyle, messageStyle) {
    const wrapper = renderCode(code);
    expect(wrapper?.vm.commentObj.commentStyle).toEqual(commentStyle);
    expect(wrapper?.vm.commentObj.messageStyle).toEqual(messageStyle);
    expect(wrapper?.vm.commentObj.text).toBe(text);
  });
});

import { shallowMount } from '@vue/test-utils';
import { createStore } from 'vuex';
import FragmentAlt from './FragmentAlt.vue';
import {VueSequence} from "../../../../../../../index";
vi.mock("../../../../../../../positioning/WidthProviderFunc", () => {
  return {
    default: (text) => {
      const number = parseInt(text.trim().substring(1) || '0');
      return isNaN(number) ? 0 : number;
    }
  }
});
describe('FragmentAlt', function () {
  it('get width correctly', function () {
    const storeConfig = VueSequence.Store();
    const store = createStore(storeConfig);
    // m20 will return width 20
    store.state.code = 'A.m1 { if(x) {m20}}';
    const rootContext = store.getters.rootContext;
    const wrapper = shallowMount(FragmentAlt, {
      global: {
        plugins: [store],
      },
      props: {
        context: rootContext.block().stat()[0].message().braceBlock().block().stat()[0],
      },
    });
    // 20 * 1(depth) + 30 + 30 + 20
    expect(wrapper.vm.fragmentStyle.width).toBe('100px');
  })
});

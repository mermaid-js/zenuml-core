import {mount, createLocalVue} from "@vue/test-utils";
import Vuex from 'vuex'
import {Store} from '@/index'
import LifeLine from '@/components/LifeLine'
const localVue = createLocalVue()
localVue.use(Vuex)
Store.state.code = 'abc'

const store = new Vuex.Store(Store)
describe('select a participant', () => {
  it('For VM and HTML and store', async () => {
    store.state.firstInvocations = {
      A: {
        top: 3
      }
    }
    const propsData = {entity: 'A'}
    let lifelineWrapper = mount(LifeLine, {store, localVue, propsData});
    expect(lifelineWrapper.vm.selected).toBeFalsy()
    expect(lifelineWrapper.find('.selected').exists()).toBeFalsy()

    lifelineWrapper.find('.participant').trigger('click')
    expect(lifelineWrapper.vm.selected).toBeTruthy()
    await lifelineWrapper.vm.$nextTick()
    expect(store.state.selected).toContain('A')
    expect(lifelineWrapper.find('.selected').exists()).toBeTruthy()

    lifelineWrapper.find('.participant').trigger('click')
    expect(lifelineWrapper.vm.selected).toBeFalsy()
    await lifelineWrapper.vm.$nextTick()
    expect(store.state.selected.includes('A')).toBeFalsy()
    expect(lifelineWrapper.find('.selected').exists()).toBeFalsy()
  })
})
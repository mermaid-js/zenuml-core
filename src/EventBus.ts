import Vue from "vue";
export default new Vue();

export function CustomEmit(store: any, event: string, data: any) {
  store.commit("eventEmit", { event: event, data: data });
}

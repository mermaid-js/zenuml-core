import Vue from "vue";
export default new Vue();

export function CustomEmit(store: any, event: string, data: any) {
  store.commit("eventEmit", { event: event, data: data });
}

export function TrackEvent(
  store: any,
  label: any,
  action: string,
  category: string,
) {
  store.commit("eventEmit", {
    event: "trackEvent",
    data: { label: JSON.stringify(label), action, category },
  });
}

import { createStore } from "jotai";
import { onEventEmitAtom } from "./store/Store";

type Callback = (...args: any[]) => any;
class EventEmitter {
  private events: { [key: string]: Set<Callback> } = {};

  on(event: string, callback: Callback) {
    if (!this.events[event]) {
      this.events[event] = new Set<Callback>();
    }
    this.events[event].add(callback);
  }

  off(event: string, callback: Callback) {
    this.events[event]?.delete(callback);
  }

  emit(event: string, data?: any) {
    const callbacks = this.events[event];
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

export const EventBus = new EventEmitter();

export function TrackEvent(
  store: ReturnType<typeof createStore>,
  label: any,
  action: string,
  category: string,
) {
  const trackData = { label: JSON.stringify(label), action, category };
  const onEventEmit = store.get(onEventEmitAtom);
  onEventEmit("eventEmit", { event: "trackEvent", data: trackData });
  EventBus.emit("trackEvent", trackData);
}

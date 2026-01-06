import { createStore } from "jotai";
import { onEventEmitAtom } from "./store/Store";

type Callback = (...args: any[]) => any;
class EventEmitter {
  private events: { [key: string]: Set<Callback> } = {};

  on(event: string, callback: Callback) {
    if (!this.events[event]) {
      this.events[event] = new Set<Callback>();
    }
    console.debug(`Event ${event} ${callback} added`);
    console.debug(this.events);
    this.events[event].add(callback);
  }

  off(event: string, callback: Callback) {
    console.debug(`Event ${event} ${callback} removed`);
    console.debug(this.events);
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

export function CustomEmit(store: ReturnType<typeof createStore> ,event: string, data: any) {
  const onEventEmit = store.get(onEventEmitAtom);
  onEventEmit("eventEmit", { event, data });
  EventBus.emit(event, data);
}

export function TrackEvent(store: ReturnType<typeof createStore> ,label: any, action: string, category: string) {
  const trackData = { label: JSON.stringify(label), action, category };
  const onEventEmit = store.get(onEventEmitAtom);
  onEventEmit("eventEmit", { event: "trackEvent", data: trackData });
  EventBus.emit("trackEvent", trackData);
}

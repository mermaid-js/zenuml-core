import EventEmitter from "events";
import { EventBus, CustomEmit, TrackEvent } from "./EventBus";
import { onEventEmitAtom } from "./store/Store";
import { createStore } from "jotai";

const store = createStore()

describe("EventEmitter", () => {
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
  });

  it("should allow multiple listeners for the same event", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    eventEmitter.on("multipleListeners", callback1);
    eventEmitter.on("multipleListeners", callback2);
    eventEmitter.emit("multipleListeners", "testData");
    expect(callback1).toHaveBeenCalledWith("testData");
    expect(callback2).toHaveBeenCalledWith("testData");
  });

  it("should not call listeners for unrelated events", () => {
    const callback = vi.fn();
    eventEmitter.on("event1", callback);
    eventEmitter.emit("event2", "testData");
    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle emitting events with no listeners", () => {
    expect(() => {
      eventEmitter.emit("nonexistentEvent", "testData");
    }).not.toThrow();
  });

  it("should handle removing a listener that was not added", () => {
    const callback = vi.fn();
    expect(() => {
      eventEmitter.off("nonexistentEvent", callback);
    }).not.toThrow();
  });

  it("should allow adding and removing multiple listeners", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    eventEmitter.on("multiEvent", callback1);
    eventEmitter.on("multiEvent", callback2);
    eventEmitter.off("multiEvent", callback1);
    eventEmitter.emit("multiEvent", "testData");
    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledWith("testData");
  });
});

describe("CustomEmit and TrackEvent", () => {
  beforeEach(() => {
    store.set(onEventEmitAtom, vi.fn());
    vi.spyOn(EventBus, "emit");
  });

  it("should handle CustomEmit with undefined data", () => {
    CustomEmit(store, "testEvent", undefined);
    expect(store.get(onEventEmitAtom)).toHaveBeenCalledWith("eventEmit", {
      event: "testEvent",
      data: undefined,
    });
    expect(EventBus.emit).toHaveBeenCalledWith("testEvent", undefined);
  });

  it("should handle TrackEvent with complex label object", () => {
    const complexLabel = { id: 1, name: "Test" };
    TrackEvent(store, complexLabel, "testAction", "testCategory");
    const expectedTrackData = {
      label: JSON.stringify(complexLabel),
      action: "testAction",
      category: "testCategory",
    };
    expect(store.get(onEventEmitAtom)).toHaveBeenCalledWith("eventEmit", {
      event: "trackEvent",
      data: expectedTrackData,
    });
    expect(EventBus.emit).toHaveBeenCalledWith("trackEvent", expectedTrackData);
  });
});

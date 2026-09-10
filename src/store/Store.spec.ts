import { createStore } from "jotai";
import { modeAtom, RenderMode } from "./Store";

const store = createStore();

describe("Store", () => {
  it("should create an instance", () => {
    expect(store.get(modeAtom)).toBe(RenderMode.Dynamic);
  });
});

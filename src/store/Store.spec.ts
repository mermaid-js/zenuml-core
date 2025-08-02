import { createStore } from "jotai";
import { showTipsAtom } from "./Store";

const store = createStore();

describe("Store", () => {
  it("should create an instance", () => {
    expect(store.get(showTipsAtom)).toBeDefined();
    expect(store.get(showTipsAtom)).toBeFalsy();
  });
});

import store, { showTipsAtom } from "./Store";

describe("Store", () => {
  it("should create an instance", () => {
    expect(store.get(showTipsAtom)).toBeDefined();
    expect(store.get(showTipsAtom)).toBeFalsy();
  });
});

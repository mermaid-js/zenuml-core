import { describe, expect, it } from "vitest";
import {
  clearCache,
  clearPersistentCache,
  getCache,
  setCache,
} from "./RenderingCache";

describe("RenderingCache", () => {
  it("returns null for a key that was never set", () => {
    clearCache();
    clearPersistentCache();
    expect(getCache("absent")).toBeNull();
    expect(getCache(undefined)).toBeNull();
  });

  it("keeps a non-persisted value only until the next clearCache", () => {
    clearCache();
    clearPersistentCache();
    setCache("per-render", 42);
    expect(getCache("per-render")).toBe(42);

    clearCache();
    expect(getCache("per-render")).toBeNull();
  });

  it("keeps a persisted value across clearCache", () => {
    // ZenUml.doRender calls clearCache() before every render, so persisted
    // width measurements must survive it — that is what makes a re-render
    // cheap.
    clearCache();
    clearPersistentCache();
    setCache("width", 120, true);

    clearCache();
    expect(getCache("width")).toBe(120);
  });

  it("drops persisted values on clearPersistentCache", () => {
    clearCache();
    clearPersistentCache();
    setCache("width", 120, true);

    clearPersistentCache();
    expect(getCache("width")).toBeNull();
  });

  it("distinguishes a cached 0 from a missing key", () => {
    clearCache();
    clearPersistentCache();
    setCache("zero", 0, true);
    expect(getCache("zero")).toBe(0);
  });
});

import ZenUml, { VueSequence } from "./core";

vi.stubGlobal(
  "IntersectionObserver",
  vi.fn(() => {
    return {
      observe() {},
      disconnect() {},
    };
  }),
);
describe("@ZenUML/core", function () {
  it("should render and cache the code and theme", async () => {
    const el = document.createElement("div");
    const zenUml = new ZenUml(el);
    expect(zenUml).toBeInstanceOf(ZenUml);
    expect(
      await zenUml.render("A.method", { theme: "theme-blue" }),
    ).toBeInstanceOf(ZenUml);
    expect(zenUml.code).toBe("A.method");
    expect(zenUml.theme).toBe("theme-blue");
    await zenUml.render("B.method", { theme: "theme-red" });
    expect(zenUml.code).toBe("B.method");
    expect(zenUml.theme).toBe("theme-red");
    await zenUml.render("C.method", undefined);
    expect(zenUml.code).toBe("C.method");
    expect(zenUml.theme).toBe("theme-red");
    await zenUml.render(undefined, { theme: "theme-green" });
    expect(zenUml.code).toBe("C.method");
    expect(zenUml.theme).toBe("theme-green");
  });
});

describe("VueSequence", () => {
  it("should export a VueSequence", () => {
    expect(VueSequence).toBeDefined();
  });
});

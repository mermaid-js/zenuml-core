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
  let hiddenDiv: HTMLDivElement;

  beforeEach(() => {
    // Create the hidden div before each test
    hiddenDiv = document.createElement("div");
    hiddenDiv.className = "textarea-hidden-div";
    hiddenDiv.style.fontSize = "1rem";
    hiddenDiv.style.fontFamily = "Helvetica, Verdana, serif";
    hiddenDiv.style.display = "inline";
    hiddenDiv.style.whiteSpace = "nowrap";
    hiddenDiv.style.visibility = "hidden";
    hiddenDiv.style.position = "absolute";
    hiddenDiv.style.top = "0";
    hiddenDiv.style.left = "0";
    hiddenDiv.style.overflow = "hidden";
    hiddenDiv.style.width = "0px";
    hiddenDiv.style.paddingLeft = "0px";
    hiddenDiv.style.paddingRight = "0px";
    hiddenDiv.style.margin = "0px";
    hiddenDiv.style.border = "0px";
    document.body.appendChild(hiddenDiv);
  });

  afterEach(() => {
    // Clean up after each test
    document.body.innerHTML = "";
    // Clear the cache to prevent test interference
    vi.clearAllMocks();
    // You might need to clear your rendering cache here too
  });

  it("should render and cache the code and theme", async () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    const zenUml = new ZenUml(el);

    // Wrap each render in a try-catch for debugging
    try {
      await zenUml.render("A.method", { theme: "theme-blue" });
      expect(zenUml).toBeInstanceOf(ZenUml);
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
    } catch (error) {
      console.error("Test failed:", error);
      throw error;
    }
  });
});
describe("VueSequence", () => {
  it("should export a VueSequence", () => {
    expect(VueSequence).toBeDefined();
  });
});

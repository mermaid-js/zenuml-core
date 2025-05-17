import store, { codeAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { MessageLayer } from "./MessageLayer";

store.set(codeAtom, "a");

describe("MessageLayer", () => {
  const messageLayer = render(<MessageLayer context={null} />);
  it("should have a width", async () => {
    expect(
      messageLayer.container.querySelector(".your-class-name"),
    ).toBeInTheDocument();
    // We do not need to wait until next tick in **test**.
    // await messageLayerWrapper.vm.$nextTick()
    expect(messageLayer.container.querySelector(".pt-24")).toBeInTheDocument();
  });
  it("gets participant names", async () => {
    expect(
      messageLayer.container.querySelector('[data-origin="_STARTER_"]'),
    ).toBe("_STARTER_");
  });
});

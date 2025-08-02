import store, { codeAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { MessageLayer } from "./MessageLayer";

store.set(codeAtom, "a");

describe("MessageLayer", () => {
  let messageLayer: ReturnType<typeof render>;

  beforeEach(() => {
    messageLayer = render(<MessageLayer context={null} />);
  });

  it("should have a width", async () => {
    expect(messageLayer.container.querySelector(".message-layer")).toBeTruthy();
    // We do not need to wait until next tick in **test**.
    // await messageLayerWrapper.vm.$nextTick()
    expect(messageLayer.container.querySelector(".pt-20")).toBeTruthy();
  });
  it("gets participant names", async () => {
    expect(
      messageLayer.container.querySelector('[data-origin="_STARTER_"]'),
    ).toBeTruthy();
  });
});

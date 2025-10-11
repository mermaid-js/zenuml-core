import { codeAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { MessageLayer } from "./MessageLayer";
import { createStore } from "jotai";

const store = createStore();

store.set(codeAtom, "a");

describe("MessageLayer", () => {
  let messageLayer: ReturnType<typeof render>;

  beforeEach(() => {
    messageLayer = render(<MessageLayer />);
  });

  it("should have a width", async () => {
    expect(messageLayer.container.querySelector(".message-layer")).toBeTruthy();
    // We do not need to wait until next tick in **test**.
    // await messageLayerWrapper.vm.$nextTick()
    expect(messageLayer.container.querySelector(".pt-14")).toBeTruthy();
  });
});

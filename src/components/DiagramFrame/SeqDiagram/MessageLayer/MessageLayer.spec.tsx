import {
  codeAtom,
  participantMessagesAtom,
  rootContextAtom,
} from "@/store/Store";
import { render, waitFor } from "@testing-library/react";
import { MessageLayer } from "./MessageLayer";
import { Provider, createStore } from "jotai";

const store = createStore();

const renderLayer = (code: string) => {
  store.set(codeAtom, code);
  store.set(participantMessagesAtom, {});
  const context = store.get(rootContextAtom)?.block() ?? null;
  return render(
    <Provider store={store}>
      <MessageLayer context={context} />
    </Provider>,
  );
};

describe("MessageLayer", () => {
  it("should have a width", async () => {
    const messageLayer = renderLayer("A.m()");
    expect(messageLayer.container.querySelector(".message-layer")).toBeTruthy();
    // We do not need to wait until next tick in **test**.
    // await messageLayerWrapper.vm.$nextTick()
    expect(messageLayer.container.querySelector(".pt-14")).toBeTruthy();
  });
  it("gets participant names", async () => {
    const messageLayer = renderLayer("A.m()");
    expect(
      messageLayer.container.querySelector('[data-origin="_STARTER_"]'),
    ).toBeTruthy();
  });

  it("records participant messages with calculated positions", async () => {
    const code = `@Starter(M)
A->B.call() {
  c = new C()
  C.notify()
  C->B: ack
  return done
}`;

    renderLayer(code);

    await waitFor(() => {
      const messages = store.get(participantMessagesAtom);

      expect(Object.keys(messages).sort()).toEqual(["A", "B", "C", "c:C"]);

      const participantB = messages["B"];
      expect(participantB.map((m) => m.type)).toEqual(["sync", "async"]);
      expect(participantB[0].top).toBeLessThan(participantB[1].top);

      const createdParticipant = messages["c:C"];
      expect(createdParticipant).toHaveLength(1);
      expect(createdParticipant[0].type).toBe("creation");

      const participantC = messages["C"];
      expect(participantC.map((m) => m.type)).toEqual(["sync"]);

      const participantA = messages["A"];
      expect(participantA).toHaveLength(1);
      expect(participantA[0].type).toBe("return");
    });
  });
});

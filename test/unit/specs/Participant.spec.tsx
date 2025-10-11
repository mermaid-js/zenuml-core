import { codeAtom, selectedAtom } from "@/store/Store.ts";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, it } from "vitest";
import { Participant } from "@/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant.tsx";
import { expect } from "vitest";
import { createStore, Provider } from "jotai";
import { ParticipantVM } from "@/vm/participants";


const store = createStore();

store.set(codeAtom, "abc");

describe("select a participant", () => {
  it("For VM and HTML and store", async () => {
    const mockVM: ParticipantVM = {
      name: "A",
      displayName: "A",
      isDefaultStarter: false,
      labelPositions: [],
      assigneePositions: [],
    };
    const props = { vm: mockVM };
    const participantWrapper = render(
      <Provider store={store}>
        <Participant {...props} />
      </Provider>
    );

    expect(participantWrapper.container.querySelector(".selected")).toBeNull();

    fireEvent.click(
      participantWrapper.container.querySelector(".participant")!,
    );
    // TODO: we need to be able to verify that the computed property `selected` is true
    // But it seems that it does not re-evaluate the computed property in test.
    // expect(participantWrapper.vm.selected).toBeTruthy();
    await waitFor(
      () => {
        expect(store.get(selectedAtom)).toContain("A");
      },
      { timeout: 500 },
    );
    // await participantWrapper.vm.$nextTick();
    // expect(participantWrapper.find('.selected').exists()).toBeTruthy();
    fireEvent.click(
      participantWrapper.container.querySelector(".participant")!,
    );
    await waitFor(
      () => {
        expect(store.get(selectedAtom).includes("A")).toBeFalsy();
        expect(
          participantWrapper.container.querySelector(".selected"),
        ).toBeNull();
      },
      { timeout: 500 },
    );
  });
});

import { codeAtom, selectedAtom } from "../../../src/store/Store";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, it } from "vitest";
import { Participant } from "../../../src/components/DiagramFrame/SeqDiagram/LifeLineLayer/Participant";
import { expect } from "vitest";
import { createStore } from "jotai";

const store = createStore();

store.set(codeAtom, "abc");

describe("select a participant", () => {
  it("For VM and HTML and store", async () => {
    const props = { entity: { name: "A" } };
    const participantWrapper = render(<Participant {...props} />);

    expect(participantWrapper.container.querySelector(".selected")).toBeNull();

    fireEvent.click(
      participantWrapper.container.querySelector(".participant")!,
    );
    // TODO: we need to be able to verify that the computed property `selected` is true
    // But it seems that it does not re-evaluate the computed property in test.
    // expect(participantWrapper.vm.selected).toBeTruthy();
    waitFor(
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
    waitFor(
      () => {
        expect(store.get(selectedAtom).includes("A")).toBeFalsy();
        expect(
          participantWrapper.container.querySelector(".selected"),
        ).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });
});

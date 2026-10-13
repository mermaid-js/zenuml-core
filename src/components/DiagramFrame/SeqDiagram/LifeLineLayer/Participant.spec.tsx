import { participantPreviewAtom } from "@/store/Store";
import { act, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { Participant } from "./Participant";

const DEEP_BLUE = "#1d4ed8";

const renderParticipant = (entity: Record<string, string>) => {
  const store = createStore();
  const utils = render(
    <Provider store={store}>
      <Participant entity={entity} />
    </Provider>,
  );
  const box = () => utils.container.querySelector<HTMLElement>(".participant")!;
  return { store, box };
};

describe("Participant preview", () => {
  it("shows the preview colour and matching text colour for this name", () => {
    const { store, box } = renderParticipant({ name: "A" });
    expect(box().style.backgroundColor).toBe("");

    act(() => {
      store.set(participantPreviewAtom, { name: "A", color: DEEP_BLUE });
    });

    expect(box().style.backgroundColor).toBe("rgb(29, 78, 216)");
    expect(box().style.color).toBe("#fff");
  });

  it("leaves the box unchanged when the preview is for another name", () => {
    const { store, box } = renderParticipant({ name: "A" });
    act(() => {
      store.set(participantPreviewAtom, { name: "B", color: DEEP_BLUE });
    });
    expect(box().style.backgroundColor).toBe("");
    expect(box().style.color).toBe("");
  });

  it("falls back to the entity colour when the preview has no colour", () => {
    const { store, box } = renderParticipant({ name: "A", color: "#fda4af" });
    act(() => {
      store.set(participantPreviewAtom, { name: "A", type: "Database" });
    });
    expect(box().style.backgroundColor).toBe("rgb(253, 164, 175)");
    expect(box().style.color).toBe("#000");
  });
});

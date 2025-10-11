import { render, waitFor } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { LifeLine } from "./LifeLine";
import { coordinatesAtom, participantMessagesAtom } from "@/store/Store";
import {
  CREATION_LIFELINE_OFFSET,
  PARTICIPANT_TOP_SPACE_FOR_GROUP,
} from "@/positioning/Constants";

const createCoordinatesStub = (positions: Record<string, number>) => ({
  getPosition(participant: string) {
    return positions[participant] ?? 0;
  },
});

const renderLifeLine = (participantMessages: any, participant = "B") => {
  const store = createStore();
  const coordinates = createCoordinatesStub({ [participant]: 0 });

  try {
    store.set(coordinatesAtom as any, coordinates as any);
  } catch (error) {
    // Derived atom cannot be set; tests only need stable return value
  }
  store.set(participantMessagesAtom, participantMessages);
  return render(
    <Provider store={store}>
      <LifeLine
        entity={{ name: participant, type: "participant" }}
        renderParticipants={false}
        renderLifeLine
      />
    </Provider>,
  );
};

describe("LifeLine", () => {
  it("defaults to participant top space without messages", () => {
    const wrapper = renderLifeLine({});
    const lifeline = wrapper.container.querySelector(".lifeline") as HTMLElement;
    expect(lifeline.style.paddingTop).toBe(
      `${PARTICIPANT_TOP_SPACE_FOR_GROUP}px`,
    );
  });

  it("offsets top for creation messages", async () => {
    const wrapper = renderLifeLine({
      B: [
        {
          id: "B-1",
          type: "creation",
          top: 48,
        },
      ],
    });

    await waitFor(() => {
      const lifeline = wrapper.container.querySelector(
        ".lifeline",
      ) as HTMLElement;
      expect(lifeline.style.paddingTop).toBe(
        `${48 + CREATION_LIFELINE_OFFSET}px`,
      );
    });
  });

  it("does not offset when first message is not creation", async () => {
    const wrapper = renderLifeLine({
      B: [
        {
          id: "B-1",
          type: "sync",
          top: 60,
        },
      ],
    });

    await waitFor(() => {
      const lifeline = wrapper.container.querySelector(
        ".lifeline",
      ) as HTMLElement;
      expect(lifeline.style.paddingTop).toBe(
        `${PARTICIPANT_TOP_SPACE_FOR_GROUP}px`,
      );
    });
  });
});

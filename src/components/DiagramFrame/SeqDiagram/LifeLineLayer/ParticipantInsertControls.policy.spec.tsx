import {
  activeTextEditorsAtom,
  codeAtom,
  enableParticipantInsertionAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
  selectedMessageAtom,
} from "@/store/Store";
import { enterMenuAtom } from "@/store/interaction/interactionAtom";
import { act, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { ParticipantInsertControls } from "./ParticipantInsertControls";

const renderControls = () => {
  const store = createStore();
  store.set(codeAtom, "A\nB\nA->B: hi");
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(enableParticipantInsertionAtom, true);
  const view = render(
    <Provider store={store}>
      <ParticipantInsertControls />
    </Provider>,
  );
  const hasAppend = () => !!view.queryByTestId("participant-append-button");
  return { store, hasAppend };
};

describe("ParticipantInsertControls interaction policy", () => {
  it("offers insert buttons while a message is selected with its menu closed", () => {
    const { store, hasAppend } = renderControls();
    act(() => {
      store.set(selectedMessageAtom, { start: 1, end: 2, token: 1 });
    });
    expect(hasAppend()).toBe(true);
  });

  // P4: the controls ask only `useCan("insertParticipant")`. A highlighted
  // participant with the editor off is not an interaction state.
  it("offers insert buttons while a participant is highlighted with the editor off", () => {
    const { store, hasAppend } = renderControls();
    act(() => {
      store.set(selectedAtom, ["A"]);
    });
    expect(hasAppend()).toBe(true);
  });

  it("hides insert buttons while the participant editor is open", () => {
    const { store, hasAppend } = renderControls();
    act(() => {
      store.set(enableParticipantStyleEditingAtom, true);
      store.set(selectedAtom, ["A"]);
    });
    expect(hasAppend()).toBe(false);
  });

  it("hides insert buttons while a label is being edited", () => {
    const { store, hasAppend } = renderControls();
    act(() => {
      store.set(activeTextEditorsAtom, new Set([Symbol("label")]));
    });
    expect(hasAppend()).toBe(false);
  });

  it("hides insert buttons in a static render", () => {
    const { store, hasAppend } = renderControls();
    act(() => {
      store.set(modeAtom, RenderMode.Static);
    });
    expect(hasAppend()).toBe(false);
  });

  it("hides insert buttons while the message menu is open", () => {
    const { store, hasAppend } = renderControls();
    act(() => {
      store.set(enterMenuAtom, { kind: "messageMenu", start: 1, end: 2 });
    });
    expect(hasAppend()).toBe(false);
  });
});

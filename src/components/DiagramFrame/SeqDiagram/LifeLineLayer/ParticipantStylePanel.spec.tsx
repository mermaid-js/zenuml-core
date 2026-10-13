import {
  codeAtom,
  diagramElementAtom,
  enableParticipantStyleEditingAtom,
  selectedAtom,
} from "@/store/Store";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { afterEach, describe, expect, it } from "vitest";
import { ParticipantStylePanel } from "./ParticipantStylePanel";

const setup = () => {
  const diagram = document.createElement("div");
  diagram.innerHTML =
    '<div class="participant" data-participant-id="A">A</div>' +
    '<div class="participant" data-participant-id="C">C</div>' +
    '<button id="other">other</button>';
  document.body.appendChild(diagram);
  const store = createStore();
  store.set(codeAtom, "A->C: Ping");
  store.set(enableParticipantStyleEditingAtom, true);
  store.set(diagramElementAtom, diagram);
  store.set(selectedAtom, ["A"]);
  const view = render(
    <Provider store={store}>
      <ParticipantStylePanel />
    </Provider>,
  );
  return {
    store,
    view,
    diagram,
    c: diagram.querySelector('[data-participant-id="C"]') as HTMLElement,
    other: diagram.querySelector("#other") as HTMLElement,
  };
};

// A click on an unrelated element must never be swallowed by leftovers of an
// abandoned participant click.
const clickIsNotPrevented = (other: HTMLElement) =>
  fireEvent.click(other, { cancelable: true });

describe("ParticipantStylePanel pending reselect cleanup", () => {
  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  it("leaves later clicks alone after Escape", () => {
    const { c, other, store } = setup();
    fireEvent.pointerDown(c);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.pointerUp(c);
    expect(clickIsNotPrevented(other)).toBe(true);
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("leaves later clicks alone after pointercancel", () => {
    const { c, other, store } = setup();
    fireEvent.pointerDown(c);
    fireEvent.pointerCancel(c);
    fireEvent.pointerUp(c);
    expect(clickIsNotPrevented(other)).toBe(true);
    expect(store.get(selectedAtom)).toEqual([]);
  });

  it("leaves later clicks alone after unmount and never reselects", () => {
    const { c, other, store, view } = setup();
    fireEvent.pointerDown(c);
    view.unmount();
    act(() => {
      fireEvent.pointerUp(c);
    });
    expect(clickIsNotPrevented(other)).toBe(true);
    expect(store.get(selectedAtom)).toEqual([]);
  });
});

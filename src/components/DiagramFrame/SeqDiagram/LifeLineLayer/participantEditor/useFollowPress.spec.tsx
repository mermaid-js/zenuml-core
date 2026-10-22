import { act, fireEvent, renderHook } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { exitListenersOf } from "@/store/interaction/useInteractionExit";
import type { InteractionState } from "@/store/interaction/policy";
import { useFollowPress } from "./useFollowPress";

type Props = {
  isOpen: boolean;
  participantName: string | null;
  selected: string[];
};

const EDITOR: InteractionState = {
  kind: "participantEditor",
  participant: "A",
};

const setup = (
  initialProps: Props = {
    isOpen: true,
    participantName: "A",
    selected: ["A"],
  },
) => {
  const diagram = document.createElement("div");
  diagram.innerHTML =
    '<div class="participant" data-participant-id="A">A</div>' +
    '<div class="participant" data-participant-id="C"><span>C</span></div>';
  document.body.appendChild(diagram);
  const outside = document.createElement("button");
  document.body.appendChild(outside);
  const store = createStore();
  const setSelected = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const view = renderHook(
    (props: Props) =>
      useFollowPress({ diagramElement: diagram, setSelected, ...props }),
    { initialProps, wrapper },
  );
  const nodeOf = (id: string) =>
    diagram.querySelector(`[data-participant-id="${id}"]`) as HTMLElement;
  // A commit re-renders the diagram and replaces the participant's node.
  const replace = (id: string) => {
    const old = nodeOf(id);
    const next = old.cloneNode(true) as HTMLElement;
    old.replaceWith(next);
    return next;
  };
  const exit = (state: InteractionState, target: Element | null) =>
    exitListenersOf(store).forEach((listener) =>
      listener(state, { type: "press", target }),
    );
  return { view, diagram, outside, setSelected, nodeOf, replace, exit, store };
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("useFollowPress", () => {
  it("setSelected forwards the selection", () => {
    const { view, setSelected } = setup();
    act(() => view.result.current.setSelected(["C"]));
    expect(setSelected).toHaveBeenCalledWith(["C"]);
  });

  describe("press on another participant while the editor is open", () => {
    it("selects the participant on pointerup when its node was replaced", () => {
      const { setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("C").firstElementChild!);
      replace("C");
      fireEvent.pointerUp(document);
      expect(setSelected).toHaveBeenCalledWith(["C"]);
    });

    it("leaves a surviving node to its own click", () => {
      const { setSelected, nodeOf } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("follows only one press", () => {
      const { setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      replace("C");
      fireEvent.pointerUp(document);
      fireEvent.pointerUp(document);
      expect(setSelected).toHaveBeenCalledTimes(1);
    });

    it("does nothing when the participant is gone", () => {
      const { setSelected, nodeOf } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      nodeOf("C").remove();
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("does nothing when the participant is already selected", () => {
      const { view, setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      view.rerender({ isOpen: true, participantName: "C", selected: ["C"] });
      replace("C");
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("ignores a press on the participant being edited", () => {
      const { setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("A"));
      replace("A");
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("is not followed while the editor is closed", () => {
      const { setSelected, nodeOf, replace } = setup({
        isOpen: false,
        participantName: "A",
        selected: ["A"],
      });
      fireEvent.pointerDown(nodeOf("C"));
      replace("C");
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it.each([
      ["Escape", () => fireEvent.keyDown(document, { key: "Escape" })],
      ["pointercancel", () => fireEvent.pointerCancel(document)],
    ])("is cancelled by %s", (_, cancel) => {
      const { setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      replace("C");
      cancel();
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("is cancelled by a later setSelected", () => {
      const { view, setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      replace("C");
      act(() => view.result.current.setSelected([]));
      fireEvent.pointerUp(document);
      expect(setSelected).toHaveBeenCalledTimes(1);
      expect(setSelected).toHaveBeenCalledWith([]);
    });

    it("is cancelled on unmount", () => {
      const { view, setSelected, nodeOf, replace } = setup();
      fireEvent.pointerDown(nodeOf("C"));
      replace("C");
      view.unmount();
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });
  });

  describe("the participant editor's exit", () => {
    it("follows a press that exits the editor on a participant", () => {
      const { setSelected, nodeOf, replace, exit } = setup({
        isOpen: false,
        participantName: "A",
        selected: [],
      });
      const target = nodeOf("C");
      exit(EDITOR, target);
      replace("C");
      fireEvent.pointerUp(document);
      expect(setSelected).toHaveBeenCalledWith(["C"]);
    });

    it("ignores a press that exits elsewhere", () => {
      const { setSelected, outside, exit } = setup();
      exit(EDITOR, outside);
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("ignores the exit of another state", () => {
      const { setSelected, nodeOf, replace, exit } = setup({
        isOpen: false,
        participantName: null,
        selected: [],
      });
      exit({ kind: "gapMenu", id: "g" }, nodeOf("C"));
      replace("C");
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("ignores an Escape exit", () => {
      const { setSelected, store } = setup();
      exitListenersOf(store).forEach((listener) =>
        listener(EDITOR, { type: "escape" }),
      );
      fireEvent.pointerUp(document);
      expect(setSelected).not.toHaveBeenCalled();
    });

    it("unregisters its exit listener on unmount", () => {
      const { view, store } = setup();
      expect(exitListenersOf(store).size).toBe(1);
      view.unmount();
      expect(exitListenersOf(store).size).toBe(0);
    });
  });
});

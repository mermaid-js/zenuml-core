import {
  createMessageDragAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
} from "@/store/Store";
import { act, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { mock } from "bun:test";
import { describe, expect, it, vi } from "vitest";

// Bun's module mocks are process-wide and another spec replaces Icons with a
// null component. Pin a clickable stand-in so this spec does not depend on
// test order.
mock.module("@/components/Icon/Icons", () => ({
  default: (props: { className?: string; onClick?: () => void }) => (
    <span className={props.className} onClick={props.onClick} />
  ),
}));

const { CollapseButton } = await import("./CollapseButton");

const renderButton = (
  setup?: (store: ReturnType<typeof createStore>) => void,
) => {
  const store = createStore();
  store.set(enableParticipantStyleEditingAtom, true);
  setup?.(store);
  const onClick = vi.fn();
  const view = render(
    <Provider store={store}>
      <CollapseButton label="alt" collapsed onClick={onClick} />
    </Provider>,
  );
  const icon = view.container.querySelector(
    ".collapsible-header > :last-child",
  )!;
  return { onClick, icon, view };
};

describe("Fragment CollapseButton interaction policy", () => {
  it("toggles on click when idle", () => {
    const { onClick, icon } = renderButton();
    act(() => {
      fireEvent.click(icon);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("keeps working in RenderMode.Static (collapse is view-only)", () => {
    const { onClick, icon } = renderButton((store) =>
      store.set(modeAtom, RenderMode.Static),
    );
    act(() => {
      fireEvent.click(icon);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does nothing while the participant editor is open", () => {
    const { onClick, icon, view } = renderButton((store) =>
      store.set(selectedAtom, ["A"]),
    );
    act(() => {
      fireEvent.click(icon);
    });
    expect(onClick).not.toHaveBeenCalled();
    expect(view.getByText("alt")).toBeTruthy();
  });

  it("ignores a click whose press started while the editor was open", () => {
    // Browser order: pointerdown closes the editor (click-away), then click
    // fires on the button. The press, not the click, decides.
    let store!: ReturnType<typeof createStore>;
    const { onClick, icon } = renderButton((s) => {
      store = s;
      s.set(selectedAtom, ["A"]);
    });
    act(() => {
      fireEvent.pointerDown(icon);
    });
    act(() => {
      store.set(selectedAtom, []);
    });
    act(() => {
      fireEvent.click(icon);
    });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("does nothing while a create-message drag runs", () => {
    const { onClick, icon } = renderButton((store) =>
      store.set(createMessageDragAtom, {
        source: "A",
        sourceX: 0,
        sourceY: 0,
        pointerX: 0,
        pointerY: 0,
        hoverTarget: null,
        insertIndex: 0,
        blockContext: null,
      }),
    );
    act(() => {
      fireEvent.click(icon);
    });
    expect(onClick).not.toHaveBeenCalled();
  });
});

import { RootContext } from "@/parser";
import {
  codeAtom,
  diagramElementAtom,
  modeAtom,
  onMessageClickAtom,
  RenderMode,
  selectedMessageAtom,
} from "@/store/Store";
import {
  enterMenuAtom,
  interactionAtom,
} from "@/store/interaction/interactionAtom";
import { act, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { StylePanel } from "./StylePanel";

const CODE = "A\nB\nA->B.hello()";

const renderPanel = () => {
  const store = createStore();
  store.set(codeAtom, CODE);
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(diagramElementAtom, document.body);
  const view = render(
    <Provider store={store}>
      <div className="interaction sync" data-source="A" data-target="B">
        <div className="message" data-testid="message" />
      </div>
      <StylePanel />
    </Provider>,
  );
  const openMenu = async () => {
    const context = RootContext(CODE)?.block()?.stat()[0]?.message();
    await act(async () => {
      store.get(onMessageClickAtom)(context, view.getByTestId("message"));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };
  const menuShown = () => !!view.queryByLabelText("bold");
  return { store, view, openMenu, menuShown };
};

describe("StylePanel open state lives in the interaction state (P2)", () => {
  it("enters messageMenu when the menu opens", async () => {
    const { store, openMenu, menuShown } = renderPanel();
    await openMenu();
    expect(menuShown()).toBe(true);
    expect(store.get(interactionAtom).kind).toBe("messageMenu");
  });

  it("returns to idle when a style is applied, although the message stays selected", async () => {
    const { store, view, openMenu, menuShown } = renderPanel();
    await openMenu();
    act(() => {
      fireEvent.click(view.getByLabelText("bold"));
    });
    expect(menuShown()).toBe(false);
    expect(store.get(selectedMessageAtom)).not.toBeNull();
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("returns to idle on Escape", async () => {
    const { store, openMenu } = renderPanel();
    await openMenu();
    act(() => {
      fireEvent.keyDown(window, { key: "Escape" });
    });
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("closes when another primary state is entered (R1)", async () => {
    const { store, openMenu, menuShown } = renderPanel();
    await openMenu();
    act(() => {
      store.set(enterMenuAtom, { kind: "gapMenu", id: "g1" });
    });
    expect(menuShown()).toBe(false);
  });
});

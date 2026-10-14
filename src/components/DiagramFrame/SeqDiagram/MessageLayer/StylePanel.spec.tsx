import { RootContext } from "@/parser";
import {
  codeAtom,
  diagramElementAtom,
  enableMessageReorderAtom,
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
import { Block } from "./Block/Block";
import { StylePanel } from "./StylePanel";
import { InteractionController } from "@/store/interaction/InteractionController";

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
      <InteractionController />
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
      fireEvent.keyDown(document, { key: "Escape" });
    });
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("closes and clears the selection on a press elsewhere (P3)", async () => {
    const { store, openMenu, menuShown } = renderPanel();
    await openMenu();
    act(() => {
      fireEvent.pointerDown(document.body);
    });
    expect(menuShown()).toBe(false);
    expect(store.get(selectedMessageAtom)).toBeNull();
    expect(store.get(interactionAtom).kind).toBe("idle");
  });

  it("closes but keeps the selection on a press on the selected message (P3)", async () => {
    const { store, view, openMenu } = renderPanel();
    await openMenu();
    const message = view.getByTestId("message");
    message.setAttribute("data-selected", "true");
    act(() => {
      fireEvent.pointerDown(message);
    });
    expect(store.get(interactionAtom).kind).toBe("idle");
    expect(store.get(selectedMessageAtom)).not.toBeNull();
  });

  it("stays open on a press inside the menu (P3)", async () => {
    const { store, view, openMenu } = renderPanel();
    await openMenu();
    act(() => {
      fireEvent.pointerDown(view.getByLabelText("bold"));
    });
    expect(store.get(interactionAtom).kind).toBe("messageMenu");
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

describe("the open menu keeps its own message's reorder handle (P2)", () => {
  const cases: Array<[string, string]> = [
    ["sync", "A\nB\nA->B.hello()\nA->B.other()"],
    ["async", "A\nB\nA->B: hello\nA->B: other"],
    ["self", "A\nB\nA->B.hello()\nA->A.self()"],
    ["creation", "A\nA->B.hello()\nA->b:B.new()"],
    ["return", "A\nB\nA->B.hello()\nB-->A: back"],
  ];

  it.each(cases)("%s message", async (_name, code) => {
    const store = createStore();
    store.set(codeAtom, code);
    store.set(modeAtom, RenderMode.Dynamic);
    store.set(enableMessageReorderAtom, true);
    store.set(diagramElementAtom, document.body);
    const root = RootContext(code);
    const view = render(
      <Provider store={store}>
        <Block context={root?.block()} isRoot />
        <StylePanel />
      </Provider>,
    );
    // An earlier spec may have armed the reorder handle's click suppressor.
    document.body.click();
    const rows = view.container.querySelectorAll(".statement-container");
    const row = rows[rows.length - 1];
    expect(!!row.querySelector(".message-reorder-handle")).toBe(true);
    await act(async () => {
      fireEvent.click(row.querySelector(".message")!);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(store.get(interactionAtom).kind).toBe("messageMenu");
    expect(!!row.querySelector(".message-reorder-handle")).toBe(true);
    expect(!!rows[0].querySelector(".message-reorder-handle")).toBe(false);
  });
});

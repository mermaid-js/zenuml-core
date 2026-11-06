import { RootContext } from "@/parser";
import {
  codeAtom,
  createMessageDragAtom,
  diagramElementAtom,
  enableDividerInsertionAtom,
  enableMessageInsertionAtom,
  enableMessageReorderAtom,
  enableParticipantInsertionAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  onEventEmitAtom,
  RenderMode,
  selectedAtom,
} from "@/store/Store";
import { InteractionController } from "@/store/interaction/InteractionController";
import { DiagramTitle } from "@/components/DiagramFrame/DiagramTitle";
import { EmptyDiagramPrompt } from "@/components/DiagramFrame/SeqDiagram/EmptyDiagramPrompt";
import { MessageCreateControls } from "@/components/DiagramFrame/SeqDiagram/LifeLineLayer/MessageCreateControls";
import { ParticipantInsertControls } from "@/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantInsertControls";
import { ParticipantLabel } from "@/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantLabel";
import { ParticipantStylePanel } from "@/components/DiagramFrame/SeqDiagram/LifeLineLayer/ParticipantStylePanel";
import { Block } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Block";
import { ConditionLabel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/Fragment/ConditionLabel";
import { MessageLabel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/MessageLabel";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./trackEvent";

/**
 * `Config.onEventEmit` contract: each completed in-diagram edit reaches the
 * host once as `("trackEvent", { label, action, category: "sequence" })`.
 * That flat shape is what conf-app's `Sequence.vue` filters on.
 */

type Store = ReturnType<typeof createStore>;

const setupStore = (code: string, prepare?: (store: Store) => void) => {
  const store = createStore();
  store.set(codeAtom, code);
  store.set(modeAtom, RenderMode.Dynamic);
  const onEventEmit = vi.fn();
  store.set(onEventEmitAtom, onEventEmit);
  prepare?.(store);
  return { store, onEventEmit };
};

const mount = (store: Store, ui: ReactNode) =>
  render(<Provider store={store}>{ui}</Provider>);

const editSpan = (span: HTMLElement, text: string) => {
  act(() => {
    fireEvent.click(span);
  });
  span.innerText = text;
  act(() => {
    fireEvent.blur(span);
  });
};

const expectTracked = (
  onEventEmit: ReturnType<typeof vi.fn>,
  action: string,
  label = "",
) => {
  expect(onEventEmit).toHaveBeenCalledTimes(1);
  expect(onEventEmit).toHaveBeenCalledWith("trackEvent", {
    label,
    action,
    category: "sequence",
  });
};

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("trackEvent", () => {
  it("emits the flat trackEvent shape conf-app filters on", () => {
    const emit = vi.fn();
    trackEvent(emit, { action: "title_edited", label: "added" });
    expect(emit).toHaveBeenCalledWith("trackEvent", {
      label: "added",
      action: "title_edited",
      category: "sequence",
    });
  });

  it("defaults the label to an empty string", () => {
    const emit = vi.fn();
    trackEvent(emit, { action: "divider_inserted" });
    expect(emit).toHaveBeenCalledWith("trackEvent", {
      label: "",
      action: "divider_inserted",
      category: "sequence",
    });
  });
});

describe("onEventEmit fires once per completed edit", () => {
  it("title_edited (added) when a title is added", () => {
    const { store, onEventEmit } = setupStore("A->B: hello\n");
    const view = mount(store, <DiagramTitle context={null} />);
    editSpan(
      view.container.querySelector<HTMLElement>(".editable-span-base")!,
      "My title",
    );
    expectTracked(onEventEmit, "title_edited", "added");
  });

  it("title_edited (changed) when a title is changed", () => {
    const code = "title Foo\nA->B: hello\n";
    const { store, onEventEmit } = setupStore(code);
    const view = mount(
      store,
      <DiagramTitle context={RootContext(code)?.title() ?? null} />,
    );
    editSpan(
      view.container.querySelector<HTMLElement>(".editable-span-base")!,
      "Bar",
    );
    expectTracked(onEventEmit, "title_edited", "changed");
  });

  it("nothing when a title edit changes nothing", () => {
    const code = "title Foo\nA->B: hello\n";
    const { store, onEventEmit } = setupStore(code);
    const view = mount(
      store,
      <DiagramTitle context={RootContext(code)?.title() ?? null} />,
    );
    editSpan(
      view.container.querySelector<HTMLElement>(".editable-span-base")!,
      "Foo",
    );
    expect(onEventEmit).not.toHaveBeenCalled();
  });

  it("message_label_edited when a message label is saved", () => {
    const { store, onEventEmit } = setupStore("A->B: hello");
    const view = mount(
      store,
      <MessageLabel labelText="hello" labelPosition={[6, 10]} />,
    );
    editSpan(
      view.container.querySelector<HTMLElement>(".editable-span-base")!,
      "world",
    );
    expect(store.get(codeAtom)).toBe("A->B: world");
    expectTracked(onEventEmit, "message_label_edited");
  });

  it("fragment_condition_edited when a fragment condition is saved", () => {
    const code = "if(x) {\n  A->B: hi\n}";
    const { store, onEventEmit } = setupStore(code);
    const condition = {
      getFormattedText: () => "x",
      start: { start: 3 },
      stop: { stop: 3 },
    };
    const view = mount(
      store,
      <ConditionLabel condition={condition} keyword="if" />,
    );
    editSpan(
      view.container.querySelector<HTMLElement>(".editable-span-base")!,
      "y",
    );
    expect(store.get(codeAtom)).toBe("if(y) {\n  A->B: hi\n}");
    expectTracked(onEventEmit, "fragment_condition_edited");
  });

  it("participant_renamed (inline) when a participant label is renamed", () => {
    const { store, onEventEmit } = setupStore("A\nA->B: hi");
    const view = mount(
      store,
      <ParticipantLabel
        labelText="A"
        labelPositions={[
          [0, 1],
          [2, 3],
        ]}
      />,
    );
    editSpan(
      view.container.querySelector<HTMLElement>(".editable-span-base")!,
      "Client",
    );
    expect(store.get(codeAtom)).toBe("Client\nClient->B: hi");
    expectTracked(onEventEmit, "participant_renamed", "inline");
  });

  it("participant_renamed (editor) when the participant editor renames", () => {
    const diagram = document.createElement("div");
    diagram.innerHTML =
      '<div class="participant" data-participant-id="A">A</div>' +
      '<div class="participant" data-participant-id="C">C</div>';
    document.body.appendChild(diagram);
    const { store, onEventEmit } = setupStore("A->C: Ping", (s) => {
      s.set(enableParticipantStyleEditingAtom, true);
      s.set(diagramElementAtom, diagram);
      s.set(selectedAtom, ["A"]);
    });
    const view = mount(
      store,
      <>
        <InteractionController />
        <ParticipantStylePanel />
      </>,
    );
    const name = view.getByLabelText("Name") as HTMLInputElement;
    act(() => {
      fireEvent.change(name, { target: { value: "Client" } });
    });
    act(() => {
      fireEvent.keyDown(name, { key: "Enter" });
    });
    expect(store.get(codeAtom)).toContain("Client->C");
    expectTracked(onEventEmit, "participant_renamed", "editor");
  });

  it("participant_added (gap) when the insert button adds a participant", () => {
    const { store, onEventEmit } = setupStore("A\nB\nA->B: hi", (s) => {
      s.set(enableParticipantInsertionAtom, true);
    });
    const view = mount(store, <ParticipantInsertControls />);
    act(() => {
      fireEvent.click(view.getByTestId("participant-append-button"));
    });
    expect(store.get(codeAtom)).not.toBe("A\nB\nA->B: hi");
    expectTracked(onEventEmit, "participant_added", "gap");
  });

  it("participant_added (empty_diagram) from the empty diagram prompt", () => {
    const { store, onEventEmit } = setupStore("");
    const view = mount(store, <EmptyDiagramPrompt />);
    act(() => {
      fireEvent.click(view.getByTestId("empty-diagram-prompt"));
    });
    expect(store.get(codeAtom)).toBe("A");
    expectTracked(onEventEmit, "participant_added", "empty_diagram");
  });

  it("divider_inserted when a divider is inserted from the gap menu", () => {
    const code = "A\nB\nC\nA->B: first\nA->C: second";
    const { store, onEventEmit } = setupStore(code, (s) => {
      s.set(enableMessageInsertionAtom, true);
      s.set(enableDividerInsertionAtom, true);
      s.set(diagramElementAtom, document.body);
    });
    const view = mount(
      store,
      <>
        <InteractionController />
        <Block context={RootContext(code)?.block()} enableGapHandles isRoot />
      </>,
    );
    act(() => {
      fireEvent.contextMenu(view.getByTestId("message-gap-hover-1"));
    });
    act(() => {
      fireEvent.click(view.getByTestId("divider-insert-1"));
    });
    expect(store.get(codeAtom)).toContain("==");
    expectTracked(onEventEmit, "divider_inserted");
  });

  it("message_reordered once, on drop, after a drag across several moves", () => {
    const code = "A\nB\nC\nA->B: first\nA->C: second";
    const { store, onEventEmit } = setupStore(code, (s) => {
      s.set(enableMessageReorderAtom, true);
    });
    const view = mount(
      store,
      <Block context={RootContext(code)?.block()} number="1" isRoot />,
    );
    const containers = view.container.querySelectorAll(".statement-container");
    const [first, second] = Array.from(containers);
    const source =
      first.querySelector(".message-reorder-handle") ??
      first.querySelector(".message");
    act(() => {
      fireEvent.pointerDown(source!, { clientX: 0, clientY: 0 });
    });
    for (const y of [40, 70, 100]) {
      act(() => {
        fireEvent.pointerMove(window, { clientX: 0, clientY: y });
      });
    }
    act(() => {
      fireEvent.pointerMove(second, { clientX: 0, clientY: 100 });
    });
    expect(onEventEmit).not.toHaveBeenCalled();
    act(() => {
      fireEvent.pointerUp(window);
    });
    expect(store.get(codeAtom)).not.toBe(code);
    expectTracked(onEventEmit, "message_reordered");
  });

  it("message_inserted once, on drop, when a create drag lands on a participant", () => {
    const rect = (left: number, width: number) =>
      ({
        left,
        top: 0,
        right: left + width,
        bottom: 300,
        width,
        height: 300,
        x: left,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    const diagram = document.createElement("div");
    diagram.innerHTML =
      '<div data-participant-id="A"></div><div data-participant-id="B"></div>';
    diagram.getBoundingClientRect = () => rect(0, 400);
    (
      diagram.querySelector('[data-participant-id="A"]') as HTMLElement
    ).getBoundingClientRect = () => rect(25, 50);
    (
      diagram.querySelector('[data-participant-id="B"]') as HTMLElement
    ).getBoundingClientRect = () => rect(225, 50);
    document.body.appendChild(diagram);
    const { store, onEventEmit } = setupStore("A\nB", (s) => {
      s.set(enableMessageInsertionAtom, true);
      s.set(diagramElementAtom, diagram);
    });
    mount(store, <MessageCreateControls />);
    act(() => {
      store.set(createMessageDragAtom, {
        source: "A",
        sourceX: 50,
        sourceY: 10,
        pointerX: 50,
        pointerY: 10,
        hoverTarget: null,
        insertIndex: 0,
        blockContext: null,
      });
    });
    for (const x of [100, 180, 250]) {
      act(() => {
        fireEvent.pointerMove(window, { clientX: x, clientY: 50 });
      });
    }
    expect(onEventEmit).not.toHaveBeenCalled();
    act(() => {
      fireEvent.pointerUp(window, { clientX: 250, clientY: 50 });
    });
    expect(store.get(codeAtom)).not.toBe("A\nB");
    expectTracked(onEventEmit, "message_inserted");
  });
});

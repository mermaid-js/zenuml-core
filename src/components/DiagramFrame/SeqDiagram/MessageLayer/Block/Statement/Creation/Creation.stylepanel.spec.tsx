import { Provider, createStore } from "jotai";
import { render, waitFor, fireEvent } from "@testing-library/react";
import { Creation } from "./Creation";
import { StylePanel } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/StylePanel";
import {
  codeAtom,
  rootContextAtom,
  messagesVMByStartAtom,
} from "@/store/Store";
import { offsetRangeOf } from "@/parser/helpers";
import type { MessageVM } from "@/vm/messages";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import { _STARTER_ } from "@/parser/OrderedParticipants";

function renderCreationWithStylePanel(code: string) {
  const store = createStore();
  store.set(codeAtom, code);

  const stat = store.get(rootContextAtom)?.block().stat()[0];
  if (!stat) throw new Error("expected statement context");
  const creationCtx = stat.creation?.();
  if (!creationCtx) throw new Error("expected creation context");
  const range = offsetRangeOf(creationCtx);
  const vm = range ? store.get(messagesVMByStartAtom)[range[0]] : undefined;
  if (!vm) throw new Error("expected creation view model");

  const vmWithArrow: MessageVM & {
    arrow: {
      translateX: number;
      interactionWidth: number;
      rightToLeft: boolean;
    };
  } = {
    ...vm,
    type: OwnableMessageType.CreationMessage,
    arrow: { translateX: 0, interactionWidth: 50, rightToLeft: false },
  };

  const utils = render(
    <Provider store={store}>
      <StylePanel />
      <Creation context={stat} origin={_STARTER_} vm={vmWithArrow} />
    </Provider>,
  );

  return { ...utils };
}

describe("StylePanel start offset parity for Creation", () => {
  test("opens style panel with new payload for 'a = new A'", async () => {
    const { container, getByTestId } = renderCreationWithStylePanel("a = new A");
    const messageEl = container.querySelector(
      "div.interaction.creation .message",
    ) as HTMLElement;
    expect(messageEl).toBeTruthy();
    fireEvent.click(messageEl);
    await waitFor(() => {
      expect(getByTestId("style-panel-toolbar")).toBeTruthy();
    });
  });
});

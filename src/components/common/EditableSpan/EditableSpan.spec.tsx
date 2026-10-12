import { fireEvent, render, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { textEditingAtom } from "@/store/Store";
import { EditableSpan } from "./EditableSpan";
import { useTextEditingGuard } from "./useTextEditingGuard";

const GuardedEditable = ({
  editable = true,
  autoEditToken,
}: {
  editable?: boolean;
  autoEditToken?: number;
}) => {
  const onEditingChange = useTextEditingGuard();
  return (
    <EditableSpan
      text="label"
      isEditable={editable}
      autoEditToken={autoEditToken}
      onEditingChange={onEditingChange}
      onSave={() => {}}
    />
  );
};

describe("EditableSpan text editing guard", () => {
  it("tracks automatic editing, readonly transitions, and unmount under StrictMode", async () => {
    const store = createStore();
    const view = render(
      <StrictMode>
        <Provider store={store}>
          <GuardedEditable autoEditToken={1} />
        </Provider>
      </StrictMode>,
    );
    await waitFor(() => expect(store.get(textEditingAtom)).toBe(true));

    view.rerender(
      <StrictMode>
        <Provider store={store}>
          <GuardedEditable autoEditToken={1} editable={false} />
        </Provider>
      </StrictMode>,
    );
    await waitFor(() => expect(store.get(textEditingAtom)).toBe(false));

    view.rerender(
      <StrictMode>
        <Provider store={store}>
          <GuardedEditable autoEditToken={2} />
        </Provider>
      </StrictMode>,
    );
    await waitFor(() => expect(store.get(textEditingAtom)).toBe(true));
    view.unmount();
    expect(store.get(textEditingAtom)).toBe(false);
  });

  it("keeps separate diagram stores independent and clears on Escape", () => {
    const first = createStore();
    const second = createStore();
    const view = render(
      <Provider store={first}>
        <GuardedEditable />
      </Provider>,
    );
    const label = view.container.querySelector(".editable-span-base")!;
    fireEvent.click(label);
    expect(first.get(textEditingAtom)).toBe(true);
    expect(second.get(textEditingAtom)).toBe(false);
    fireEvent.keyDown(label, { key: "Escape" });
    expect(first.get(textEditingAtom)).toBe(false);
    view.unmount();
  });
});

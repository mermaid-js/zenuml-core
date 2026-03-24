import { codeAtom, modeAtom, RenderMode } from "@/store/Store";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { ParticipantLabel } from "./ParticipantLabel";

function renderParticipantLabel(
  props: ComponentProps<typeof ParticipantLabel>,
  code = "",
) {
  const store = createStore();
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(codeAtom, code);

  const view = render(
    <Provider store={store}>
      <ParticipantLabel {...props} />
    </Provider>,
  );

  return { store, ...view };
}

describe("ParticipantLabel", () => {
  it("renders assignee-backed participants as a single editable span", () => {
    const { container } = renderParticipantLabel({
      labelText: "B",
      assignee: "b",
      labelPositions: [[8, 9]],
      assigneePositions: [[0, 1]],
    });

    const editableSpans = container.querySelectorAll(".editable-span-base");
    expect(editableSpans).toHaveLength(1);
    expect(editableSpans[0]?.textContent).toBe("b:B");
  });

  it("updates assignee and type from the combined single-span edit", async () => {
    const { container, store } = renderParticipantLabel(
      {
        labelText: "B",
        assignee: "b",
        labelPositions: [[8, 9]],
        assigneePositions: [[0, 1]],
      },
      "b = new B()",
    );

    const editableSpan = container.querySelector(".editable-span-base");
    expect(editableSpan).not.toBeNull();

    fireEvent.doubleClick(editableSpan!);

    await waitFor(() => {
      expect(editableSpan?.getAttribute("contenteditable")).toBe("true");
    });

    editableSpan!.innerText = "c:C";
    fireEvent.blur(editableSpan!);

    await waitFor(() => {
      expect(store.get(codeAtom)).toBe("c = new C()");
    });
  });
});

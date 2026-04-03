import { codeAtom, modeAtom, RenderMode } from "@/store/Store";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { ParticipantLabel } from "./ParticipantLabel";

// DiagramTitle.spec.tsx (loaded earlier alphabetically) registers a vi.mock for
// EditableSpan that strips the `editable-span-base` class. Override it here
// with a minimal implementation that preserves the class so our tests can find
// the element and interact with it.
vi.mock("@/components/common/EditableSpan", () => ({
  EditableSpan: ({
    text,
    isEditable,
    className,
    onSave,
    title,
  }: {
    text: string;
    isEditable?: boolean;
    className?: string;
    onSave: (t: string) => void;
    title?: string;
  }) => {
    const [editing, setEditing] = React.useState(false);
    return (
      <span
        className={`${className ?? ""} editable-span-base`.trim()}
        contentEditable={editing ? true : undefined}
        suppressContentEditableWarning={true}
        title={title}
        onClick={() => {
          if (isEditable) setEditing(true);
        }}
        onBlur={(e) => {
          if (editing) {
            setEditing(false);
            onSave(e.currentTarget.innerText);
          }
        }}
      >
        {text}
      </span>
    );
  },
}));

// React is used inside the vi.mock factory above; import it at module level.
import React from "react";

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

    fireEvent.click(editableSpan!);

    await waitFor(() => {
      expect(editableSpan?.getAttribute("contenteditable")).toBe("true");
    });

    (editableSpan as HTMLElement).innerText = "c:C";
    fireEvent.blur(editableSpan!);

    await waitFor(() => {
      expect(store.get(codeAtom)).toBe("c = new C()");
    });
  });
});

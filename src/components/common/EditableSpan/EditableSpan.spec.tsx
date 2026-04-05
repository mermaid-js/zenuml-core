import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EditableSpan } from "./EditableSpan";

describe("EditableSpan Escape cancellation", () => {
  it("does not call onSave when Escape cancels edit", async () => {
    const onSave = vi.fn();
    const { container } = render(
      <EditableSpan text="Click to add title" onSave={onSave} />,
    );

    const span = container.querySelector(".editable-span-base")! as HTMLElement;

    fireEvent.click(span);
    await waitFor(() => {
      expect(span.getAttribute("contenteditable")).toBe("true");
    });

    span.innerText = "partial text";
    fireEvent.keyDown(span, { key: "Escape" });

    await waitFor(() => {
      expect(span.getAttribute("contenteditable")).toBe("false");
    });

    expect(onSave).not.toHaveBeenCalled();
  });

  it("restores span content via React re-render (not direct DOM) after Escape", async () => {
    const PLACEHOLDER = "Click to add title";
    const onSave = vi.fn();
    const { container } = render(
      <EditableSpan
        text={PLACEHOLDER}
        className="text-gray-400 italic"
        onSave={onSave}
      />,
    );

    const span = container.querySelector(".editable-span-base")! as HTMLElement;

    fireEvent.click(span);
    await waitFor(() => {
      expect(span.getAttribute("contenteditable")).toBe("true");
    });

    // Simulate user typing over the placeholder
    span.innerText = "hello world";
    fireEvent.keyDown(span, { key: "Escape" });

    // After Escape: editing exits and content is restored to the text prop
    await waitFor(() => {
      expect(span.getAttribute("contenteditable")).toBe("false");
    });

    expect(span.textContent).toBe(PLACEHOLDER);
    expect(onSave).not.toHaveBeenCalled();
  });
});

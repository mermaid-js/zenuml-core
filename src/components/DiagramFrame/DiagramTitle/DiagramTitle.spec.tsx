import { codeAtom, modeAtom, onContentChangeAtom, RenderMode } from "@/store/Store";
import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it, vi } from "vitest";
import { DiagramTitle } from "./index";

let latestOnSave: (t: string) => void = () => {};

vi.mock("@/components/common/EditableSpan", () => ({
  EditableSpan: ({ onSave }: { onSave: (t: string) => void }) => {
    latestOnSave = onSave;
    return <span data-testid="editable-span" />;
  },
}));

function makeTitleContext(titleText: string, startPos: number) {
  const fullLine = "title " + titleText;
  return {
    content: () => titleText,
    start: { start: startPos },
    stop: { stop: startPos + fullLine.length - 1 },
  };
}

function setup(code: string, context: any) {
  const store = createStore();
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(codeAtom, code);
  const onChange = vi.fn();
  store.set(onContentChangeAtom, onChange);

  render(
    <Provider store={store}>
      <DiagramTitle context={context} />
    </Provider>,
  );

  return { store, onChange };
}

describe("DiagramTitle", () => {
  it("strips internal newlines when editing existing title", () => {
    const { store } = setup(
      "title My Diagram\nA.method",
      makeTitleContext("My Diagram", 0),
    );

    latestOnSave("Hello\nWorld");

    expect(store.get(codeAtom)).toBe("title Hello World\nA.method");
  });

  it("strips \\r\\n from pasted title text", () => {
    const { store } = setup(
      "title My Diagram\nA.method",
      makeTitleContext("My Diagram", 0),
    );

    latestOnSave("Line1\r\nLine2\nLine3");

    expect(store.get(codeAtom)).toBe("title Line1 Line2 Line3\nA.method");
  });

  it("strips newlines when creating a new title", () => {
    const { store } = setup("A.method", null);

    latestOnSave("New\nTitle");

    expect(store.get(codeAtom)).toBe("title New Title\nA.method");
  });
});

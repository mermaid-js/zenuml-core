import { RootContext } from "@/parser";
import { codeAtom, modeAtom, RenderMode } from "@/store/Store";
import { fireEvent, render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { describe, expect, it } from "vitest";
import { DiagramTitle } from "./index";

function renderTitle(code: string) {
  const store = createStore();
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(codeAtom, code);
  const context = RootContext(code)?.title() ?? null;

  const view = render(
    <Provider store={store}>
      <DiagramTitle context={context} />
    </Provider>,
  );
  return { store, ...view };
}

function saveTitle(view: ReturnType<typeof renderTitle>, newTitle: string) {
  const span = view.container.querySelector<HTMLElement>(".editable-span-base")!;
  fireEvent.click(span);
  span.innerText = newTitle;
  fireEvent.blur(span);
  return view.store.get(codeAtom);
}

describe("DiagramTitle", () => {
  it("keeps the newline after the title when the title is edited", () => {
    const view = renderTitle("title Foo\nA->B: hello\n");
    expect(saveTitle(view, "Bar")).toBe("title Bar\nA->B: hello\n");
  });

  it("keeps a CRLF newline after the title when the title is edited", () => {
    const view = renderTitle("title Foo\r\nA->B: hello\r\n");
    expect(saveTitle(view, "Bar")).toBe("title Bar\r\nA->B: hello\r\n");
  });

  it("replaces only the title content when it has trailing spaces", () => {
    const view = renderTitle("title Foo   \nA->B: hello\n");
    expect(saveTitle(view, "Bar")).toBe("title Bar\nA->B: hello\n");
  });

  it("edits a title that has no trailing newline", () => {
    const view = renderTitle("title Foo");
    expect(saveTitle(view, "Bar")).toBe("title Bar");
  });

  it("edits a title that is followed by a comment line", () => {
    const view = renderTitle("title Foo\n// note\nA->B: hello\n");
    expect(saveTitle(view, "Bar")).toBe("title Bar\n// note\nA->B: hello\n");
  });

  it("adds a title line when the diagram has none", () => {
    const view = renderTitle("A->B: hello\n");
    expect(saveTitle(view, "Bar")).toBe("title Bar\nA->B: hello\n");
  });
});

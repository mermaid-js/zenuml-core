import { Fixture } from "@/../test/unit/parser/fixture/Fixture";
import {
  enableMessageReorderAtom,
  enableParticipantStyleEditingAtom,
  modeAtom,
  RenderMode,
  selectedAtom,
} from "@/store/Store";
import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { SelfInvocation } from "./SelfInvocation";

describe("SelfInvocation", () => {
  const selfInvocationWrapper = render(
    <SelfInvocation
      context={Fixture.firstStatement("ret = A->A.method2()").message()}
      type="sync"
    />,
  );

  test("assignment", () => {
    expect(
      selfInvocationWrapper.container.querySelector(".assignee")?.textContent,
    ).toBe("ret");
    expect(
      selfInvocationWrapper.container.querySelector(
        ".label .editable-span-base",
      )?.textContent,
    ).toBe("method2()");
    expect(
      selfInvocationWrapper.container.querySelector(".self-invocation>label")
        ?.textContent,
    ).toBe("ret=method2()");
  });
});

describe("SelfInvocation interaction policy", () => {
  const renderSelf = (editorOpen: boolean) => {
    const store = createStore();
    store.set(modeAtom, RenderMode.Dynamic);
    store.set(enableMessageReorderAtom, true);
    store.set(enableParticipantStyleEditingAtom, true);
    if (editorOpen) store.set(selectedAtom, ["A"]);
    return render(
      <Provider store={store}>
        <SelfInvocation
          context={Fixture.firstStatement("A->A.method2()").message()}
          type="sync"
        />
      </Provider>,
    );
  };

  test("shows the reorder handle when idle", () => {
    const view = renderSelf(false);
    expect(
      view.container.querySelector(".message-reorder-handle"),
    ).toBeTruthy();
  });

  test("hides the reorder handle while the participant editor is open", () => {
    const view = renderSelf(true);
    expect(view.container.querySelector(".message-reorder-handle")).toBeNull();
  });
});

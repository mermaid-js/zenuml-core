import store, { codeAtom, rootContextAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { InteractionAsync } from "./Interaction-async";

function renderCode(code: string) {
  store.set(codeAtom, code);
  return render(
    <InteractionAsync
      context={store.get(rootContextAtom)?.block().stat()[0]}
      origin=""
    />,
  );
}

describe("Async Call", () => {
  // A -> B: m
  test.each([
    // A --- ?px ---> B
    ["A->B:m", "A", "B", "m", false],
    ["A->A:m", "A", "A", "m", true],
    // [ 'B:m',  'Starter', 'B', 'm', false], // Removed support of 'B:m'. This is confusing and dramatically increase parsing time (13 times slower)
  ])("code %s", function (code, source, target, message, isSelf) {
    const wrapper = renderCode(code);
    expect(wrapper.container.querySelector("div")?.dataset.source).toBe(source);
    expect(wrapper.container.querySelector("div")?.dataset.target).toBe(target);
    expect(wrapper.container.querySelector("div")?.dataset.signature).toBe(
      message,
    );
    expect(
      wrapper.container
        .querySelector("div")
        ?.classList.contains("self-invocation"),
    ).toBe(isSelf);
  });
});

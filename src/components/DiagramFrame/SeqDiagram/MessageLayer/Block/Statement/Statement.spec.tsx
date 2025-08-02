import { codeAtom, rootContextAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { Statement } from "./Statement";
import { createStore } from "jotai";

const store = createStore();

function renderCode(code: string) {
  store.set(codeAtom, code);

  return render(
    <Statement
      context={store.get(rootContextAtom)?.block().stat()[0]}
      origin=""
    />,
  );
}

describe("Statement", () => {
  test.each([
    ["// comment \n A->B:m", "comment", "", ""],
    [
      "// [red] comment \n A->B:m",
      "comment",
      "rgb(255, 0, 0)",
      "rgb(255, 0, 0)",
    ],
  ])("code %s", function (code, text, commentStyle, messageStyle) {
    const wrapper = renderCode(code);
    expect(wrapper.container.querySelector(".comments p")?.textContent).toEqual(
      text,
    );
    expect(
      window.getComputedStyle(wrapper.container.querySelector(".comments div")!)
        .color,
    ).toEqual(commentStyle);
    expect(
      window.getComputedStyle(
        wrapper.container.querySelector(".message .name div div")!,
      ).color,
    ).toEqual(messageStyle);
  });
});

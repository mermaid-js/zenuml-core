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
    // canvastext comes from the CSS Color Module Level 4 specification as a system color keyword.
    // Note: Different DOM implementations may return different values for default colors
    ["// comment \n A->B:m", "comment", ["canvastext", ""], ["canvastext", ""]],
    [
      "// [red] comment \n A->B:m",
      "comment",
      ["rgb(255, 0, 0)", "red"],
      ["rgb(255, 0, 0)", "red"],
    ],
  ])("code %s", function (code, text, commentStyle, messageStyle) {
    const wrapper = renderCode(code);
    expect(wrapper.container.querySelector(".comments p")?.textContent).toEqual(
      text,
    );
    
    const actualCommentColor = window.getComputedStyle(
      wrapper.container.querySelector(".comments div")!
    ).color;
    expect(commentStyle).toContain(actualCommentColor);
    
    const actualMessageColor = window.getComputedStyle(
      wrapper.container.querySelector(".message .name div div")!,
    ).color;
    expect(messageStyle).toContain(actualMessageColor);
  });
});

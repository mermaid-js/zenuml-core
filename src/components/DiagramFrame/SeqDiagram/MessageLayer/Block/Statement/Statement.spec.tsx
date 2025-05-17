import store, { codeAtom, rootContextAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { Statement } from "./Statement";

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
    ["// comment \n A->B:m", "comment", {}, {}],
    [
      "// [red] comment \n A->B:m",
      "comment",
      { color: "red" },
      { color: "red" },
    ],
  ])("code %s", function (code, text, commentStyle, messageStyle) {
    const wrapper = renderCode(code);
    expect(wrapper.container.querySelector(".comment")?.textContent).toEqual(
      text,
    );
    expect(
      wrapper.container.querySelector(".comment div")?.computedStyleMap(),
    ).toEqual(commentStyle);
    expect(
      wrapper.container
        .querySelector(".message .name div div")
        ?.computedStyleMap(),
    ).toEqual(messageStyle);
  });
});

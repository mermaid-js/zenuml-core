import {
  codeAtom,
  coordinatesAtom,
  treeIRAtom,
} from "@/store/Store";
import { render } from "@testing-library/react";
import { Statement } from "./Statement";
import { createStore } from "jotai";
import { createTreeVMBuilder } from "@/vm/tree-vm-builder";
import { _STARTER_ } from "@/constants.ts";

const store = createStore();

function renderCode(code: string) {
  store.set(codeAtom, code);

  const treeIR = store.get(treeIRAtom);
  const coordinates = store.get(coordinatesAtom);
  
  if (!treeIR?.root.statements.length) {
    throw new Error("Expected at least one statement in tree IR for test input");
  }

  const builder = createTreeVMBuilder();
  const vm = builder.buildStatementVM(treeIR.root.statements[0], _STARTER_, coordinates);

  return render(
    <Statement
      vm={vm}
      origin=""
    />,
  );
}

describe("Statement Component", () => {
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
    expect(wrapper.container.querySelector(".comments")?.textContent).toContain(
      text,
    );
    
    const actualCommentColor = window.getComputedStyle(
      wrapper.container.querySelector(".comments div")!
    ).color;
    expect(commentStyle).toContain(actualCommentColor);
    
    const messageElement = wrapper.container.querySelector(
      ".message .name .inline-block div"
    );
    if (messageElement) {
      const actualMessageColor = window.getComputedStyle(messageElement).color;
      expect(messageStyle).toContain(actualMessageColor);
    }
  });
});

import { Provider, createStore } from "jotai";
import { render } from "@testing-library/react";
import { Divider } from "./Divider";
import { codeAtom } from "@/store/Store";

type DividerVM = {
  note: string;
  rawNote: string;
  width: number;
  translateX: number;
  styling: { styles?: string[] };
};

function renderDivider(code: string, vm?: DividerVM) {
  const store = createStore();
  store.set(codeAtom, code);
  const utils = render(
    <Provider store={store}>
      <Divider origin="A" vm={vm} />
    </Provider>,
  );

  return { ...utils, vm };
}

describe("Divider", () => {
  test("renders with VM data", () => {
    const mockVM: DividerVM = {
      note: "Processed note",
      rawNote: "[bold]Test note",
      width: 300,
      translateX: -50,
      styling: { styles: ["bold"] },
    };

    const { container } = renderDivider("====divider", mockVM);
    const dividerEl = container.querySelector(".divider");

    expect(dividerEl?.style.width).toBe("300px");
    expect(dividerEl?.style.transform).toBe("translateX(-50px)");

    const nameEl = container.querySelector(".name");
    expect(nameEl?.textContent).toBe("Processed note");
  });

  test("renders with minimal VM data", () => {
    const minimalVM: DividerVM = {
      note: "Test divider note",
      rawNote: "Test divider note",
      width: 200,
      translateX: 10,
      styling: { styles: [] },
    };

    const { container } = renderDivider("====divider", minimalVM);
    const dividerEl = container.querySelector(".divider");

    // Should use VM data
    expect(dividerEl?.style.width).toBe("200px");
    expect(dividerEl?.style.transform).toBe("translateX(10px)");

    const nameEl = container.querySelector(".name");
    expect(nameEl?.textContent).toBe("Test divider note");
  });

  test("handles styled notes with VM", () => {
    const mockVM: DividerVM = {
      note: "Important message",
      rawNote: "[red,bold]Important message",
      width: 400,
      translateX: -25,
      styling: { styles: ["red", "bold"] },
    };

    const { container } = renderDivider("====divider", mockVM);
    const nameEl = container.querySelector(".name");
    const dividerEl = container.querySelector(".divider");
    const leftEl = container.querySelector(".left");
    const rightEl = container.querySelector(".right");

    expect(nameEl?.textContent).toBe("Important message");
    // Test that styles are applied
    expect(nameEl?.style.color).toBe("red");
    expect(nameEl?.style.fontWeight).toBe("bold");
    // Test that centering classes are applied
    expect(dividerEl?.classList.contains("flex")).toBe(true);
    expect(dividerEl?.classList.contains("items-center")).toBe(true);
    expect(nameEl?.classList.contains("text-center")).toBe(true);
    // Test that horizontal lines are present
    expect(leftEl?.classList.contains("h-px")).toBe(true);
    expect(rightEl?.classList.contains("h-px")).toBe(true);
    expect(dividerEl?.style.transform).toBe("translateX(-25px)");
  });
});
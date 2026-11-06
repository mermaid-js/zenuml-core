import { RootContext } from "@/parser";
import { codeAtom, enableNumberingAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { Statement } from "../Statement";

const renderFragment = (
  code: string,
  enableNumbering = true,
  number = "2.1.3",
) => {
  const store = createStore();
  store.set(codeAtom, code);
  store.set(enableNumberingAtom, enableNumbering);
  return render(
    <Provider store={store}>
      <Statement
        context={RootContext(code)!.block().stat()[0]}
        origin=""
        number={number}
      />
    </Provider>,
  );
};

describe("fragment header numbering", () => {
  test.each(["for", "while", "loop", "foreach", "forEach"])(
    "keeps the original %s loop keyword in its guard",
    (keyword) => {
      const view = renderFragment(`${keyword}(pending) {\n A->B:work\n}`);
      expect(view.container.querySelector(".guard-keyword")?.textContent).toBe(
        keyword,
      );
    },
  );
  test("labels all alternative guard branches with keywords instead of brackets", () => {
    const view = renderFragment(
      "if(approved) {\n A->B:first\n} else if(retry) {\n A->B:second\n} else {\n B->A:third\n}",
    );
    expect(
      [...view.container.querySelectorAll(".guard-keyword")].map(
        (element) => element.textContent,
      ),
    ).toEqual(["if", "else if", "else"]);
    expect(
      [...view.container.querySelectorAll(".guard-row")].map(
        (element) => element.textContent,
      ),
    ).toEqual(["ifapproved", "else ifretry", "else"]);
  });
  test("does not invent a while guard when a loop has no condition", () => {
    const view = renderFragment("loop {\n A->B:work\n}");
    expect(view.container.querySelector(".guard-row")).toBeNull();
  });
  test.each([
    ["loop(check) {\n A->B:m\n}", "Loop"],
    ["opt(check) {\n A->B:m\n}", "Opt"],
    ["par(check) {\n A->B:m\n}", "Par"],
    ["critical(check) {\n A->B:m\n}", "Critical"],
    ["section(Custom) {\n A->B:m\n}", "Custom"],
    ["if(check) {\n A->B:m\n} else {\n B->A:n\n}", "Alt"],
    ["try {\n A->B:m\n} catch(e) {\n B->A:n\n} finally {\n A->B:p\n}", "Try"],
    ["ref(external, A, B)", "Ref"],
  ])("puts the number inside the %s title before its type", (code, label) => {
    const view = renderFragment(code);
    const header = view.container.querySelector(".fragment > .header")!;
    const number = header.querySelector(".fragment-number");
    expect(number?.textContent).toBe("2.1.3");
    expect(header.textContent).toBe(`2.1.3${label}`);
    expect(header.querySelectorAll(".fragment-number")).toHaveLength(1);
  });

  test("removes the number when numbering is disabled", () => {
    const view = renderFragment("loop(check) {\n A->B:m\n}", false);
    expect(view.container.querySelector(".fragment-number")).toBeNull();
    expect(
      view.container.querySelector(".fragment > .header")?.textContent,
    ).toBe("Loop");
  });

  test("keeps cumulative message numbering across alternative branches", () => {
    const view = renderFragment(
      "if(check) {\n A->B:first\n} else {\n B->A:second\n}",
    );
    const fragment = view.container.querySelector(".fragment")!;
    const messages = fragment.querySelectorAll(".message");
    expect(messages[0].textContent).toContain("2.1.3.1");
    expect(messages[1].textContent).toContain("2.1.3.2");
    expect(fragment.querySelectorAll(".fragment-number")).toHaveLength(1);
  });

  test.each(["loop(check) {\n A->A:m\n}", "ref(external, A)"])(
    "reserves header space for a long number in a narrow %s fragment",
    (code) => {
      const view = renderFragment(code, true, "12.12.12.12.12.12.12.12");
      const fragment = view.container.querySelector<HTMLElement>(".fragment")!;
      expect(parseFloat(fragment.style.minWidth)).toBeGreaterThan(170);
    },
  );
});

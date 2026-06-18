import { codeAtom, rootContextAtom, coordinatesAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import { Block } from "../../Block";
import { centerOf } from "../utils";

function translateXof(el: HTMLElement): number {
  const match = el.style.transform.match(/translateX\((-?[\d.]+)px\)/);
  expect(match).not.toBeNull();
  return parseFloat(match![1]);
}

function setup(code: string) {
  const store = createStore();
  store.set(codeAtom, code);
  const coordinates = store.get(coordinatesAtom);
  const rootContext = store.get(rootContextAtom);
  const { container } = render(
    <Provider store={store}>
      <Block context={rootContext?.block()} origin="" isRoot />
    </Provider>,
  );
  return { container, coordinates };
}

describe("Divider positioning", () => {
  // Regression test for https://github.com/mermaid-js/zenuml-core/issues/392
  // A divider nested inside message occurrences must be pulled back to the
  // diagram content origin (x=0) by the FULL cumulative offset of its origin
  // participant — i.e. centerOf(origin) — so it spans the whole diagram with a
  // centered label. The previous ref-callback override only subtracted the
  // immediate block's padding-left (which is 0 for nested blocks), leaving the
  // full-width divider un-shifted so it overflowed off the right edge.
  it("pulls a nested divider back by its origin center (issue #392)", () => {
    const code = `A.m {
  B.m {
    C.m {
      == Start Here ==
      D.m
      == End Here ==
    }
  }
}`;
    const { container, coordinates } = setup(code);
    const dividers = container.querySelectorAll<HTMLElement>(".divider");
    expect(dividers.length).toBe(2);

    const centerOfC = centerOf(coordinates, "C");
    // Sanity: C is nested deep, so its center is well to the right of origin.
    expect(centerOfC).toBeGreaterThan(0);

    dividers.forEach((divider) => {
      expect(divider.getAttribute("data-origin")).toBe("C");
      // Spans the full diagram width...
      expect(divider.style.width).toBe(`${coordinates.getWidth()}px`);
      // ...and is pulled left by the full cumulative offset (origin center),
      // not the immediate block padding (0 for nested blocks → identity → bug).
      expect(translateXof(divider)).toBeCloseTo(-centerOfC, 5);
    });
  });

  it("pulls a top-level divider back by its origin center", () => {
    const { container, coordinates } = setup(`== Top ==\nA.m`);
    const divider = container.querySelector<HTMLElement>(".divider");
    expect(divider).toBeTruthy();
    const origin = divider!.getAttribute("data-origin")!;
    expect(translateXof(divider!)).toBeCloseTo(
      -centerOf(coordinates, origin),
      5,
    );
  });
});

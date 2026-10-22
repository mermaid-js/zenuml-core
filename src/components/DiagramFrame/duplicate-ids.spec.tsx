import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { codeAtom } from "@/store/Store";
import { DiagramFrame } from "./DiagramFrame";

const CODE = `
A.m1() {
  B.m2() {
    C.m3()
    C.m4()
  }
  B.m5() {
    C.m6()
  }
}
loop(x) {
  A->B: one
  opt(y) {
    B.m7() {
      C.m8()
    }
  }
}
alt(z) {
  A->C: two
} else {
  A->B: three
}
`;

describe("rendered diagram ids", () => {
  it("has no duplicate id attributes with several occurrences and fragments", () => {
    const store = createStore();
    store.set(codeAtom, CODE);
    const { container } = render(
      <Provider store={store}>
        <DiagramFrame />
      </Provider>,
    );

    // Guard against a vacuous pass.
    expect(container.querySelectorAll(".occurrence").length).toBeGreaterThan(3);
    expect(
      container.querySelectorAll(".fragment").length,
    ).toBeGreaterThanOrEqual(2);

    const seen = new Map<string, number>();
    container.querySelectorAll("[id]").forEach((el) => {
      seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
    });
    const duplicates = [...seen].filter(([, n]) => n > 1);
    expect(duplicates).toEqual([]);
  });
});

describe("icon files", () => {
  // An icon renders once per fragment or occurrence, so a fixed id inside it
  // would repeat. No icon references an id internally, so none may carry one.
  const dir = join(__dirname, "../Icon/icons");

  it.each(readdirSync(dir).filter((f) => f.endsWith(".svg")))(
    "%s has no id attribute",
    (file) => {
      expect(readFileSync(join(dir, file), "utf8")).not.toMatch(/\sid=/);
    },
  );
});

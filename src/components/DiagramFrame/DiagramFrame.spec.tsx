import { mock } from "bun:test";
import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";

mock.module("@/components/Icon/Icons", () => ({
  default: () => null,
}));

const { DiagramFrame } = await import("./DiagramFrame");

describe("DiagramFrame", () => {
  it("renders diagram content without an embedded footer", () => {
    const { container } = render(
      <Provider store={createStore()}>
        <DiagramFrame />
      </Provider>,
    );

    expect(container.querySelector(".frame")).not.toBeNull();
    expect(container.querySelector(".footer")).toBeNull();
  });
});

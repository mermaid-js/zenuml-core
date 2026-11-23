import { render } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import {
  enableWritingAnimationAtom,
  modeAtom,
  RenderMode,
} from "@/store/Store";
import { EmptyDiagramPrompt } from "./EmptyDiagramPrompt";

const mount = (writing: boolean) => {
  const store = createStore();
  store.set(modeAtom, RenderMode.Dynamic);
  store.set(enableWritingAnimationAtom, writing);
  return render(
    <Provider store={store}>
      <EmptyDiagramPrompt />
    </Provider>,
  );
};

describe("EmptyDiagramPrompt", () => {
  it("shows the prompt on an empty diagram", () => {
    const { queryByTestId } = mount(false);
    expect(queryByTestId("empty-diagram-prompt")).not.toBeNull();
  });

  // ADR 0009, G4: the prompt made the empty diagram wider than a small one,
  // so the first diagram typed made the width fall, then grow (G1).
  it("is hidden while enableWritingAnimation is on", () => {
    const { queryByTestId } = mount(true);
    expect(queryByTestId("empty-diagram-prompt")).toBeNull();
  });
});

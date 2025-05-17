import { Fixture } from "../../../../../../../test/unit/parser/fixture/Fixture";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { expect } from "vitest";
import Anchor2 from "@/positioning/Anchor2";
import store, { codeAtom } from "@/store/Store";
import { render } from "@testing-library/react";
import { Interaction } from "./Interaction/Interaction";

function mountInteractionWithCode(
  code: string,
  contextLocator: (code: string) => any,
  origin = "",
) {
  store.set(codeAtom, code);

  const context = contextLocator(code);
  const props = {
    context,
    origin,
    fragmentOffset: 100,
  };

  return render(<Interaction {...props} />);
}
describe("ArrowMixin", () => {
  it("self message 1", async () => {
    const interaction = mountInteractionWithCode(
      "self()",
      Fixture.firstStatement,
      _STARTER_,
    );

    expect(interaction.container.style.transform).toEqual(
      "translateX(" + new Anchor2(50, 0) + "px)",
    );
  });

  it("sync message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m()",
      Fixture.firstStatement,
      _STARTER_,
    );

    expect(interaction.container.style.transform).toEqual(
      "translateX(" + new Anchor2(50, 0) + "px)",
    );
  });

  it("creation message 1", async () => {
    const interaction = mountInteractionWithCode(
      "A.m() { new B }",
      Fixture.firstChild,
      _STARTER_,
    );

    expect(interaction.container.style.transform).toEqual(
      "translateX(" + new Anchor2(50, 0) + "px)",
    );
  });
});

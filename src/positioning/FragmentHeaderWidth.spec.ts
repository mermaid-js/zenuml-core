import { Coordinates } from "./Coordinates";
import { stubWidthProvider } from "@/../test/unit/parser/fixture/Fixture";
import { RootContext } from "@/parser";
import { walkStatements } from "@/svg/walkStatements";
import { FRAGMENT_PADDING_X } from "./Constants";
import { fragmentGuardKeyword, fragmentGuardWidth } from "./FragmentGuardWidth";
import { fragmentMinimumWidth } from "./FragmentHeaderWidth";

describe("fragmentMinimumWidth", () => {
  test("insets a nested guard by the border difference between the fragments", () => {
    // opt (border 30) > loop (border 20) > if (border 10), all starting at A.
    // The loop's left edge is 10px right of the opt's, plus one level of
    // padding, so its guard needs the opt to be guard width + 20 wide.
    const label = "everyPendingOrderInTheIncomingQueueUntilEmpty";
    const code = `A B
opt {
  loop(${label}) {
    if(z) {
      A->B.m
    }
  }
}`;
    const rootContext = RootContext(code);
    const coordinates = new Coordinates(rootContext, stubWidthProvider);
    const infos = walkStatements(rootContext);
    const opt = infos.find((info) => info.fragmentKind === "opt")!;

    expect(fragmentMinimumWidth(opt, infos, coordinates, false)).toBe(
      fragmentGuardWidth(label, fragmentGuardKeyword("loop")) +
        10 +
        FRAGMENT_PADDING_X,
    );
  });
});

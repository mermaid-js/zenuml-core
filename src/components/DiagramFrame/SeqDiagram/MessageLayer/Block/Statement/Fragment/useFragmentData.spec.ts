import { createStore } from "jotai";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { codeAtom, rootContextAtom } from "@/store/Store";
import { getOffsetX } from "./useFragmentData";

// The fragment is the first statement inside the braces of the first
// statement (an implicit-starter self message, no explicit owner or sender).
const offsetOfNestedFragment = (code: string, origin: string) => {
  const store = createStore();
  store.set(codeAtom, code);
  const root = store.get(rootContextAtom)!;
  const outer = root.block().stat()[0] as any;
  const fragmentStat = outer.children[0].braceBlock().block().stat()[0];
  return getOffsetX(store, fragmentStat, origin);
};

describe("getOffsetX", () => {
  // The starter is always the leftmost local participant, so getOffsetX returns
  // before it consults depthOnParticipant. Regression guard for #517: unifying
  // the two depthOnParticipant copies must not move this fragment.
  it("keeps the offset of a fragment nested in an implicit starter self message", () => {
    const code = `selfSync() {
  if(x) {
    A.m
  }
}`;
    expect(offsetOfNestedFragment(code, _STARTER_)).toBe(60);
  });
});

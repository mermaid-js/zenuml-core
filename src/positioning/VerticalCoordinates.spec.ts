import { RootContext } from "@/parser";
import { VerticalCoordinates } from "./VerticalCoordinates";
import { Coordinates } from "./Coordinates";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { WidthFunc, TextType } from "@/positioning/Coordinate";
import { getLayoutMetrics } from "@/positioning/vertical/LayoutMetrics";

const stubWidthProvider: WidthFunc = (text: string, type: TextType) => {
  const base = type === TextType.ParticipantName ? 10 : 8;
  return Math.max(40, text.length * base);
};

describe("VerticalCoordinates", () => {
  it("computes creation offsets for participants", () => {
    const code = "A.m{new Order}";
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });
    const creationTop = vertical.getCreationTop("Order");
    expect(creationTop).toBeGreaterThan(0);
    const entries = vertical.entries();
    expect(entries.length).toBeGreaterThan(0);
  });

  it("aligns creation anchors inside alt branches", () => {
    const code = `if (x) { new A } else { new B }`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });
    const creations = vertical
      .entries()
      .filter(([, coord]) => coord.kind === "creation")
      .map(([, coord]) => coord)
      .sort((a, b) => a.top - b.top);
    expect(creations).toHaveLength(2);

    const metrics = getLayoutMetrics(undefined);
    const altTop = metrics.messageLayerPaddingTop + metrics.statementMarginTop;
    const headerBottom = altTop + metrics.fragmentHeaderHeight;
    const firstBlockStart =
      headerBottom + metrics.fragmentBodyGap + metrics.fragmentConditionHeight;
    const firstStatementTop = firstBlockStart + metrics.statementMarginTop;
    const branchInset = metrics.creationAltBranchInset;
    const firstExpected = firstStatementTop + branchInset;

    const creationHeight =
      metrics.creationMessageHeight + metrics.occurrenceMinHeight;
    const afterFirstBlock =
      firstStatementTop + creationHeight + metrics.statementMarginBottom;
    const afterElseCondition =
      afterFirstBlock +
      metrics.fragmentBranchGap +
      metrics.fragmentElseLabelHeight;
    const secondStatementTop = afterElseCondition + metrics.statementMarginTop;
    const secondExpected = secondStatementTop + branchInset;

    expect(creations[0].anchors?.message).toBe(firstExpected);
    expect(creations[1].anchors?.message).toBe(secondExpected);

    const creationTops = ["A", "B"].map((name) =>
      vertical.getCreationTop(name),
    );
    expect(creationTops).toEqual(
      creations.map((creation) => creation.anchors?.message),
    );
  });

  it("applies try/catch offsets to creation anchors", () => {
    const code = `try { new A } catch { }`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });
    const metrics = getLayoutMetrics(undefined);
    const tryBlock = context
      ?.block()
      ?.stat?.()?.[0]
      ?.tcf?.()
      ?.tryBlock?.()
      ?.braceBlock?.()
      ?.block?.();
    const tryStatements = tryBlock?.stat?.() || [];
    const firstCreation = tryStatements[0];
    const anchors = vertical.getStatementAnchors(firstCreation);
    expect(anchors?.message).toBeDefined();
    const creationTop = vertical.getCreationTop("A");
    expect(creationTop).toBeDefined();

    // The anchor already absorbs the try-segment inset, so creationTop should
    // match it exactly rather than adding the offset again.
    expect(creationTop).toBe(anchors?.message);

    const expectedAnchor =
      metrics.messageLayerPaddingTop + // root padding
      metrics.statementMarginTop + // margin before the TCF fragment
      metrics.fragmentHeaderHeight + // "try" header
      metrics.statementMarginTop + // margin before the creation inside try
      metrics.creationTcfSegmentOffset; // inset applied within try block
    expect(anchors?.message).toBe(expectedAnchor);
  });

  it("applies additional inset to subsequent creations inside PAR", () => {
    const code = `par { new A new B }`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });
    const metrics = getLayoutMetrics(undefined);
    const parBlock = context
      ?.block()
      ?.stat?.()?.[0]
      ?.par?.()
      ?.braceBlock?.()
      ?.block?.();
    const parStatements = parBlock?.stat?.() || [];
    const firstCreation = parStatements[0];
    const secondCreation = parStatements[1];
    const firstAnchors = vertical.getStatementAnchors(firstCreation);
    const secondAnchors = vertical.getStatementAnchors(secondCreation);
    expect(firstAnchors?.message).toBeDefined();
    expect(secondAnchors?.message).toBeDefined();
    const firstDiff =
      (vertical.getCreationTop("A") || 0) - (firstAnchors?.message || 0);
    const secondDiff =
      (vertical.getCreationTop("B") || 0) - (secondAnchors?.message || 0);
    expect(firstDiff).toBe(0);
    expect(secondDiff).toBe(0);

    // The sibling inset should already be baked into the second anchor.
    const creationHeight =
      metrics.creationMessageHeight + metrics.occurrenceMinHeight;
    const expectedSecondAnchor =
      (firstAnchors?.message || 0) +
      creationHeight +
      metrics.statementGap +
      metrics.creationParSiblingOffset;
    expect(secondAnchors?.message).toBe(expectedSecondAnchor);
  });

  it("keeps inline messages flush with following creation assignments", () => {
    const code = `A.message\na = new A()`;
    const context = RootContext(code);
    const coordinates = new Coordinates(context, stubWidthProvider);
    const participantOrder = coordinates.orderedParticipantNames();
    const vertical = new VerticalCoordinates({
      rootContext: context,
      originParticipant: _STARTER_,
      participantOrder,
    });
    const statements = context?.block()?.stat?.() || [];
    expect(vertical.getStatementTop(statements[0])).toBe(72);
    expect(vertical.getStatementTop(statements[1])).toBe(128);
    expect(vertical.getStatementHeight(statements[0])).toBe(55);
    expect(vertical.getStatementHeight(statements[1])).toBe(78);
  });
});

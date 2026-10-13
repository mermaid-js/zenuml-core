import antlr4 from "antlr4";
import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { specialCharRegex } from "@/utils/messageNormalizers";

type Range = [number, number];

// `Participants.GetPositions` records the `as` label instead of the identifier
// when a participant has one, because inline renaming on the canvas edits the
// displayed text. Renaming the identifier itself needs every occurrence of the
// name token, so this walks the tree with the same hooks `ToCollector` uses
// but always records the name.
const collectNamePositions = (rootContext: any, name: string): Range[] => {
  const positions: Range[] = [];
  let blind = false;
  const push = (ctx: any) => {
    if (ctx?.start && ctx?.stop)
      positions.push([ctx.start.start, ctx.stop.stop + 1]);
  };
  const matches = (ctx: any) =>
    (ctx?.name?.()?.getFormattedText?.() ?? ctx?.getFormattedText?.()) === name;

  const listener: any = new (sequenceParserListener as any)();
  listener.enterParticipant = (ctx: any) => {
    if (blind) return;
    if (ctx?.name?.()?.getFormattedText?.() === name) push(ctx.name());
  };
  const onEndpoint = (ctx: any) => {
    if (blind) return;
    if (matches(ctx)) push(ctx.name?.() ?? ctx);
  };
  listener.enterFrom = onEndpoint;
  listener.enterTo = onEndpoint;
  listener.enterStarter = (ctx: any) => {
    if (ctx?.getFormattedText?.() === name) push(ctx);
  };
  listener.enterCreation = (ctx: any) => {
    if (blind) return;
    const ctor = ctx?.creationBody?.()?.construct?.();
    if (ctor && ctx?.Owner?.() === name && !ctx?.Assignee?.()) push(ctor);
  };
  listener.enterRef = (ctx: any) => {
    ctx?.Participants?.()?.forEach((participant: any) => {
      if (participant?.getText?.() === name) push(participant);
    });
  };
  listener.enterParameters = () => (blind = true);
  listener.exitParameters = () => (blind = false);
  listener.enterCondition = () => (blind = true);
  listener.exitCondition = () => (blind = false);

  antlr4.tree.ParseTreeWalker.DEFAULT.walk(listener, rootContext);
  return positions;
};

export const normalizeParticipantName = (text: string) => {
  let next = text.trim().replace(/\s+/g, " ");
  if (specialCharRegex.test(next)) {
    next = `"${next.replace(/"/g, "")}"`;
    specialCharRegex.lastIndex = 0;
  }
  return next;
};

/** Rename a participant identifier everywhere it is referenced. */
export const renameParticipantInDsl = (
  code: string,
  rootContext: any,
  oldName: string,
  newName: string,
): string => {
  const next = normalizeParticipantName(newName);
  if (!next || next === oldName) return code;
  const positions = collectNamePositions(rootContext, oldName).sort(
    (a, b) => b[0] - a[0],
  );
  let result = code;
  for (const [start, end] of positions) {
    result = result.slice(0, start) + next + result.slice(end);
  }
  return result;
};

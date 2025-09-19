import { offsetRangeOf, commentOf } from "@/parser/helpers";
import type { Coordinates } from "@/positioning/Coordinates";
import type { MessageVM } from "@/vm/messages";
import { enhanceMessageVMWithArrow, enhanceReturnVMWithArrow } from "@/vm/messages";
import type { DividerVM } from "@/vm/divider";
import { buildDividerVM } from "@/vm/divider";
import type { RefVM, AltVM, FragmentData } from "@/vm/fragments";
import { buildRefVM, buildAltVM, buildLoopVM, buildOptVM, buildParVM, buildSectionVM, buildCriticalVM, buildTcfVM, extractFragmentData } from "@/vm/fragments";

export interface StatementVMData {
  message?: MessageVM;
  asyncMessage?: MessageVM;
  creation?: MessageVM;
  return?: MessageVM;
  divider?: DividerVM | null;
  ref?: RefVM | undefined;
}

function getVMForContext(
  nodeCtx: any | null,
  messagesByStart: Record<number, MessageVM>,
): MessageVM | undefined {
  const range = nodeCtx ? offsetRangeOf(nodeCtx) : null;
  return range ? messagesByStart[range[0]] : undefined;
}

export function buildStatementVM(
  context: any,
  origin: string,
  coordinates: Coordinates,
  messagesByStart: Record<number, MessageVM>,
): StatementVMData {
  // message
  const messageCtx = context?.message?.();
  const messageVM = getVMForContext(messageCtx, messagesByStart);
  const messageVMWithArrow = messageVM
    ? enhanceMessageVMWithArrow(messageVM, context, origin, coordinates)
    : undefined;

  // async message
  const asyncMessageCtx = context?.asyncMessage?.();
  const asyncVM = getVMForContext(asyncMessageCtx, messagesByStart);
  const asyncVMWithArrow = asyncVM
    ? enhanceMessageVMWithArrow(asyncVM, context, origin, coordinates)
    : undefined;

  // creation
  const creationCtx = context?.creation?.();
  const creationVM = getVMForContext(creationCtx, messagesByStart);
  const creationVMWithArrow = creationVM
    ? enhanceMessageVMWithArrow(creationVM, context, origin, coordinates)
    : undefined;

  // return
  const retCtx = context?.ret?.();
  const retAsync = retCtx?.asyncMessage?.();
  const retKeyRangeCtx = retAsync || retCtx;
  const retVM = getVMForContext(retKeyRangeCtx, messagesByStart);
  const retVMWithArrow = retVM
    ? enhanceReturnVMWithArrow(retVM, context, origin, coordinates)
    : undefined;

  // divider
  const dividerCtx = context?.divider?.();
  const dividerVM: DividerVM | null = dividerCtx
    ? buildDividerVM(dividerCtx, origin, coordinates)
    : null;

  // ref
  const refVM: RefVM | undefined = context?.ref?.() ? buildRefVM(context) : undefined;

  return {
    message: messageVMWithArrow,
    asyncMessage: asyncVMWithArrow,
    creation: creationVMWithArrow,
    return: retVMWithArrow,
    divider: dividerVM,
    ref: refVM,
  };
}

export type StatementKind =
  | "loop"
  | "alt"
  | "par"
  | "opt"
  | "section"
  | "critical"
  | "tcf"
  | "ref"
  | "creation"
  | "message"
  | "async"
  | "divider"
  | "return";

export type DiscriminatedStatementVM =
  | { kind: "loop"; fragmentData: FragmentData; loopVM: ReturnType<typeof buildLoopVM>; comment?: string }
  | { kind: "alt"; vm: AltVM | null; fragmentData: FragmentData; comment?: string }
  | { kind: "par"; fragmentData: FragmentData; parVM: ReturnType<typeof buildParVM>; comment?: string }
  | { kind: "opt"; fragmentData: FragmentData; optVM: ReturnType<typeof buildOptVM>; comment?: string }
  | { kind: "section"; fragmentData: FragmentData; sectionVM: ReturnType<typeof buildSectionVM>; comment?: string }
  | { kind: "critical"; fragmentData: FragmentData; criticalVM: ReturnType<typeof buildCriticalVM>; comment?: string }
  | { kind: "tcf"; fragmentData: FragmentData; tcfVM: ReturnType<typeof buildTcfVM>; comment?: string }
  | { kind: "ref"; ref: RefVM | undefined; fragmentData: FragmentData; comment?: string }
  | { kind: "divider"; divider: DividerVM | null; comment?: string }
  | { kind: "creation"; message?: MessageVM; comment?: string }
  | { kind: "message"; message?: MessageVM; comment?: string }
  | { kind: "async"; message?: MessageVM; comment?: string }
  | { kind: "return"; message?: MessageVM; comment?: string };

/**
 * Build a discriminated Statement VM with a `kind` field to drive rendering.
 * Where applicable, includes the computed view model for that kind.
 */
export function buildDiscriminatedStatementVM(
  context: any,
  origin: string,
  coordinates: Coordinates,
  messagesByStart: Record<number, MessageVM>,
): DiscriminatedStatementVM {
  // Centralize comment extraction here so components don't access parser helpers
  const comment = commentOf(context) || "";
  // Preserve the same precedence as existing switch in Statement.tsx
  if (context?.loop?.()) {
    const fragmentData = extractFragmentData(context);
    const loopVM = buildLoopVM(context);
    return { kind: "loop", fragmentData, loopVM, comment };
  }
  if (context?.alt?.()) {
    const altVM = buildAltVM(context);
    const fragmentData = extractFragmentData(context);
    return { kind: "alt", vm: altVM, fragmentData, comment };
  }
  if (context?.par?.()) {
    const fragmentData = extractFragmentData(context);
    const parVM = buildParVM(context);
    return { kind: "par", fragmentData, parVM, comment };
  }
  if (context?.opt?.()) {
    const fragmentData = extractFragmentData(context);
    const optVM = buildOptVM(context);
    return { kind: "opt", fragmentData, optVM, comment };
  }
  if (context?.section?.()) {
    const fragmentData = extractFragmentData(context);
    const sectionVM = buildSectionVM(context);
    return { kind: "section", fragmentData, sectionVM, comment };
  }
  if (context?.critical?.()) {
    const fragmentData = extractFragmentData(context);
    const criticalVM = buildCriticalVM(context);
    return { kind: "critical", fragmentData, criticalVM, comment };
  }
  if (context?.tcf?.()) {
    const fragmentData = extractFragmentData(context);
    const tcfVM = buildTcfVM(context);
    return { kind: "tcf", fragmentData, tcfVM, comment };
  }

  // Build base data once and reuse
  const data = buildStatementVM(context, origin, coordinates, messagesByStart);

  if (context?.ref?.()) {
    const fragmentData = extractFragmentData(context);
    return { kind: "ref", ref: data.ref ?? null, fragmentData, comment };
  }
  if (context?.creation?.()) return { kind: "creation", message: data.creation, comment };
  if (context?.message?.()) return { kind: "message", message: data.message, comment };
  if (context?.asyncMessage?.()) return { kind: "async", message: data.asyncMessage, comment };
  if (context?.divider?.()) return { kind: "divider", divider: data.divider ?? null, comment };
  if (context?.ret?.()) return { kind: "return", message: data.return, comment };

  // Fallback: unknown statement, prefer message shape to avoid crashes
  return { kind: "message", message: data.message, comment };
}

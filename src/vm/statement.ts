import { offsetRangeOf } from "@/parser/helpers";
import type { Coordinates } from "@/positioning/Coordinates";
import type { MessageVM } from "@/vm/messages";
import { enhanceMessageVMWithArrow, enhanceReturnVMWithArrow } from "@/vm/messages";
import type { DividerVM } from "@/vm/divider";
import { buildDividerVM } from "@/vm/divider";
import type { RefVM } from "@/vm/fragments";
import { buildRefVM } from "@/vm/fragments";

export interface StatementVMData {
  message?: MessageVM;
  asyncMessage?: MessageVM;
  creation?: MessageVM;
  return?: MessageVM;
  divider?: DividerVM | null;
  ref?: RefVM | null;
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
  const refVM: RefVM | null = context?.ref?.() ? buildRefVM(context) : null;

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
  | { kind: "loop" }
  | { kind: "alt" }
  | { kind: "par" }
  | { kind: "opt" }
  | { kind: "section" }
  | { kind: "critical" }
  | { kind: "tcf" }
  | { kind: "ref"; ref: RefVM | null }
  | { kind: "divider"; divider: DividerVM | null }
  | { kind: "creation"; message?: MessageVM }
  | { kind: "message"; message?: MessageVM }
  | { kind: "async"; message?: MessageVM }
  | { kind: "return"; message?: MessageVM };

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
  // Preserve the same precedence as existing switch in Statement.tsx
  if (context?.loop?.()) return { kind: "loop" };
  if (context?.alt?.()) return { kind: "alt" };
  if (context?.par?.()) return { kind: "par" };
  if (context?.opt?.()) return { kind: "opt" };
  if (context?.section?.()) return { kind: "section" };
  if (context?.critical?.()) return { kind: "critical" };
  if (context?.tcf?.()) return { kind: "tcf" };

  // Build base data once and reuse
  const data = buildStatementVM(context, origin, coordinates, messagesByStart);

  if (context?.ref?.()) return { kind: "ref", ref: data.ref ?? null };
  if (context?.creation?.()) return { kind: "creation", message: data.creation };
  if (context?.message?.()) return { kind: "message", message: data.message };
  if (context?.asyncMessage?.()) return { kind: "async", message: data.asyncMessage };
  if (context?.divider?.()) return { kind: "divider", divider: data.divider ?? null };
  if (context?.ret?.()) return { kind: "return", message: data.return };

  // Fallback: unknown statement, prefer message shape to avoid crashes
  return { kind: "message", message: data.message };
}

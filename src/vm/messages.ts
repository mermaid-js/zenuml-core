import { OwnableMessageType } from "@/parser/OwnableMessage";
import type { CodeRange } from "@/parser/CodeRange";
import { calculateArrowGeometry } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/arrowGeometry";
import type { Coordinates } from "@/positioning/Coordinates";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { formattedTextOf } from "@/parser/helpers";

export type MessageVM = {
  type: OwnableMessageType;
  from?: string;
  to?: string;
  source?: string;
  providedFrom?: string | null;
  signature: string;
  // Inclusive label range for inline editing, when available
  labelRange?: [number, number] | null;
  // Range covering the whole statement (start inclusive, end exclusive)
  range?: [number, number] | null;
  // Precomputed code range for click handlers
  codeRange?: CodeRange | null;
  // Optional comment text (not styling)
  comment?: string | null;
  isSelf: boolean;
  // Whether the label is editable (creation requires valid params)
  canEditLabel?: boolean;
  // Assignment text (e.g., "ret" for "ret = A.method()")
  assignee?: string | null;
  arrow?: {
    translateX: number;
    interactionWidth: number;
    rightToLeft: boolean;
    originLayers?: number;
    sourceLayers?: number;
    targetLayers?: number;
  };
};

export function buildMessagesVM(messages: Array<any>): MessageVM[] {
  return messages.map((m, i) => {
    const source = m.providedFrom ?? m.from;
    const to = m.to;
    const isSelf = (source === to) || !to;
    const isCreation = m.type === OwnableMessageType.CreationMessage;
    const label = m.labelRange ?? null;
    const labelValid = Array.isArray(label) && label.length === 2 && label[0] != null && label[1] != null && label[0] >= 0 && label[1] >= 0;
    const canEditLabel = isCreation ? !!labelValid : true;
    return {
      type: m.type,
      from: m.from,
      to,
      source: source ?? undefined,
      providedFrom: m.providedFrom ?? null,
      signature: m.signature,
      labelRange: m.labelRange ?? null,
      range: m.range ?? null,
      codeRange: m.codeRange ?? null,
      comment: m.comment ?? null,
      isSelf,
      canEditLabel,
      assignee: m.assignee ?? null,
    };
  });
}

/**
 * Enhances a MessageVM with arrow geometry calculations
 * This is a helper function to centralize arrow calculations for MessageVMs
 */
export function enhanceMessageVMWithArrow(
  vm: MessageVM,
  context: any,
  origin: string,
  coordinates: Coordinates,
): MessageVM {
  if (!vm) return vm;

  const source = vm.source ?? vm.from ?? origin;
  const target = vm.to ?? source;

  const arrowGeometry = calculateArrowGeometry({
    context,
    origin,
    source,
    target,
    coordinates,
  });

  return {
    ...vm,
    arrow: {
      translateX: arrowGeometry.translateX,
      interactionWidth: arrowGeometry.interactionWidth,
      rightToLeft: arrowGeometry.rightToLeft,
      originLayers: arrowGeometry.originLayers,
      sourceLayers: arrowGeometry.sourceLayers,
      targetLayers: arrowGeometry.targetLayers,
    },
  };
}

/**
 * Specialized enhancer for Return statements. Source/target semantics differ from other messages:
 * - source: async.From() || ret.From() || _STARTER_
 * - target: formatted(async.to) || ret.ReturnTo() || _STARTER_
 */
export function enhanceReturnVMWithArrow(
  vm: MessageVM,
  context: any,
  origin: string,
  coordinates: Coordinates,
): MessageVM {
  if (!vm) return vm;
  const ret = context?.ret?.();
  const asyncMsg = ret?.asyncMessage?.();
  const source = asyncMsg?.From?.() || ret?.From?.() || _STARTER_;
  const target =
    formattedTextOf(asyncMsg?.to?.()) ||
    ret?.ReturnTo?.() ||
    _STARTER_;

  const arrowGeometry = calculateArrowGeometry({
    context,
    origin,
    source,
    target,
    coordinates,
  });

  return {
    ...vm,
    // Override the from/to with the correctly computed source/target for returns
    from: source,
    to: target,
    arrow: {
      translateX: arrowGeometry.translateX,
      interactionWidth: arrowGeometry.interactionWidth,
      rightToLeft: arrowGeometry.rightToLeft,
      originLayers: arrowGeometry.originLayers,
      sourceLayers: arrowGeometry.sourceLayers,
      targetLayers: arrowGeometry.targetLayers,
    },
  };
}

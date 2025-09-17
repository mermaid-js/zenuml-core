import { OwnableMessageType } from "@/parser/OwnableMessage";
import type { CodeRange } from "@/parser/CodeRange";
import { calculateArrowGeometry } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/arrowGeometry";
import type { Coordinates } from "@/positioning/Coordinates";

export type MessageVM = {
  id: string;
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
    return {
      id: `${m.from ?? ""}->${m.to ?? ""}:${m.signature}:${m.type}:${i}`,
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
  overrides?: { source?: string; target?: string },
): MessageVM {
  if (!vm) return vm;

  const source = overrides?.source ?? vm.source ?? vm.from ?? origin;
  const target = overrides?.target ?? vm.to ?? source;

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

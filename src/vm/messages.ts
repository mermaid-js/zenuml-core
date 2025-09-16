import { OwnableMessageType } from "@/parser/OwnableMessage";
import type { CodeRange } from "@/parser/CodeRange";

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
  };
};

export function buildMessagesVM(messages: Array<any>): MessageVM[] {
  return messages.map((m, i) => {
    const source = m.providedFrom ?? m.from;
    const to = m.to;
    const isSelf = typeof source === "string" && typeof to === "string" && source === to;
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

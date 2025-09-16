import { OwnableMessageType } from "@/parser/OwnableMessage";

export type MessageVM = {
  id: string;
  type: OwnableMessageType;
  from?: string;
  to?: string;
  signature: string;
  // Inclusive label range for inline editing, when available
  labelRange?: [number, number] | null;
  // Optional comment text (not styling)
  comment?: string | null;
};

export function buildMessagesVM(messages: Array<any>): MessageVM[] {
  return messages.map((m, i) => ({
    id: `${m.from ?? ""}->${m.to ?? ""}:${m.signature}:${m.type}:${i}`,
    type: m.type,
    from: m.from,
    to: m.to,
    signature: m.signature,
    labelRange: m.labelRange ?? null,
    comment: m.comment ?? null,
  }));
}


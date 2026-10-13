import { specialCharRegex } from "@/utils/messageNormalizers";

export type ParticipantUpdates = {
  color?: string | null; // null = remove color
  type?: string | null; // null = remove type
  stereotype?: string | null; // null = remove <<stereotype>>
  label?: string | null; // null = remove `as Label`
};

// Parse-tree text comes back with quotes stripped (`getFormattedText`), so any
// token that needs them must be re-quoted before it is written back.
const quoteIfNeeded = (text: string) => {
  if (!specialCharRegex.test(text)) return text;
  specialCharRegex.lastIndex = 0;
  return `"${text.replace(/"/g, "")}"`;
};

export const formatParticipantDeclaration = (participant: {
  name: string;
  label?: string | null;
  type?: string | null;
  stereotype?: string | null;
  color?: string | null;
  emoji?: string;
  width?: string;
}): string => {
  const parts: string[] = [];
  if (participant.type) parts.push(`@${participant.type}`);
  if (participant.stereotype)
    parts.push(`<<${quoteIfNeeded(participant.stereotype)}>>`);
  if (participant.emoji) parts.push(`[${participant.emoji}]`);
  parts.push(quoteIfNeeded(participant.name));
  if (participant.width) parts.push(participant.width);
  if (participant.label && participant.label !== participant.name)
    parts.push(`as ${quoteIfNeeded(participant.label)}`);
  if (participant.color) parts.push(participant.color);
  return parts.join(" ");
};

const getParticipantCtx = (rootContext: any, name: string) => {
  const participants: any[] = rootContext?.head?.()?.participant?.() ?? [];
  return participants.find((ctx: any) => {
    const ctxName = ctx?.name()?.getFormattedText();
    return ctxName === name || ctxName === name.split(":")[1];
  });
};

export type ParticipantDeclaration = {
  name: string;
  type?: string;
  stereotype?: string;
  emoji?: string;
  width?: string;
  label?: string;
  color?: string;
};

export const readParticipantDeclaration = (
  rootContext: any,
  participantName: string,
): ParticipantDeclaration | null => {
  const ctx = getParticipantCtx(rootContext, participantName);
  if (!ctx) return null;
  return {
    name: ctx.name()?.getFormattedText(),
    type:
      ctx.participantType?.()?.getFormattedText()?.replace("@", "") ??
      undefined,
    stereotype: ctx.stereotype?.()?.name?.()?.getFormattedText() ?? undefined,
    emoji: ctx.emoji?.()?.name?.()?.getFormattedText() ?? undefined,
    width: ctx.width?.()?.getFormattedText() ?? undefined,
    label: ctx.label?.()?.name?.()?.getFormattedText() ?? undefined,
    color: ctx.COLOR?.()?.getText() ?? undefined,
  };
};

export const setParticipantStyleInDsl = (
  code: string,
  rootContext: any,
  participantName: string,
  updates: ParticipantUpdates,
): string => {
  const ctx = getParticipantCtx(rootContext, participantName);
  const existing = readParticipantDeclaration(rootContext, participantName);
  if (!ctx || !existing) return code;

  const pick = <K extends keyof ParticipantUpdates>(key: K) =>
    key in updates ? (updates[key] ?? undefined) : existing[key];

  const newDeclaration = formatParticipantDeclaration({
    name: existing.name,
    emoji: existing.emoji,
    width: existing.width,
    type: pick("type"),
    stereotype: pick("stereotype"),
    label: pick("label"),
    color: pick("color"),
  });

  const start = ctx.start.start;
  const end = ctx.stop.stop + 1;
  return code.slice(0, start) + newDeclaration + code.slice(end);
};

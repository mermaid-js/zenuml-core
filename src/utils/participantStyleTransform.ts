type ParticipantUpdates = {
  color?: string | null;   // null = remove color
  type?: string | null;    // null = remove type
};

const formatParticipantDeclaration = (participant: {
  name: string;
  label?: string;
  type?: string | null;
  stereotype?: string;
  color?: string | null;
  emoji?: string;
}): string => {
  const parts: string[] = [];
  if (participant.type) parts.push(`@${participant.type}`);
  if (participant.stereotype) parts.push(`<<${participant.stereotype}>>`);
  if (participant.emoji) parts.push(`[${participant.emoji}]`);
  parts.push(participant.name);
  if (participant.label && participant.label !== participant.name)
    parts.push(`as ${participant.label}`);
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

export const setParticipantStyleInDsl = (
  code: string,
  rootContext: any,
  participantName: string,
  updates: ParticipantUpdates,
): string => {
  const ctx = getParticipantCtx(rootContext, participantName);
  if (!ctx) return code;

  const existingType = ctx?.participantType()?.getFormattedText()?.replace("@", "") ?? undefined;
  const existingColor = ctx?.COLOR?.()?.getText() ?? undefined;
  const existingLabel = ctx.label?.()?.name()?.getFormattedText();
  const existingStereotype = ctx.stereotype?.()?.name()?.getFormattedText();
  const existingEmoji = ctx.emoji?.()?.name?.()?.getFormattedText();

  const nextType = "type" in updates ? (updates.type ?? undefined) : existingType;
  const nextColor = "color" in updates ? (updates.color ?? undefined) : existingColor;

  const newDeclaration = formatParticipantDeclaration({
    name: ctx?.name()?.getFormattedText(),
    label: existingLabel,
    type: nextType,
    stereotype: existingStereotype,
    color: nextColor,
    emoji: existingEmoji,
  });

  const start = ctx.start.start;
  const end = ctx.stop.stop + 1;
  return code.slice(0, start) + newDeclaration + code.slice(end);
};

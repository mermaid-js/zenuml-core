import { parse } from "@/parser";

export type ParticipantUpdates = {
  color?: string | null; // null = remove color
  type?: string | null; // null = remove type
  stereotype?: string | null; // null = remove <<stereotype>>
  label?: string | null; // null = remove `as Label`
};

// Parse-tree text comes back with quotes stripped (`getFormattedText`), so any
// token that needs them must be re-quoted before it is written back.
const PLAIN_ID = /^[\p{L}_][\p{L}\p{Nd}_]*$/u;

const quoteIfNeeded = (text: string, force = false) =>
  !force && PLAIN_ID.test(text) ? text : `"${text.replace(/"/g, "")}"`;

export const formatParticipantDeclaration = (
  participant: {
    name: string;
    label?: string | null;
    type?: string | null;
    stereotype?: string | null;
    color?: string | null;
    emoji?: string;
    width?: string;
  },
  forceQuotes = false,
): string => {
  const parts: string[] = [];
  if (participant.type) parts.push(`@${participant.type}`);
  if (participant.stereotype)
    parts.push(`<<${quoteIfNeeded(participant.stereotype, forceQuotes)}>>`);
  if (participant.emoji) parts.push(`[${participant.emoji}]`);
  parts.push(quoteIfNeeded(participant.name));
  if (participant.width) parts.push(participant.width);
  if (participant.label && participant.label !== participant.name)
    parts.push(`as ${quoteIfNeeded(participant.label, forceQuotes)}`);
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

const buildStyle = (
  code: string,
  rootContext: any,
  participantName: string,
  updates: ParticipantUpdates,
  forceQuotes = false,
): string => {
  const ctx = getParticipantCtx(rootContext, participantName);
  const existing = readParticipantDeclaration(rootContext, participantName);
  if (!ctx || !existing) return code;

  const pick = <K extends keyof ParticipantUpdates>(key: K) =>
    key in updates ? (updates[key] ?? undefined) : existing[key];

  const newDeclaration = formatParticipantDeclaration(
    {
      name: existing.name,
      emoji: existing.emoji,
      width: existing.width,
      type: pick("type"),
      stereotype: pick("stereotype"),
      label: pick("label"),
      color: pick("color"),
    },
    forceQuotes,
  );

  const start = ctx.start.start;
  const end = ctx.stop.stop + 1;
  return code.slice(0, start) + newDeclaration + code.slice(end);
};

export type StyleResult = { code: string } | { error: string };

const squash = (text: string | undefined | null) =>
  (text ?? "").replace(/\s+/g, "");

/**
 * `setParticipantStyleInDsl` plus a round-trip check: the result is parsed and
 * the requested label and stereotype must read back unchanged. Values the
 * grammar cannot carry are reported instead of written as broken DSL.
 */
export const setParticipantStyleChecked = (
  code: string,
  rootContext: any,
  participantName: string,
  updates: ParticipantUpdates,
): StyleResult => {
  const verify = (next: string): StyleResult | null => {
    const read = readParticipantDeclaration(
      parse(next).rootContext,
      participantName,
    );
    if (!read) {
      return {
        error:
          "stereotype" in updates && updates.stereotype
            ? "Not a valid stereotype"
            : "label" in updates && updates.label
              ? "Not a valid display name"
              : "Could not apply the change",
      };
    }
    if ("label" in updates && squash(read.label) !== squash(updates.label)) {
      return { error: "Not a valid display name" };
    }
    if (
      "stereotype" in updates &&
      squash(read.stereotype) !== squash(updates.stereotype)
    ) {
      return { error: "Not a valid stereotype" };
    }
    return null;
  };

  const first = buildStyle(code, rootContext, participantName, updates);
  const firstError = verify(first);
  if (!firstError) return { code: first };

  const forced = buildStyle(code, rootContext, participantName, updates, true);
  if (!verify(forced)) return { code: forced };
  return firstError;
};

/** Like `setParticipantStyleChecked`, but returns the input unchanged on failure. */
export const setParticipantStyleInDsl = (
  code: string,
  rootContext: any,
  participantName: string,
  updates: ParticipantUpdates,
): string => {
  const result = setParticipantStyleChecked(
    code,
    rootContext,
    participantName,
    updates,
  );
  return "code" in result ? result.code : code;
};

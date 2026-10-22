import {
  DECLARATION_KEYS,
  parseNotWorse,
  safeParse,
  sameDeclaration,
} from "./dslRoundTrip";

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

const rawOf = (code: string, ctx: any): string | undefined =>
  ctx?.start && ctx?.stop
    ? code.slice(ctx.start.start, ctx.stop.stop + 1)
    : undefined;

// Untouched attributes keep their original source spelling (quotes included);
// only attributes named in `updates` are re-formatted.
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

  const parts: string[] = [];
  const touched = (key: keyof ParticipantUpdates) => key in updates;
  const type = touched("type") ? (updates.type ?? undefined) : existing.type;
  if (type) parts.push(`@${type}`);

  if (touched("stereotype")) {
    if (updates.stereotype)
      parts.push(`<<${quoteIfNeeded(updates.stereotype, forceQuotes)}>>`);
  } else if (existing.stereotype) {
    const raw = rawOf(code, ctx.stereotype?.()?.name?.());
    parts.push(`<<${raw ?? quoteIfNeeded(existing.stereotype)}>>`);
  }

  if (existing.emoji)
    parts.push(`[${rawOf(code, ctx.emoji?.()?.name?.()) ?? existing.emoji}]`);
  parts.push(rawOf(code, ctx.name()) ?? quoteIfNeeded(existing.name));
  if (existing.width) parts.push(rawOf(code, ctx.width?.()) ?? existing.width);

  if (touched("label")) {
    if (updates.label && updates.label !== existing.name)
      parts.push(`as ${quoteIfNeeded(updates.label, forceQuotes)}`);
  } else if (existing.label) {
    const raw = rawOf(code, ctx.label?.()?.name?.());
    parts.push(`as ${raw ?? quoteIfNeeded(existing.label)}`);
  }

  if (touched("color")) {
    if (updates.color) parts.push(updates.color);
  } else if (existing.color) {
    parts.push(existing.color);
  }

  const start = ctx.start.start;
  const end = ctx.stop.stop + 1;
  return code.slice(0, start) + parts.join(" ") + code.slice(end);
};

export type StyleResult = { code: string } | { error: string };

/**
 * `setParticipantStyleInDsl` plus a round-trip check: the result must parse
 * (or not add parse errors to an already broken input) and read back as the
 * full expected declaration, so untouched attributes cannot be corrupted.
 * Values the grammar cannot carry are reported instead of written as broken DSL.
 */
export const setParticipantStyleChecked = (
  code: string,
  rootContext: any,
  participantName: string,
  updates: ParticipantUpdates,
): StyleResult => {
  const before = readParticipantDeclaration(rootContext, participantName);
  const base = safeParse(code);

  const expected = (): ParticipantDeclaration | null => {
    if (!before) return null;
    const next: ParticipantDeclaration = { ...before };
    for (const key of ["type", "stereotype", "label", "color"] as const) {
      if (key in updates) next[key] = updates[key] ? updates[key]! : undefined;
    }
    if ("label" in updates && next.label === next.name) next.label = undefined;
    return next;
  };

  const verify = (next: string): StyleResult | null => {
    const failure = (): StyleResult => ({
      error:
        "stereotype" in updates && updates.stereotype
          ? "Not a valid stereotype"
          : "label" in updates && updates.label
            ? "Not a valid display name"
            : "Could not apply the change",
    });
    const parsed = safeParse(next);
    if (!parsed || !parseNotWorse(base, parsed)) return failure();
    const read = readParticipantDeclaration(
      parsed.rootContext,
      participantName,
    );
    const want = expected();
    if (!read || !want) return failure();
    if (!sameDeclaration(read, want, ["name", ...DECLARATION_KEYS])) {
      return failure();
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

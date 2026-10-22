import type { Participant } from "@/parser/Participants";

/**
 * A participant in display order: the plain `ToValue()` data of a parsed
 * participant, plus the name of the participant to its left ("" for the first).
 * The fields are declared once, on `Participant`.
 *
 * `isStarter` is the parsed flag (a participant named by `@Starter(X)`, or the
 * injected default starter). The implicit default starter is the entry named
 * `_STARTER_`.
 */
export type IParticipantModel = Readonly<
  ReturnType<Participant["ToValue"]> & { left: string }
>;

/** The label if there is one, otherwise the name. */
export function participantDisplayName(p: IParticipantModel): string {
  return p.label || p.name;
}

/** Only participants with a defined type have icons. */
export function participantHasIcon(p: IParticipantModel): boolean {
  return p.type !== undefined;
}

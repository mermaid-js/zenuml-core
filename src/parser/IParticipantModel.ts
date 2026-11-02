import type { Participant } from "@/parser/Participants";
import { hasIconFor } from "@/components/DiagramFrame/Tutorial/IconKeys";

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

/** Only participants whose type has an icon reserve an icon slot (#661). */
export function participantHasIcon(p: IParticipantModel): boolean {
  return hasIconFor(p.type);
}

import { _STARTER_ } from "@/constants";
import { Participants } from "@/parser";

/**
 * Returns the names of the local participants.
 * Given the following code:
 * A B C.method { D->E.method }
 * The local participants of
 * D.method { E.method }: [_STARTER_, D, E]
 * E.method:              [D, E]
 * @param ctx
 */
export function getLocalParticipantNames(ctx: any): string[] {
  return [ctx.Origin() || _STARTER_, ...Participants(ctx).Names()];
}

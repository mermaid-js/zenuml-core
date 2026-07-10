import sequenceParser from "@/generated-parser/sequenceParser";
import { centerOf, distance2 } from "./utils";
import Anchor2 from "@/positioning/Anchor2";
import { coordinatesAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import type { AugmentedContext } from "@/parser/AntlrTypes";

// Owner/From are installed on MessageContext/CreationContext's prototypes at
// runtime (see src/parser/Owner.js, src/parser/From.ts) — TS's inference for
// the ANTLR-generated classes doesn't see prototype patches applied from
// another file (see AntlrTypes.AugmentedContext's doc comment), so narrowed
// context values are cast to this shape at each call site below instead.
interface OwnedContext extends AugmentedContext {
  Owner(): string | undefined;
  From(): string | undefined;
}

const matchesImplicitStarterSelf = (ctx: any, participant: string) => {
  return (
    participant === _STARTER_ &&
    ctx instanceof sequenceParser.MessageContext &&
    (ctx as unknown as OwnedContext).Owner?.() === undefined &&
    (ctx as unknown as OwnedContext).From?.() === undefined
  );
};

export const depthOnParticipant = (context: any, participant: any): number => {
  return context?.getAncestors((ctx: any) => {
    const isSync = (ctx: any) => {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    };
    if (isSync(ctx)) {
      return (
        (ctx as unknown as OwnedContext).Owner?.() === participant ||
        matchesImplicitStarterSelf(ctx, participant)
      );
    }
    return false;
  }).length;
};

const depthOnParticipant4Stat = (context: any, participant: any): number => {
  if (!(context instanceof sequenceParser.StatContext)) {
    return 0;
  }

  // `children` is a real antlr4 runtime field that @types/antlr4 omits from
  // its declarations (see AntlrTypes.ts / antlr4/context/ParserRuleContext.js).
  const stat = context as { children?: unknown[] | null };
  const child = stat.children?.[0];
  if (!child) {
    return 0;
  }
  return depthOnParticipant(child, participant);
};

export const useArrow = ({
  context,
  origin,
  source,
  target,
}: {
  context: any;
  origin: string;
  source: string;
  target: string;
}) => {
  const coordinates = useAtomValue(coordinatesAtom);

  // Pure derivation from the parse-tree context and coordinates; the ancestor
  // walks and anchor math don't need to re-run on unrelated re-renders.
  return useMemo(() => {
    const isSelf = source === target;

    const originLayers = depthOnParticipant(context, origin);

    const sourceLayers = depthOnParticipant(context, source);

    const targetLayers = depthOnParticipant4Stat(context, target);

    const anchor2Origin = new Anchor2(
      centerOf(coordinates, origin),
      originLayers,
    );

    const anchor2Source = new Anchor2(
      centerOf(coordinates, source),
      sourceLayers,
    );

    const anchor2Target = new Anchor2(
      centerOf(coordinates, target),
      targetLayers,
    );

    const interactionWidth = Math.abs(anchor2Source.edgeOffset(anchor2Target));

    const rightToLeft = distance2(coordinates, source, target) < 0;

    const translateX = anchor2Origin.centerToEdge(
      !rightToLeft ? anchor2Source : anchor2Target,
    );

    return {
      isSelf,
      originLayers,
      sourceLayers,
      targetLayers,
      anchor2Origin,
      anchor2Source,
      anchor2Target,
      interactionWidth,
      rightToLeft,
      translateX,
    };
  }, [context, origin, source, target, coordinates]);
};

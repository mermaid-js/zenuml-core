import sequenceParser from "@/generated-parser/sequenceParser";
import { centerOf, distance2 } from "./utils";
import Anchor from "@/positioning/Anchor";
import { coordinatesAtom } from "@/store/Store";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { depthOnParticipant } from "@/parser/depthOnParticipant";

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

    const anchor2Origin = new Anchor(
      centerOf(coordinates, origin),
      originLayers,
    );

    const anchor2Source = new Anchor(
      centerOf(coordinates, source),
      sourceLayers,
    );

    const anchor2Target = new Anchor(
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

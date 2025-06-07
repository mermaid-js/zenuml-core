import sequenceParser from "@/generated-parser/sequenceParser";
import { centerOf, distance2 } from "./utils";
import Anchor2 from "@/positioning/Anchor2";

const depthOnParticipant = (context: any, participant: any): number => {
  return context?.getAncestors((ctx: any) => {
    const isSync = (ctx: any) => {
      const isMessageContext = ctx instanceof sequenceParser.MessageContext;
      const isCreationContext = ctx instanceof sequenceParser.CreationContext;
      return isMessageContext || isCreationContext;
    };
    if (isSync(ctx)) {
      return ctx.Owner() === participant;
    }
    return false;
  }).length;
};

const depthOnParticipant4Stat = (context: any, participant: any): number => {
  if (!(context instanceof sequenceParser.StatContext)) {
    return 0;
  }

  const child = context?.children?.[0];
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
  const isSelf = source === target;

  const originLayers = depthOnParticipant(context, origin);

  const sourceLayers = depthOnParticipant(context, source);

  const targetLayers = depthOnParticipant4Stat(context, target);

  const anchor2Origin = new Anchor2(centerOf(origin), originLayers);

  const anchor2Source = new Anchor2(centerOf(source), sourceLayers);

  const anchor2Target = new Anchor2(centerOf(target), targetLayers);

  const interactionWidth = Math.abs(anchor2Source.edgeOffset(anchor2Target));

  const rightToLeft = distance2(source, target) < 0;

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
};

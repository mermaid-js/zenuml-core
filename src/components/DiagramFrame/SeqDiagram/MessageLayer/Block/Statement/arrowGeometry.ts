import sequenceParser from "@/generated-parser/sequenceParser";
import { centerOf, distance2 } from "./utils";
import Anchor2 from "@/positioning/Anchor2";
import type { Coordinates } from "@/positioning/Coordinates";

export type ArrowInput = {
  context: any;
  origin: string;
  source: string;
  target: string;
  coordinates: Coordinates;
};

export type ArrowGeometry = {
  isSelf: boolean;
  originLayers: number;
  sourceLayers: number;
  targetLayers: number;
  interactionWidth: number;
  rightToLeft: boolean;
  translateX: number;
};

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

export const calculateArrowGeometry = ({
  context,
  origin,
  source,
  target,
  coordinates,
}: ArrowInput): ArrowGeometry => {
  const isSelf = source === target;

  const originLayers = depthOnParticipant(context, origin);

  const sourceLayers = depthOnParticipant(context, source);

  const targetLayers = depthOnParticipant4Stat(context, target);

  const anchor2Origin = new Anchor2(
    centerOf(coordinates, origin),
    originLayers,
    origin,
  );

  const anchor2Source = new Anchor2(
    centerOf(coordinates, source),
    sourceLayers,
    source,
  );

  const anchor2Target = new Anchor2(
    centerOf(coordinates, target),
    targetLayers,
    target,
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
    interactionWidth,
    rightToLeft,
    translateX,
  };
};
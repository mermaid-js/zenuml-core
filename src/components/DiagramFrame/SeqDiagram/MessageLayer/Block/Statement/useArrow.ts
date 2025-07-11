import { centerOf, distance2 } from "./utils";
import Anchor2 from "@/positioning/Anchor2";
import {
  depthOnParticipant,
  depthOnParticipant4Stat,
} from "@/parser/DepthCalculator";

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

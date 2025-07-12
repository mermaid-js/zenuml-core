import { centerOf, distance2 } from "./utils";
import Anchor2 from "@/positioning/Anchor2";
import { getParticipantDepthInfo } from "@/parser/DepthCalculator";

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

  const depthInfo = getParticipantDepthInfo(context, origin, source, target);

  const anchor2Origin = new Anchor2(centerOf(origin), depthInfo.origin.layers);

  const anchor2Source = new Anchor2(centerOf(source), depthInfo.source.layers);

  const anchor2Target = new Anchor2(centerOf(target), depthInfo.target.layers);

  const interactionWidth = Math.abs(anchor2Source.edgeOffset(anchor2Target));

  const rightToLeft = distance2(source, target) < 0;

  const translateX = anchor2Origin.centerToEdge(
    !rightToLeft ? anchor2Source : anchor2Target,
  );

  return {
    isSelf,
    originLayers: depthInfo.origin.layers,
    sourceLayers: depthInfo.source.layers,
    targetLayers: depthInfo.target.layers,
    anchor2Origin,
    anchor2Source,
    anchor2Target,
    interactionWidth,
    rightToLeft,
    translateX,
  };
};

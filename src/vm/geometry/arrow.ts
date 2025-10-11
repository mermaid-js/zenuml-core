import Anchor2 from "@/positioning/Anchor2";
import { centerOf, distance2 } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import type { Coordinates } from "@/positioning/Coordinates";
import type { ArrowGeometry } from "@/vm/types";
import { calculateLayersFromStatement } from "./layer-calculator";

export interface ArrowGeometryService {
  calculate(origin: string, coordinates: Coordinates, statement: any): ArrowGeometry;
}

export function createArrowGeometryService(): ArrowGeometryService {
  const calculate = (origin: string, coordinates: Coordinates, statement: any): ArrowGeometry => {
    const effectiveFrom = statement?.from || origin;
    const effectiveTo = statement?.to || effectiveFrom;
    // Always calculate layers from statement hierarchy
    const originLayers = calculateLayersFromStatement(statement.parent, origin);
    const sourceLayers = calculateLayersFromStatement(statement.parent, effectiveFrom);
    const targetLayers = calculateLayersFromStatement(statement, effectiveTo);
    console.log('[origin] 13', statement.signature, origin, originLayers, sourceLayers, targetLayers);
    const anchorOrigin = new Anchor2(
      centerOf(coordinates, origin),
      originLayers,
      origin,
    );

    const anchorSource = new Anchor2(
      centerOf(coordinates, effectiveFrom),
      sourceLayers,
      effectiveFrom,
    );

    const anchorTarget = new Anchor2(
      centerOf(coordinates, effectiveTo),
      targetLayers,
      effectiveTo,
    );

    const rightToLeft = distance2(coordinates, effectiveFrom, effectiveTo) < 0;

    const interactionWidth = Math.abs(anchorSource.edgeOffset(anchorTarget));

    const translateX = anchorOrigin.centerToEdge(
      rightToLeft ? anchorTarget : anchorSource,
    );

    return {
      translateX,
      interactionWidth,
      rightToLeft,
      originLayers,
      sourceLayers,
      targetLayers,
    };
  };

  return {
    calculate,
  };
}

const arrowService = createArrowGeometryService();

export function calculateArrowGeometry(origin: string, coordinates: Coordinates, statement: any): ArrowGeometry {
  return arrowService.calculate(origin, coordinates, statement);
}

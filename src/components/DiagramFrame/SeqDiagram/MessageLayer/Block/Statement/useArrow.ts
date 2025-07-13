import { ArrowCalculator } from "@/layout/calculator/ArrowCalculator";
import { ArrowGeometryExtractor } from "@/layout/extractor/ArrowGeometryExtractor";
import { useMemo } from "react";

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
  // Extract geometric data from context (happens once per context change)
  const arrowGeometry = useMemo(() => 
    ArrowGeometryExtractor.extractArrowGeometry({
      context,
      origin,
      source,
      target,
    }), [context, origin, source, target]);

  // Pure mathematical calculation (can be cached and optimized)
  const arrowLayout = useMemo(() => {
    const calculator = new ArrowCalculator();
    return calculator.calculateArrowLayout(arrowGeometry);
  }, [arrowGeometry]);

  return arrowLayout;
};

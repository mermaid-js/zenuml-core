import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import store, { coordinatesAtom } from "@/store/Store";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { useEffect, useState, useMemo } from "react";
import { depthOnParticipant } from "../utils";
import { 
  calculateFragmentOffset, 
  generateFragmentTransform, 
  calculateFragmentPaddingLeft 
} from "@/positioning/GeometryUtils";

export const getLeftParticipant = (context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const localParticipants = getLocalParticipantNames(context);
  return allParticipants.find((p) => localParticipants.includes(p));
};

export const getBorder = (context: any) => {
  const allParticipants = store.get(coordinatesAtom).orderedParticipantNames();
  const frameBuilder = new FrameBuilder(allParticipants);
  const frame = frameBuilder.getFrame(context);
  return FrameBorder(frame);
};

/**
 * Pure mathematical fragment geometry extracted from context
 * Contains only the essential geometric parameters needed for positioning calculations
 */
interface FragmentGeometry {
  readonly leftParticipant: string;
  readonly localParticipants: readonly string[];
  readonly originLayers: number;
  readonly borderPadding: { left: number; right: number };
}

/**
 * Extracts pure geometric parameters from the God object (context)
 * Isolates the mathematical essence from the complex context object
 */
class FragmentGeometryExtractor {
  static extract(context: any, origin: string): FragmentGeometry {
    const coordinates = store.get(coordinatesAtom);
    const allParticipants = coordinates.orderedParticipantNames();
    const localParticipants = getLocalParticipantNames(context);
    const leftParticipant = allParticipants.find((p: string) => localParticipants.includes(p)) || "";
    
    const frameBuilder = new FrameBuilder(allParticipants);
    const frame = frameBuilder.getFrame(context);
    const border = FrameBorder(frame);
    
    return {
      leftParticipant,
      localParticipants,
      originLayers: depthOnParticipant(context, origin),
      borderPadding: { left: border.left, right: border.right },
    };
  }
}


/**
 * Simplified fragment coordinate transformer using unified mathematical model
 * Uses LayoutMath for all complex calculations, dramatically reducing code complexity
 */
class PureFragmentCoordinateTransform {
  private readonly geometry: FragmentGeometry;
  private readonly origin: string;
  private readonly coordinates: any; // Coordinates object - mathematically pure
  
  // Cached calculation results
  private _offsetX?: number;
  private _fragmentStyle?: any;

  constructor(geometry: FragmentGeometry, origin: string, coordinates: any) {
    this.geometry = geometry;
    this.origin = origin;
    this.coordinates = coordinates;
  }

  /**
   * Core mathematical transformation using unified LayoutMath
   * Replaces complex manual calculations with clean mathematical model
   */
  calculateOffsetX(): number {
    if (this._offsetX !== undefined) {
      return this._offsetX;
    }

    const { leftParticipant, borderPadding } = this.geometry;
    const borderDepth = borderPadding.left / 10; // Convert border to depth (FRAGMENT_PADDING_X = 10)
    
    // Use unified mathematical model - replaces 50+ lines of complex calculation
    this._offsetX = calculateFragmentOffset(leftParticipant, this.origin, borderDepth, this.coordinates);
    return this._offsetX;
  }

  generateFragmentStyle(totalWidth: number, minWidth: number): any {
    if (this._fragmentStyle !== undefined) {
      return this._fragmentStyle;
    }

    const { leftParticipant, borderPadding } = this.geometry;
    const borderDepth = borderPadding.left / 10; // Convert border to depth
    
    // Use unified mathematical model for transform generation
    const transform = generateFragmentTransform(leftParticipant, this.origin, borderDepth, this.coordinates);
    
    this._fragmentStyle = {
      transform: transform,
      width: `${totalWidth}px`,
      minWidth: `${minWidth}px`,
    };
    
    return this._fragmentStyle;
  }

  getPaddingLeft(): number {
    const { leftParticipant, borderPadding } = this.geometry;
    const borderDepth = borderPadding.left / 10; // Convert border to depth
    
    // Use unified mathematical model - replaces manual calculation
    return calculateFragmentPaddingLeft(leftParticipant, borderDepth, this.coordinates);
  }

  getLeftParticipant(): string {
    return this.geometry.leftParticipant;
  }

  getBorderPadding(): { left: number; right: number } {
    return this.geometry.borderPadding;
  }

  // Clear cached calculations
  invalidateCache(): void {
    this._offsetX = undefined;
    this._fragmentStyle = undefined;
  }
}

export const getOffsetX = (context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const leftParticipant = getLeftParticipant(context);
  const border = getBorder(context);
  const borderDepth = border.left / 10; // Convert border to depth
  
  // Use unified mathematical model directly
  return calculateFragmentOffset(leftParticipant || "", origin, borderDepth, coordinates);
};

export const getPaddingLeft = (context: any) => {
  const leftParticipant = getLeftParticipant(context);
  const border = getBorder(context);
  const borderDepth = border.left / 10; // Convert border to depth
  const coordinates = store.get(coordinatesAtom);
  
  // Use unified mathematical model directly
  return calculateFragmentPaddingLeft(leftParticipant || "", borderDepth, coordinates);
};

export const getFragmentStyle = (context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const leftParticipant = getLeftParticipant(context);
  const border = getBorder(context);
  const borderDepth = border.left / 10; // Convert border to depth
  
  // Use unified mathematical model for transform
  const transform = generateFragmentTransform(leftParticipant || "", origin, borderDepth, coordinates);
  const totalWidth = TotalWidth(context, coordinates);
  
  return {
    transform: transform,
    width: `${totalWidth}px`,
    minWidth: `${FRAGMENT_MIN_WIDTH}px`,
  };
};

export const useFragmentData = (context: any, origin: string) => {
  const [collapsed, setCollapsed] = useState(false);
  const coordinates = store.get(coordinatesAtom);
  
  // Extract pure geometric parameters from the God object
  const geometry = useMemo(() => {
    return FragmentGeometryExtractor.extract(context, origin);
  }, [context, origin]);
  
  // Create pure mathematical coordinate transformer
  const coordinateTransform = useMemo(() => {
    return new PureFragmentCoordinateTransform(geometry, origin, coordinates);
  }, [geometry, origin, coordinates]);

  const toggleCollapse = () => {
    setCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setCollapsed(false);
    // Invalidate cache when context changes to ensure fresh calculations
    coordinateTransform.invalidateCache();
  }, [context, coordinateTransform]);

  // Use pure mathematical calculations
  const paddingLeft = coordinateTransform.getPaddingLeft();
  const fragmentStyle = coordinateTransform.generateFragmentStyle(
    TotalWidth(context, coordinates),
    FRAGMENT_MIN_WIDTH
  );
  const border = coordinateTransform.getBorderPadding();
  const leftParticipant = coordinateTransform.getLeftParticipant();

  return {
    collapsed,
    toggleCollapse,
    paddingLeft,
    fragmentStyle,
    border,
    leftParticipant,
  };
};

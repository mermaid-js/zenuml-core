import { TotalWidth } from "@/components/DiagramFrame/SeqDiagram/WidthOfContext";
import FrameBuilder from "@/parser/FrameBuilder";
import FrameBorder from "@/positioning/FrameBorder";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import store, { coordinatesAtom } from "@/store/Store";
import { FRAGMENT_MIN_WIDTH } from "@/positioning/Constants";
import { useEffect, useState, useMemo } from "react";
import { depthOnParticipant } from "../utils";

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
 * Pure mathematical anchor point for activation bar layer calculations
 * Encapsulates the geometric transformation caused by occurrence bars
 */
class MathematicalAnchor {
  private readonly basePosition: number;
  private readonly layers: number;
  
  constructor(basePosition: number, layers: number) {
    this.basePosition = basePosition;
    this.layers = layers;
  }

  /**
   * Calculate effective center position considering activation bar layers
   * 
   * Mathematical formula:
   * effective_center = base_position + OCCURRENCE_BAR_SIDE_WIDTH * (layers - 1)
   */
  getEffectiveCenter(): number {
    if (this.layers <= 1) {
      return this.basePosition;
    }
    return this.basePosition + 7 * (this.layers - 1); // OCCURRENCE_BAR_SIDE_WIDTH = 7
  }

  /**
   * Calculate distance to another anchor point
   */
  distanceTo(other: MathematicalAnchor): number {
    return other.getEffectiveCenter() - this.getEffectiveCenter();
  }

  /**
   * Calculate center-to-center distance (equivalent to Anchor2.centerToCenter)
   */
  centerToCenter(other: MathematicalAnchor): number {
    return this.distanceTo(other);
  }
}

/**
 * Pure mathematical fragment coordinate transformer
 * Depends only on the Coordinates object (which is mathematically pure) and geometry parameters
 * No dependency on the God object (context)
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
   * Core mathematical transformation: calculate fragment offset in global coordinate system
   * 
   * Mathematical model:
   * offset = border_padding + participant_alignment + activation_layer_correction
   */
  calculateOffsetX(): number {
    if (this._offsetX !== undefined) {
      return this._offsetX;
    }

    const { leftParticipant, borderPadding } = this.geometry;
    const leftHalfWidth = this.coordinates.half(leftParticipant);
    
    // Base offset: border padding + left participant half width
    const baseOffset = borderPadding.left + leftHalfWidth;
    
    // If same participant, return base offset directly
    if (leftParticipant === this.origin || !this.origin) {
      console.debug(`Simple offset calculation - left participant: ${leftParticipant} ${leftHalfWidth}`);
      this._offsetX = baseOffset;
      return baseOffset;
    }
    
    // Cross-participant spatial transformation
    const spatialCorrection = this.calculateSpatialCorrection();
    const result = baseOffset + spatialCorrection;
    this._offsetX = result;
    return result;
  }

  /**
   * Calculate spatial correction caused by activation bar layers
   * 
   * Mathematical model:
   * correction = distance(left_anchor, origin_anchor_with_layers)
   */
  private calculateSpatialCorrection(): number {
    const { leftParticipant, originLayers } = this.geometry;
    
    // Get positions directly from coordinates object (mathematically pure)
    const leftPosition = this.coordinates.getPosition(leftParticipant) || 0;
    const originPosition = this.coordinates.getPosition(this.origin) || 0;
    
    // Create mathematical anchors for precise calculation
    const leftAnchor = new MathematicalAnchor(leftPosition, 0);
    const originAnchor = new MathematicalAnchor(originPosition, originLayers);
    
    return leftAnchor.distanceTo(originAnchor);
  }

  generateFragmentStyle(totalWidth: number, minWidth: number): any {
    if (this._fragmentStyle !== undefined) {
      return this._fragmentStyle;
    }

    const offsetX = this.calculateOffsetX();
    this._fragmentStyle = {
      transform: `translateX(${-(offsetX + 1)}px)`,
      width: `${totalWidth}px`,
      minWidth: `${minWidth}px`,
    };
    
    return this._fragmentStyle;
  }

  getPaddingLeft(): number {
    const { leftParticipant, borderPadding } = this.geometry;
    const leftHalfWidth = this.coordinates.half(leftParticipant);
    return borderPadding.left + leftHalfWidth;
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
  const geometry = FragmentGeometryExtractor.extract(context, origin);
  const transform = new PureFragmentCoordinateTransform(geometry, origin, coordinates);
  return transform.calculateOffsetX();
};

export const getPaddingLeft = (context: any) => {
  const halfLeftParticipant = store
    .get(coordinatesAtom)
    .half(getLeftParticipant(context) || "");
  return getBorder(context).left + halfLeftParticipant;
};

export const getFragmentStyle = (context: any, origin: string) => {
  const coordinates = store.get(coordinatesAtom);
  const geometry = FragmentGeometryExtractor.extract(context, origin);
  const transform = new PureFragmentCoordinateTransform(geometry, origin, coordinates);
  return transform.generateFragmentStyle(
    TotalWidth(context, coordinates),
    FRAGMENT_MIN_WIDTH
  );
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

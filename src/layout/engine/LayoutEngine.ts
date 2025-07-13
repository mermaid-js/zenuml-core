import Anchor2 from "@/positioning/Anchor2";
import { 
  LayoutGeometry, 
  ParticipantGeometry, 
  FragmentGeometry, 
  MessageGeometry,
  PositionMap,
  ActivationMap 
} from "../geometry/LayoutGeometry";
import { ArrowLayoutResult } from "../geometry/ArrowGeometry";

/**
 * Pure mathematical layout engine for ZenUML diagrams
 * Contains no dependencies on Context or parsing logic
 * All calculations are based on pre-extracted geometric data
 */
export class LayoutEngine {

  /**
   * Calculate anchor positions for all participants at all message indices
   * This is the core positioning calculation that other layouts depend on
   */
  calculateAnchors(geometry: LayoutGeometry): Map<string, Map<number, Anchor2>> {
    const anchors = new Map<string, Map<number, Anchor2>>();
    
    for (const participant of geometry.participants) {
      const participantAnchors = new Map<number, Anchor2>();
      
      // Calculate anchor for each message index
      for (let messageIndex = 0; messageIndex < geometry.metadata.totalMessages; messageIndex++) {
        const activationDepth = this.getActivationDepthAt(participant, messageIndex);
        const anchor = new Anchor2(participant.centerPosition, activationDepth);
        participantAnchors.set(messageIndex, anchor);
      }
      
      anchors.set(participant.name, participantAnchors);
    }
    
    return anchors;
  }

  /**
   * Calculate fragment boundaries and positioning
   */
  calculateFragmentBounds(
    fragment: FragmentGeometry, 
    anchors: Map<string, Map<number, Anchor2>>
  ): FragmentBounds {
    const participantAnchors = fragment.participants.map(name => 
      anchors.get(name)?.get(fragment.startMessageIndex)
    ).filter(Boolean) as Anchor2[];

    if (participantAnchors.length === 0) {
      throw new Error(`No anchors found for fragment ${fragment.id}`);
    }

    const leftAnchor = participantAnchors[0];
    const rightAnchor = participantAnchors[participantAnchors.length - 1];

    return {
      left: leftAnchor.leftEdgeOfRightWall(),
      right: rightAnchor.rightEdgeOfRightWall(),
      width: rightAnchor.centerToCenter(leftAnchor),
      offsetX: leftAnchor.centerOfRightWall(),
      paddingLeft: this.calculateFragmentPaddingLeft(leftAnchor),
      minWidth: this.calculateFragmentMinWidth(fragment)
    };
  }

  /**
   * Calculate arrow layout using the same logic as ArrowCalculator
   * but integrated with the unified geometry model
   */
  calculateArrowLayout(
    message: MessageGeometry,
    originParticipant: string,
    anchors: Map<string, Map<number, Anchor2>>,
    geometry: LayoutGeometry
  ): ArrowLayoutResult {
    const originAnchor = anchors.get(originParticipant)?.get(message.index);
    const sourceAnchor = anchors.get(message.source)?.get(message.index);
    const targetAnchor = anchors.get(message.target)?.get(message.index);

    if (!originAnchor || !sourceAnchor || !targetAnchor) {
      throw new Error(`Missing anchors for message ${message.id}`);
    }

    const interactionWidth = Math.abs(sourceAnchor.edgeOffset(targetAnchor));
    const rightToLeft = this.isRightToLeft(message.source, message.target, anchors, message.index);
    const translateX = originAnchor.centerToEdge(!rightToLeft ? sourceAnchor : targetAnchor);

    // Get layer counts from geometry data
    const originLayers = this.getActivationDepthAt(
      geometry.participants.find(p => p.name === originParticipant)!, 
      message.index
    );
    const sourceLayers = this.getActivationDepthAt(
      geometry.participants.find(p => p.name === message.source)!, 
      message.index
    );
    const targetLayers = this.getActivationDepthAt(
      geometry.participants.find(p => p.name === message.target)!, 
      message.index
    );

    return {
      interactionWidth,
      rightToLeft,
      translateX,
      isSelf: message.isSelfCall,
      originLayers,
      sourceLayers,
      targetLayers,
    };
  }

  /**
   * Calculate complete layout for the entire diagram
   */
  calculateCompleteLayout(geometry: LayoutGeometry): DiagramLayout {
    const anchors = this.calculateAnchors(geometry);
    
    const fragmentBounds = geometry.fragments.map(fragment => ({
      fragmentId: fragment.id,
      bounds: this.calculateFragmentBounds(fragment, anchors)
    }));

    const arrowLayouts = geometry.messages.map(message => ({
      messageId: message.id,
      layout: this.calculateArrowLayout(message, message.source, anchors, geometry) // Pass geometry for layer calculations
    }));

    return {
      anchors,
      fragmentBounds,
      arrowLayouts,
      metadata: geometry.metadata
    };
  }

  // Private helper methods

  private getActivationDepthAt(participant: ParticipantGeometry, messageIndex: number): number {
    const layer = participant.activationStack.find(layer => layer.messageIndex === messageIndex);
    return layer?.depth || 0;
  }

  private calculateFragmentPaddingLeft(leftAnchor: Anchor2): number {
    // Fragment padding calculation logic
    return leftAnchor.centerOfRightWall() + 10; // FRAGMENT_PADDING_X
  }

  private calculateFragmentMinWidth(fragment: FragmentGeometry): number {
    return 100; // FRAGMENT_MIN_WIDTH constant
  }

  private isRightToLeft(
    source: string, 
    target: string, 
    anchors: Map<string, Map<number, Anchor2>>,
    messageIndex: number
  ): boolean {
    const sourceAnchor = anchors.get(source)?.get(messageIndex);
    const targetAnchor = anchors.get(target)?.get(messageIndex);
    
    if (!sourceAnchor || !targetAnchor) return false;
    
    return targetAnchor.centerOfRightWall() < sourceAnchor.centerOfRightWall();
  }

  private getAnchorLayers(anchor: Anchor2): number {
    // This is a temporary implementation - in a real scenario we'd need 
    // to expose the layers property from Anchor2 or store it separately
    return 0; // Placeholder - would need access to anchor's layer count
  }
}

/**
 * Result interfaces for layout calculations
 */
export interface FragmentBounds {
  readonly left: number;
  readonly right: number;
  readonly width: number;
  readonly offsetX: number;
  readonly paddingLeft: number;
  readonly minWidth: number;
}

export interface DiagramLayout {
  readonly anchors: Map<string, Map<number, Anchor2>>;
  readonly fragmentBounds: Array<{
    fragmentId: string;
    bounds: FragmentBounds;
  }>;
  readonly arrowLayouts: Array<{
    messageId: string;
    layout: ArrowLayoutResult;
  }>;
  readonly metadata: any;
}
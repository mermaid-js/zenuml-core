import { 
  LayoutGeometry, 
  ParticipantGeometry, 
  MessageGeometry, 
  FragmentGeometry,
  DiagramMetadata,
  ActivationLayer,
  MessageType,
  FragmentType
} from "../geometry/LayoutGeometry";
import { centerOf, depthOnParticipant } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import store, { coordinatesAtom } from "@/store/Store";

/**
 * Extracts complete geometric data from ANTLR context
 * This is the only class that should directly interact with context objects
 * All mathematical calculations should use the extracted LayoutGeometry
 */
export class LayoutGeometryExtractor {

  /**
   * Main extraction method - converts Context to pure geometric data
   * This replaces all the scattered context-dependent calculations
   */
  static extractFromContext(rootContext: any): LayoutGeometry {
    const coordinates = store.get(coordinatesAtom);
    
    const participants = this.extractParticipants(coordinates);
    const messages = this.extractMessages(rootContext);
    const fragments = this.extractFragments(rootContext);
    const metadata = this.extractMetadata(participants, messages, fragments);

    return {
      participants,
      messages,
      fragments,
      metadata
    };
  }

  /**
   * Extract all participant geometric data
   */
  private static extractParticipants(coordinates: any): ParticipantGeometry[] {
    const participantNames = coordinates.orderedParticipantNames();
    
    return participantNames.map((name: string) => {
      const centerPosition = coordinates.getPosition(name) || 0;
      const width = coordinates.width(name) || 0;
      const labelWidth = coordinates.labelWidth(name) || 0;
      
      // For now, we'll calculate activation stack separately
      // This could be optimized by doing a single context traversal
      const activationStack: ActivationLayer[] = [];
      
      return {
        name,
        centerPosition,
        width,
        labelWidth,
        activationStack
      };
    });
  }

  /**
   * Extract all message geometric data
   */
  private static extractMessages(rootContext: any): MessageGeometry[] {
    const messages: MessageGeometry[] = [];
    let messageIndex = 0;

    // This would need to traverse the context tree to find all messages
    // For now, we'll create a simplified version
    this.traverseForMessages(rootContext, (messageContext: any) => {
      const message = this.extractSingleMessage(messageContext, messageIndex++);
      if (message) {
        messages.push(message);
      }
    });

    return messages;
  }

  /**
   * Extract geometric data for a single message
   */
  private static extractSingleMessage(messageContext: any, index: number): MessageGeometry | null {
    try {
      const source = messageContext.From?.() || "_STARTER_";
      const target = messageContext.Owner?.() || "_STARTER_";
      const signatureText = messageContext.SignatureText?.();
      
      let type: MessageType = 'sync';
      if (messageContext.parent?.asyncMessage) type = 'async';
      if (messageContext.parent?.creation) type = 'creation';
      if (messageContext.parent?.ret) type = 'return';

      return {
        index,
        id: `message_${index}`,
        type,
        source,
        target,
        isSelfCall: source === target,
        signatureText
      };
    } catch (error) {
      console.warn(`Failed to extract message at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Extract all fragment geometric data
   */
  private static extractFragments(rootContext: any): FragmentGeometry[] {
    const fragments: FragmentGeometry[] = [];
    let fragmentIndex = 0;

    this.traverseForFragments(rootContext, (fragmentContext: any) => {
      const fragment = this.extractSingleFragment(fragmentContext, fragmentIndex++);
      if (fragment) {
        fragments.push(fragment);
      }
    });

    return fragments;
  }

  /**
   * Extract geometric data for a single fragment
   */
  private static extractSingleFragment(fragmentContext: any, index: number): FragmentGeometry | null {
    try {
      let type: FragmentType = 'opt';
      if (fragmentContext.alt?.()) type = 'alt';
      if (fragmentContext.loop?.()) type = 'loop';
      if (fragmentContext.par?.()) type = 'par';
      if (fragmentContext.critical?.()) type = 'critical';
      if (fragmentContext.ref?.()) type = 'ref';
      if (fragmentContext.section?.()) type = 'section';
      if (fragmentContext.tcf?.()) type = 'tcf';

      const participants = getLocalParticipantNames(fragmentContext);

      return {
        id: `fragment_${index}`,
        type,
        startMessageIndex: 0, // Would need proper calculation
        endMessageIndex: 0,   // Would need proper calculation  
        participants,
        nestedFragments: [], // Would need recursive extraction
        condition: this.extractFragmentCondition(fragmentContext, type)
      };
    } catch (error) {
      console.warn(`Failed to extract fragment at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Extract fragment condition text
   */
  private static extractFragmentCondition(fragmentContext: any, type: FragmentType): string | undefined {
    try {
      switch (type) {
        case 'alt':
          return fragmentContext.alt?.()?.ifBlock?.()?.parExpr?.()?.condition?.()?.getText?.();
        case 'loop':
          return fragmentContext.loop?.()?.parExpr?.()?.condition?.()?.getText?.();
        default:
          return undefined;
      }
    } catch {
      return undefined;
    }
  }

  /**
   * Extract diagram metadata
   */
  private static extractMetadata(
    participants: ParticipantGeometry[], 
    messages: MessageGeometry[], 
    fragments: FragmentGeometry[]
  ): DiagramMetadata {
    return {
      totalMessages: messages.length,
      totalParticipants: participants.length,
      maxActivationDepth: this.calculateMaxActivationDepth(participants),
      hasFragments: fragments.length > 0,
      diagramWidth: this.calculateDiagramWidth(participants),
      diagramHeight: this.calculateDiagramHeight(messages)
    };
  }

  // Helper methods for traversal

  private static traverseForMessages(context: any, callback: (messageContext: any) => void) {
    // Simplified traversal - would need proper implementation
    if (context?.message?.()) {
      callback(context.message());
    }
    
    // Recursive traversal for child contexts
    if (context?.children) {
      for (const child of context.children) {
        this.traverseForMessages(child, callback);
      }
    }
  }

  private static traverseForFragments(context: any, callback: (fragmentContext: any) => void) {
    // Check for fragment types
    const fragmentTypes = ['alt', 'opt', 'loop', 'par', 'critical', 'ref', 'section', 'tcf'];
    
    for (const type of fragmentTypes) {
      if (context?.[type]?.()) {
        callback(context);
        break;
      }
    }
    
    // Recursive traversal
    if (context?.children) {
      for (const child of context.children) {
        this.traverseForFragments(child, callback);
      }
    }
  }

  // Helper calculation methods

  private static calculateMaxActivationDepth(participants: ParticipantGeometry[]): number {
    return participants.reduce((max, p) => 
      Math.max(max, p.activationStack.reduce((maxDepth, layer) => 
        Math.max(maxDepth, layer.depth), 0)), 0);
  }

  private static calculateDiagramWidth(participants: ParticipantGeometry[]): number {
    if (participants.length === 0) return 0;
    
    const rightmost = participants.reduce((max, p) => 
      Math.max(max, p.centerPosition + p.width / 2), 0);
    const leftmost = participants.reduce((min, p) => 
      Math.min(min, p.centerPosition - p.width / 2), Infinity);
      
    return rightmost - leftmost;
  }

  private static calculateDiagramHeight(messages: MessageGeometry[]): number {
    // Simplified calculation - would need proper message spacing logic
    return messages.length * 50; // Assuming 50px per message
  }
}
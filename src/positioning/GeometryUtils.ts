/**
 * Geometric calculation utility functions
 * Simplified utility functions based on new mathematical model, gradually replacing complex implementations in utils.ts
 */

import { ParticipantGeometryExtractor } from "./ParticipantGeometryExtractor";
import { Coordinates } from "./Coordinates";
import store, { coordinatesAtom } from "@/store/Store";
import { LayoutMath } from "./LayoutMath";

/**
 * Get participant center position (based on new mathematical model)
 * This is a simplified replacement for the centerOf function
 * @param participantName Participant name
 * @param coordinates Optional coordinates object, if not provided, get from store
 * @returns Center position
 */
export function getParticipantCenter(participantName: string, coordinates?: Coordinates): number {
  if (!participantName) {
    console.error("[@zenuml/core] getParticipantCenter: participantName is undefined");
    return 0;
  }

  try {
    const coords = coordinates || store.get(coordinatesAtom);
    const extractor = new ParticipantGeometryExtractor(coords);
    const geometry = extractor.extractParticipant(participantName);
    return geometry.centerPosition;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calculate distance between two participants (based on new mathematical model)
 * This is a simplified replacement for the distance function
 * @param from Starting participant
 * @param to Target participant
 * @param coordinates Optional coordinates object, if not provided, get from store
 * @returns Distance (from to to direction)
 */
export function calculateParticipantDistance(from: string, to: string, coordinates?: Coordinates): number {
  return getParticipantCenter(from, coordinates) - getParticipantCenter(to, coordinates);
}

/**
 * Calculate distance between two participants (based on new mathematical model)
 * This is a simplified replacement for the distance2 function
 * @param from Starting participant
 * @param to Target participant
 * @param coordinates Optional coordinates object, if not provided, get from store
 * @returns Distance (to to from direction)
 */
export function calculateParticipantDistance2(from: string, to: string, coordinates?: Coordinates): number {
  if (!from || !to) return 0;
  return getParticipantCenter(to, coordinates) - getParticipantCenter(from, coordinates);
}

/**
 * Calculate fragment context total width using new mathematical model
 * @param leftParticipant Leftmost participant name
 * @param rightParticipant Rightmost participant name
 * @param borderDepth Border depth from frame border
 * @param extraWidth Extra width (e.g. from self messages)
 * @param coordinates Optional coordinates object
 * @returns Fragment context total width
 */
export function calculateFragmentContextWidth(
  leftParticipant: string,
  rightParticipant: string,
  borderDepth: number,
  extraWidth: number = 0,
  coordinates?: Coordinates
): number {
  try {
    const coords = coordinates || store.get(coordinatesAtom);
    const extractor = new ParticipantGeometryExtractor(coords);
    
    const leftGeometry = extractor.extractParticipant(leftParticipant);
    const rightGeometry = extractor.extractParticipant(rightParticipant);
    
    return LayoutMath.fragmentContextTotalWidth(leftGeometry, rightGeometry, borderDepth, extraWidth);
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calculate extra width due to self messages using new mathematical model
 * @param selfMessages Array of self messages (OwnableMessage type)
 * @param rightParticipant Rightmost participant name
 * @param coordinates Optional coordinates object
 * @returns Maximum extra width needed for self messages
 */
export function calculateSelfMessageExtraWidth(
  selfMessages: any[],
  rightParticipant: string,
  coordinates?: Coordinates
): number {
  try {
    const coords = coordinates || store.get(coordinatesAtom);
    const extractor = new ParticipantGeometryExtractor(coords);
    const rightGeometry = extractor.extractParticipant(rightParticipant);
    
    // Convert OwnableMessage objects to MessageGeometry objects
    const messageGeometries = selfMessages.map(message => {
      const fromName = message.from || "_STARTER_";
      const toName = message.to || "_STARTER_";
      
      const fromGeometry = extractor.extractParticipant(fromName);
      const toGeometry = extractor.extractParticipant(toName);
      const textWidth = coords.getMessageWidth(message);
      
      return {
        from: fromGeometry,
        to: toGeometry,
        textWidth: textWidth,
        messageType: message.type === 2 ? "creation" : "normal"
      };
    });
    
    return LayoutMath.selfMessageExtraWidth(messageGeometries, rightGeometry);
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calculate fragment offset using new mathematical model
 * @param leftParticipant Leftmost participant name
 * @param originParticipant Origin participant name (can be null)
 * @param borderDepth Border depth
 * @param coordinates Optional coordinates object
 * @returns Fragment offset for CSS transform
 */
export function calculateFragmentOffset(
  leftParticipant: string,
  originParticipant: string | null,
  borderDepth: number,
  coordinates?: Coordinates
): number {
  try {
    const coords = coordinates || store.get(coordinatesAtom);
    const extractor = new ParticipantGeometryExtractor(coords);
    
    const leftGeometry = extractor.extractParticipant(leftParticipant);
    const originGeometry = originParticipant ? extractor.extractParticipant(originParticipant) : null;
    
    return LayoutMath.fragmentOffset(leftGeometry, originGeometry, borderDepth);
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Generate fragment CSS transform using new mathematical model
 * @param leftParticipant Leftmost participant name
 * @param originParticipant Origin participant name (can be null)
 * @param borderDepth Border depth
 * @param coordinates Optional coordinates object
 * @param originLayers Optional origin activation layers count
 * @returns CSS transform string
 */
export function generateFragmentTransform(
  leftParticipant: string,
  originParticipant: string | null,
  borderDepth: number,
  coordinates?: Coordinates,
  originLayers?: number
): string {
  try {
    const coords = coordinates || store.get(coordinatesAtom);
    const extractor = new ParticipantGeometryExtractor(coords);
    
    const leftGeometry = extractor.extractParticipant(leftParticipant);
    let originGeometry = null;
    
    if (originParticipant) {
      // Use provided originLayers if available, otherwise extract without context (defaulting to 0)
      if (originLayers !== undefined) {
        originGeometry = {
          name: originParticipant,
          centerPosition: coords.getPosition(originParticipant),
          halfWidth: coords.half(originParticipant),
          activationLayers: originLayers,
        };
      } else {
        originGeometry = extractor.extractParticipant(originParticipant);
      }
    }
    
    return LayoutMath.fragmentTransform(leftGeometry, originGeometry, borderDepth);
  } catch (e) {
    console.error(e);
    return "translateX(0px)";
  }
}

/**
 * Calculate fragment padding left using new mathematical model
 * @param leftParticipant Leftmost participant name
 * @param borderDepth Border depth
 * @param coordinates Optional coordinates object
 * @returns Padding left value
 */
export function calculateFragmentPaddingLeft(
  leftParticipant: string,
  borderDepth: number,
  coordinates?: Coordinates
): number {
  try {
    const coords = coordinates || store.get(coordinatesAtom);
    const extractor = new ParticipantGeometryExtractor(coords);
    
    const leftGeometry = extractor.extractParticipant(leftParticipant);
    
    return LayoutMath.fragmentPaddingLeft(leftGeometry, borderDepth);
  } catch (e) {
    console.error(e);
    return 0;
  }
}
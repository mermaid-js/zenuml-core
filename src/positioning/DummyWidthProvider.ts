import { TextType } from "./Coordinate";

/**
 * Dummy WidthProvider for non-browser environments
 * Provides width estimation based on character count when DOM is not available
 */
export default function DummyWidthProvider(text: string, type: TextType): number {
  // Base width calculation: length * 10
  const baseWidth = text.length * 10;
  
  // Apply different scaling based on text type
  switch (type) {
    case TextType.MessageContent:
      // Smaller font size for message content (0.875rem vs 1rem)
      return Math.round(baseWidth * 0.875);
    case TextType.ParticipantName:
      // Regular font size for participant names
      return baseWidth;
    default:
      return baseWidth;
  }
}

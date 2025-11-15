export enum TextType {
  MessageContent,
  ParticipantName,
}

/**
 * Abstraction over the platform-specific text measurement API. On the server
 * this is provided by a test double; in the browser it proxies `CanvasRenderingContext2D.measureText`.
 */
export interface WidthFunc {
  (text: string, type: TextType): number;
}

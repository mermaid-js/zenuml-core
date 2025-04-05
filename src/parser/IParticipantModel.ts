/**
 * Interface representing a participant in a sequence diagram
 */
export interface IParticipantModel {
  name: string;
  left: string;
  label?: string;
  type?: string;

  /**
   * Returns the display name of the participant, which is the label if it exists, otherwise the name
   */
  getDisplayName(): string;

  /**
   * Checks if the participant has an icon based on its type
   */
  hasIcon(): boolean;
}

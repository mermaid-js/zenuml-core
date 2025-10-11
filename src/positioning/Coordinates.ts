import {
  ARROW_HEAD_WIDTH,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
  OCCURRENCE_WIDTH,
} from "./Constants";
import { TextType } from "./Coordinate";
import type { WidthFunc } from "./Coordinate";
import { _STARTER_ } from "@/constants";
import type { IParticipantModel } from "@/parser/IParticipantModel";
import { find_optimal } from "./david/DavidEisenstat";
import { clearCache, getCache, setCache } from "@/utils/RenderingCache";
import { StatementKind } from "@/ir/tree-types";

// IR-driven approach imports
import { IRParticipant } from "@/ir/participants";
import { IRMessage } from "@/ir/tree-types";

// Inlined participant model for IR data
class IRParticipantModel implements IParticipantModel {
  constructor(
    public name: string,
    public left: string,
    public label?: string,
    public type?: string,
  ) {}

  getDisplayName(): string {
    return this.label || this.name;
  }

  hasIcon(): boolean {
    return !!this.type;
  }
}

export class Coordinates {
  private m: Array<Array<number>> = [];
  private readonly widthProvider: WidthFunc;
  private readonly participantModels: IParticipantModel[];
  private readonly ownableMessages: IRMessage[];

  // IR-driven constructor (main constructor)
  constructor(
    participants: IRParticipant[], 
    messages: IRMessage[], 
    widthProvider: WidthFunc
  ) {
    clearCache();
    // Inline participant mapping logic
    this.participantModels = participants.map((participant, index) => {
      const previousName = index > 0 ? participants[index - 1].name : "";
      return new IRParticipantModel(
        participant.name,
        previousName,
        participant.label,
        participant.type,
      );
    });
    this.ownableMessages = messages as IRMessage[];
    this.widthProvider = widthProvider;
    this.walkThrough();
  }

  /**
   * Create Coordinates instance from IR data
   * @deprecated Use the main constructor directly: new Coordinates(participants, messages, widthProvider)
   */
  static fromIR(
    participants: IRParticipant[], 
    messages: IRMessage[], 
    widthProvider: WidthFunc
  ): Coordinates {
    return new Coordinates(participants, messages, widthProvider);
  }

  orderedParticipantNames(): string[] {
    return this.participantModels.map((p) => p.name);
  }

  getPosition(participantName: string | undefined): number {
    if (!participantName) return 0;

    const participant = this.getParticipantModel(participantName);
    if (!participant) {
      console.warn(`Participant ${participantName} not found`);
      return 0;
    }

    const cacheKey = `getPosition_${participantName}`;
    const cachedPosition = getCache(cacheKey);
    if (cachedPosition != null) {
      return cachedPosition;
    }

    const pIndex = this.participantModels.findIndex(
      (p) => p.name === participantName,
    );
    const leftGap = this.getParticipantGap(this.participantModels[0]);
    // const leftGap = 0;
    const position = leftGap + find_optimal(this.m)[pIndex];
    setCache(cacheKey, position);
    console.debug(`Position of ${participantName} is ${position}`);
    return position;
  }

  walkThrough() {
    this.withParticipantGaps(this.participantModels);
    this.withMessageGaps(this.ownableMessages, this.participantModels);
  }

  half(participantName: string): number {
    const participant = this.getParticipantModel(participantName);
    return participant ? this._getParticipantWidth(participant) / 2 : 0;
  }

  left(participantName: string): number {
    return this.getPosition(participantName) - this.half(participantName);
  }

  right(participantName: string): number {
    return this.getPosition(participantName) + this.half(participantName);
  }

  getWidth(): number {
    const lastParticipant =
      this.participantModels[this.participantModels.length - 1].name;
    const calculatedWidth =
      this.getPosition(lastParticipant) + this.half(lastParticipant);
    return Math.max(calculatedWidth, 200);
  }

  distance(left: string, right: string) {
    return this.getPosition(right) - this.getPosition(left);
  }

  getMessageWidth(message: IRMessage) {
    const halfSelf = this.half(message.to);
    let messageWidth = this.widthProvider(
      message.signature,
      TextType.MessageContent,
    );
    // hack for creation message
    if (message.type === StatementKind.Creation) {
      messageWidth += halfSelf;
    }
    return messageWidth;
  }

  private withMessageGaps(
    ownableMessages: IRMessage[],
    participantModels: IParticipantModel[],
  ) {
    for (const message of ownableMessages) {
      if (!message.from) {
        message.from = _STARTER_;
      }
      const indexFrom = participantModels.findIndex(
        (p) => p.name === message.from,
      );
      const indexTo = participantModels.findIndex((p) => p.name === message.to);
      if (indexFrom === -1 || indexTo === -1) {
        console.warn(`Participant ${message.from} or ${message.to} not found`);
        continue;
      }
      const leftIndex = Math.min(indexFrom, indexTo);
      const rightIndex = Math.max(indexFrom, indexTo);
      try {
        const messageWidth = this.getMessageWidth(message);
        this.m[leftIndex][rightIndex] = Math.max(
          messageWidth + ARROW_HEAD_WIDTH + OCCURRENCE_WIDTH,
          this.m[leftIndex][rightIndex],
        );
      } catch (e) {
        console.warn(
          `Could not set message gap between ${message.from} and ${message.to}`,
        );
      }
    }
  }
  private withParticipantGaps(participantModels: IParticipantModel[]) {
    this.m = participantModels.map((_, i) => {
      return participantModels.map((v, j) => {
        return j - i === 1 ? this.getParticipantGap(v) : 0;
      });
    });
  }

  private getParticipantGap(p: IParticipantModel) {
    return this.half(p.left) + this.half(p.name);
  }

  private getParticipantModel(name: string): IParticipantModel | undefined {
    return this.participantModels.find((p) => p.name === name);
  }

  private _getParticipantWidth(participant: IParticipantModel) {
    const cacheKey = `getParticipantWidth_${participant.name}`;
    const cachedWidth = getCache(cacheKey);
    if (cachedWidth != null) {
      return cachedWidth;
    }

    // Calculate base width from participant display name or minimum width
    // Add icon width if the participant has an icon
    // Icon's total width is 32px (24px for icon + 8px for margin)
    const hasIcon = participant.hasIcon();
    const iconWidth = hasIcon ? 40 : 0;

    const labelWidth = this.widthProvider(
      participant.getDisplayName(),
      TextType.ParticipantName,
    );
    const participantWidth =
      Math.max(labelWidth + iconWidth, MIN_PARTICIPANT_WIDTH) + MARGIN;

    setCache(cacheKey, participantWidth);
    console.debug(
      `Width of ${participant.name} is ${participantWidth}; labelWidth: ${labelWidth}`,
    );
    return participantWidth;
  }
}

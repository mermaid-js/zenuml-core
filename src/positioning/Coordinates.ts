import {
  ARROW_HEAD_WIDTH,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
  OCCURRENCE_WIDTH,
  PARTICIPANT_ICON_WIDTH,
} from "./Constants";
import { TextType } from "./Coordinate";
import type { WidthFunc } from "./Coordinate";
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import type { IParticipantModel } from "@/parser/IParticipantModel";
import logger from "@/logger/logger";
import { find_optimal } from "./david/DavidEisenstat";
import { AllMessages } from "@/parser/MessageCollector";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import type { OwnableMessage } from "@/parser/OwnableMessage";

export class Coordinates {
  private m: Array<Array<number>> = [];
  private readonly widthProvider: WidthFunc;
  private readonly participantModels: IParticipantModel[];
  private readonly ownableMessages: OwnableMessage[];
  private readonly participantModelsByName = new Map<
    string,
    IParticipantModel
  >();
  private readonly participantIndexByName = new Map<string, number>();
  private readonly participantWidthCache = new Map<string, number>();
  // Solved positions for all participants; the solver runs once per instance.
  private positionsCache: number[] | null = null;

  constructor(ctx: any, widthProvider: WidthFunc) {
    this.participantModels = OrderedParticipants(ctx);
    this.ownableMessages = AllMessages(ctx);
    this.participantModels.forEach((p, i) => {
      this.participantModelsByName.set(p.name, p);
      this.participantIndexByName.set(p.name, i);
    });

    this.widthProvider = widthProvider;
    this.walkThrough();
  }

  orderedParticipantNames(): string[] {
    return this.participantModels.map((p) => p.name);
  }

  getPosition(participantName: string | undefined): number {
    if (!participantName) return 0;

    const pIndex = this.participantIndexByName.get(participantName);
    if (pIndex === undefined) {
      console.warn(`Participant ${participantName} not found`);
      return 0;
    }

    if (!this.positionsCache) {
      this.positionsCache = find_optimal(this.m);
    }
    const leftGap = this.getParticipantGap(this.participantModels[0]);
    const position = leftGap + this.positionsCache[pIndex];
    logger.debug(`Position of ${participantName} is ${position}`);
    return position;
  }

  walkThrough() {
    this.withParticipantGaps(this.participantModels);
    this.withMessageGaps(this.ownableMessages);
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

  getMessageWidth(message: OwnableMessage) {
    const halfSelf = this.half(message.to);
    let messageWidth = this.widthProvider(
      message.signature,
      TextType.MessageContent,
    );
    // hack for creation message
    if (message.type === OwnableMessageType.CreationMessage) {
      messageWidth += halfSelf;
    }
    return messageWidth;
  }

  private withMessageGaps(ownableMessages: OwnableMessage[]) {
    for (const message of ownableMessages) {
      // The message array is shared (cached per parse tree), so derive the
      // effective source locally instead of mutating the message.
      const from = message.from || _STARTER_;
      const indexFrom = this.participantIndexByName.get(from) ?? -1;
      const indexTo = this.participantIndexByName.get(message.to) ?? -1;
      if (indexFrom === -1 || indexTo === -1) {
        console.warn(`Participant ${from} or ${message.to} not found`);
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
      } catch {
        console.warn(
          `Could not set message gap between ${from} and ${message.to}`,
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
    return this.participantModelsByName.get(name);
  }

  private _getParticipantWidth(participant: IParticipantModel) {
    const cachedWidth = this.participantWidthCache.get(participant.name);
    if (cachedWidth != null) {
      return cachedWidth;
    }

    // Calculate base width from participant display name or minimum width
    // Add icon width if the participant has an icon
    // Icon's total width is 32px (24px for icon + 8px for margin)
    const hasIcon = participant.hasIcon();
    const iconWidth = hasIcon ? PARTICIPANT_ICON_WIDTH : 0;
    // Emoji character (~16px glyph + em-space) adds width when present
    const emojiWidth = participant.emoji ? 24 : 0;

    const labelWidth = this.widthProvider(
      participant.getDisplayName(),
      TextType.ParticipantName,
    );
    const participantWidth =
      Math.max(labelWidth + iconWidth + emojiWidth, MIN_PARTICIPANT_WIDTH) +
      MARGIN;

    this.participantWidthCache.set(participant.name, participantWidth);
    logger.debug(
      `Width of ${participant.name} is ${participantWidth}; labelWidth: ${labelWidth}`,
    );
    return participantWidth;
  }
}

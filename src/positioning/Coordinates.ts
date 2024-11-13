import {
  ARROW_HEAD_WIDTH,
  MARGIN,
  MIN_PARTICIPANT_WIDTH,
  OCCURRENCE_WIDTH,
} from "./Constants";
import { TextType, WidthFunc } from "./Coordinate";
import { _STARTER_, OrderedParticipants } from "@/parser/OrderedParticipants";
import { IParticipantModel } from "@/parser/ParticipantListener";
import { find_optimal } from "./david/DavidEisenstat";
import { AllMessages } from "@/parser/MessageContextListener";
import { OwnableMessage, OwnableMessageType } from "@/parser/OwnableMessage";
import { clearCache, getCache, setCache } from "@/utils/RenderingCache";

export class Coordinates {
  private m: Array<Array<number>> = [];
  private readonly widthProvider: WidthFunc;
  private readonly participantModels: IParticipantModel[];
  private readonly ownableMessages: OwnableMessage[];

  constructor(ctx: any, widthProvider: WidthFunc) {
    clearCache();
    this.participantModels = OrderedParticipants(ctx);
    this.ownableMessages = AllMessages(ctx);

    this.widthProvider = widthProvider;
    this.walkThrough();
  }

  orderedParticipantNames(): string[] {
    return this.participantModels.map((p) => p.name);
  }

  getPosition(participantName: string | undefined): number {
    const pIndex = this.participantModels.findIndex(
      (p) => p.name === participantName,
    );
    if (pIndex === -1) {
      throw Error(`Participant ${participantName} not found`);
    }
    const cacheKey = `getPosition_${participantName}`;
    const cachedPosition = getCache(cacheKey);
    if (cachedPosition != null) {
      return cachedPosition;
    }
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

  half(participantName: string) {
    return this.halfWithMargin(this.labelOrName(participantName));
  }

  getWidth() {
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

  private withMessageGaps(
    ownableMessages: OwnableMessage[],
    participantModels: IParticipantModel[],
  ) {
    ownableMessages.forEach((message) => {
      if (!message.from) {
        message.from = _STARTER_;
      }
      const indexFrom = participantModels.findIndex(
        (p) => p.name === message.from,
      );
      const indexTo = participantModels.findIndex((p) => p.name === message.to);
      if (indexFrom === -1 || indexTo === -1) {
        console.warn(`Participant ${message.from} or ${message.to} not found`);
        return;
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
    });
  }
  private withParticipantGaps(participantModels: IParticipantModel[]) {
    this.m = participantModels.map((_, i) => {
      return participantModels.map((v, j) => {
        return j - i === 1 ? this.getParticipantGap(v) : 0;
      });
    });
  }

  private getParticipantGap(p: IParticipantModel) {
    const halfLeft = this.half(p.left);
    const halfSelf = this.half(p.name);
    // TODO: convert name to enum type
    const leftIsVisible = true;
    const selfIsVisible = true;
    return (
      ((leftIsVisible && halfLeft) || 0) + ((selfIsVisible && halfSelf) || 0)
    );
  }

  private labelOrName(name: string) {
    const pIndex = this.participantModels.findIndex((p) => p.name === name);
    if (pIndex === -1) return "";
    return (
      this.participantModels[pIndex].label ||
      this.participantModels[pIndex].name
    );
  }

  private halfWithMargin(participant: string | undefined) {
    if (!participant) {
      return 0;
    }
    return this._getParticipantWidth(participant) / 2 + MARGIN / 2;
  }

  private _getParticipantWidth(participant: string | undefined) {
    if (!participant) {
      return 0;
    }
    return Math.max(
      this.widthProvider(participant || "", TextType.ParticipantName),
      MIN_PARTICIPANT_WIDTH,
    );
  }
}

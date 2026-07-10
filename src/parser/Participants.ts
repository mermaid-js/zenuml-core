export type Position = [number, number];

interface ParticipantOptions {
  isStarter?: boolean;
  stereotype?: string;
  width?: number;
  groupId?: number | string;
  label?: string;
  explicit?: boolean;
  type?: string;
  color?: string;
  comment?: string;
  assignee?: string;
  emoji?: string;
  position?: Position;
  assigneePosition?: Position;
}

export const blankParticipant = {
  name: "",
  color: undefined as string | undefined,
  comment: undefined as string | undefined,
  explicit: undefined as boolean | undefined,
  groupId: undefined as number | string | undefined,
  isStarter: undefined as boolean | undefined,
  label: undefined as string | undefined,
  stereotype: undefined as string | undefined,
  type: undefined as string | undefined,
  width: undefined as number | undefined,
  assignee: undefined as string | undefined,
  emoji: undefined as string | undefined,
  positions: new Set<Position>(),
  assigneePositions: new Set<Position>(),
};

export class Participant {
  name: string;
  // Fields the renderer-facing ParticipantView (ir/contract.ts) exposes are
  // public; they were already fully exposed via ToValue(), so the previous
  // `private` was inconsistent encapsulation. `width` stays private — it is not
  // part of ParticipantView.
  stereotype: string | undefined;
  private width: number | undefined;
  groupId: number | string | undefined;
  explicit: boolean | undefined;
  isStarter: boolean | undefined;
  label: string | undefined;
  type: string | undefined;
  color: string | undefined;
  comment: string | undefined;
  assignee: string | undefined;
  emoji: string | undefined;
  positions: Set<Position> = new Set();
  assigneePositions: Set<Position> = new Set();

  constructor(name: string, options: ParticipantOptions) {
    this.name = name;
    this.mergeOptions(options);
  }

  public mergeOptions(options: ParticipantOptions) {
    const {
      stereotype,
      width,
      groupId,
      label,
      explicit,
      isStarter,
      type,
      color,
      comment,
      assignee,
      emoji,
    } = options;
    this.stereotype ||= stereotype;
    this.width ||= width;
    this.groupId ||= groupId;
    this.explicit ||= explicit;
    this.isStarter ||= isStarter;
    this.label ||= label;
    this.type ||= type;
    this.color ||= color;
    this.comment ||= comment;
    this.assignee ||= assignee;
    this.emoji ||= emoji;
  }
  public AddPosition(position: Position) {
    this.positions.add(position);
  }

  public ToValue() {
    return {
      name: this.name,
      stereotype: this.stereotype,
      width: this.width,
      groupId: this.groupId,
      explicit: this.explicit,
      isStarter: this.isStarter,
      label: this.label,
      type: this.type,
      color: this.color,
      comment: this.comment,
      assignee: this.assignee,
      emoji: this.emoji,
      positions: this.positions,
      assigneePositions: this.assigneePositions,
    };
  }
}

export class Participants {
  private participants = new Map<string, Participant>();

  public Add(name: string, options: ParticipantOptions = {}): void {
    if (!name) {
      throw new Error("Participant name is required");
    }
    let participant = this.Get(name);
    if (!participant) {
      participant = new Participant(name, options);
      this.participants.set(name, participant);
    } else {
      participant?.mergeOptions(options);
    }

    // Add positions
    const { position, assigneePosition } = options;
    if (position) {
      participant.AddPosition(position);
    }
    if (assigneePosition) {
      participant.assigneePositions.add(assigneePosition);
    }
  }

  // Returns an array of participants that are deduced from messages
  // It does not include the Starter.
  ImplicitArray() {
    return this.Array().filter((p) => !this.Get(p.name)?.explicit);
  }

  // Items in entries are in the order of entry insertion:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  Array() {
    return Array.from(this.participants.entries()).map((entry) => entry[1]);
  }

  Names() {
    return Array.from(this.participants.keys());
  }

  First() {
    return this.participants.values().next().value;
  }

  Get(name: string) {
    return this.participants.get(name);
  }

  Size() {
    return this.participants.size;
  }

  Starter() {
    for (const participant of this.participants.values()) {
      if (participant.isStarter) {
        return participant;
      }
    }
    return undefined;
  }

  GetPositions(name: string) {
    return this.participants.get(name)?.positions;
  }

  GetAssigneePositions(name: string) {
    return this.participants.get(name)?.assigneePositions;
  }
}

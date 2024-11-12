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
  position?: Position;
  assigneePosition?: Position;
}

export const blankParticipant = {
  color: undefined,
  comment: undefined,
  explicit: undefined,
  groupId: undefined,
  isStarter: undefined,
  label: undefined,
  stereotype: undefined,
  type: undefined,
  width: undefined,
  assignee: undefined,
  positions: new Set(),
  assigneePositions: new Set(),
};

export class Participant {
  name: string;
  private stereotype: string | undefined;
  private width: number | undefined;
  private groupId: number | string | undefined;
  explicit: boolean | undefined;
  isStarter: boolean | undefined;
  private label: string | undefined;
  private type: string | undefined;
  private color: string | undefined;
  private comment: string | undefined;
  private assignee: string | undefined;
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
      positions: this.positions,
      assigneePositions: this.assigneePositions,
    };
  }
}

export class Participants {
  private participants = new Map<string, Participant>();

  public Add(name: string, options: ParticipantOptions = {}): void {
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
    return this.Array().filter(
      (p) => !this.Get(p.name)?.explicit && !p.isStarter,
    );
  }

  // Items in entries are in the order of entry insertion:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
  private Array() {
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
    const first = this.First();
    // const type = first.name === 'User' || first.name === 'Actor' ? 'actor' : undefined;
    return first?.isStarter ? first : undefined;
  }

  GetPositions(name: string) {
    return this.participants.get(name)?.positions;
  }

  GetAssigneePositions(name: string) {
    return this.participants.get(name)?.assigneePositions;
  }
}

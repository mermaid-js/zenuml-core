export enum ParticipantType {
  Actor = 1,
  Boundary,
  Collection,
  Control,
  Database,
  Entity,
  Queue,
  EC2,
  ECS,
  IAM,
  Lambda,
  RDS,
  S3,
  Undefined,
}

export type Position = [number, number];

export type PositionStr<
  A extends number = number,
  B extends number = number,
> = `[${A},${B}]`;

interface ParticipantOptions {
  isStarter?: boolean;
  start?: number;
  end?: number;
  stereotype?: string;
  width?: number;
  groupId?: number | string;
  label?: string;
  explicit?: boolean;
  type?: string;
  color?: string;
  comment?: string;
  assignee?: string;
  assigneePosition?: Position;
}

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
  positions: Set<PositionStr> = new Set();
  assigneePosition: Position | undefined;

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
    this.stereotype ??= stereotype;
    this.width ??= width;
    this.groupId ??= groupId;
    this.explicit ??= explicit;
    this.isStarter ??= isStarter;
    this.label ??= label;
    this.type ??= type;
    this.color ??= color;
    this.comment ??= comment;
    this.assignee ??= assignee;
    this.assigneePosition ??= options.assigneePosition;
  }

  public Type(): ParticipantType {
    switch (this.type?.toLowerCase()) {
      case "@actor":
        return ParticipantType.Actor;
      case "@boundary":
        return ParticipantType.Boundary;
      case "@collection":
        return ParticipantType.Collection;
      case "@control":
        return ParticipantType.Control;
      case "@database":
        return ParticipantType.Database;
      case "@entity":
        return ParticipantType.Entity;
      case "@queue":
        return ParticipantType.Queue;

      case "@ec2":
        return ParticipantType.EC2;
      case "@ecs":
        return ParticipantType.ECS;
      case "@iam":
        return ParticipantType.IAM;
      case "@lambda":
        return ParticipantType.Lambda;
      case "@rds":
        return ParticipantType.RDS;
      case "@s3":
        return ParticipantType.S3;
    }
    return ParticipantType.Undefined;
  }
}

export class Participants {
  private participants = new Map<string, Participant>();

  public Add(name: string, options: ParticipantOptions = {}): void {
    const participant = this.Get(name);
    if (!participant) {
      this.participants.set(name, new Participant(name, options));
    } else {
      participant?.mergeOptions(options);
    }

    const { start, end } = options;
    if (start !== undefined && end !== undefined) {
      this.addPosition(name, start, end);
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

  Positions() {
    const positions = new Map<string, Set<PositionStr>>();
    Array.from(this.participants.values()).forEach((participant) => {
      positions.set(participant.name, participant.positions);
    });
    return positions;
  }

  GetPositions(name: string) {
    return this.participants.get(name)?.positions;
  }

  GetAssigneePosition(name: string) {
    return this.participants.get(name)?.assigneePosition;
  }

  private addPosition(name: string, start: number, end: number) {
    const participant = this.participants.get(name);
    if (!participant) return;
    if (!participant.positions) {
      participant.positions = new Set();
    }
    participant.positions.add(`[${start},${end}]`);
  }
}

import mergeWith from "lodash/mergeWith";
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

  constructor(name: string, options: ParticipantOptions) {
    this.name = name;
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
    this.stereotype = stereotype;
    this.width = width;
    this.groupId = groupId;
    this.explicit = explicit;
    this.isStarter = isStarter;
    this.label = label;
    this.type = type;
    this.color = color;
    this.comment = comment;
    this.assignee = assignee;
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

export type PositionStr<
  A extends number = number,
  B extends number = number,
> = `[${A},${B}]`;

export class Participants {
  private participants = new Map<string, Participant>();
  private participantPositions = new Map<string, Set<PositionStr>>();

  public Add(name: string, options: ParticipantOptions = {}): void {
    const participant = new Participant(name, options);
    this.participants.set(
      name,
      mergeWith({}, this.Get(name), participant, (a, b) => a || b),
    );
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
    return first.isStarter ? first : undefined;
  }

  Positions() {
    return this.participantPositions;
  }

  GetPositions(name: string) {
    return this.participantPositions.get(name);
  }

  private addPosition(name: string, start: number, end: number) {
    let positions = this.participantPositions.get(name);
    if (!positions) {
      positions = new Set();
      this.participantPositions.set(name, positions);
    }

    positions.add(`[${start},${end}]`);
  }
}

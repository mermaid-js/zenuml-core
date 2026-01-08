import sequenceParser from "../../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;

interface IAssignment {
  assignee: string | undefined;
  type: string | undefined;
  labelPosition: [number, number];
  assigneePosition: [number, number];
  typePosition: [number, number];
}

export class Assignment implements IAssignment {
  assignee: string;
  type: string;
  labelPosition: [number, number];
  assigneePosition: [number, number];
  typePosition: [number, number];
  constructor(
    assignee: string | undefined, 
    type: string | undefined, 
    assigneePosition: [number, number],
    typePosition: [number, number]
  ) {
    // check if type is defined, assignee must be defined
    if (type && !assignee) {
      throw new Error("assignee must be defined if type is defined");
    }
    this.assignee = assignee || "";
    this.type = type || "";
    // For backward compatibility, labelPosition is the assigneePosition
    this.labelPosition = assigneePosition;
    this.assigneePosition = assigneePosition;
    this.typePosition = typePosition;
  }

  getText() {
    return [this.assignee, this.type].filter(Boolean).join(":");
  }
}

// @ts-ignore
MessageContext.prototype.Assignment = function () {
  const assignmentContext = this.messageBody().assignment();
  // @ts-ignore
  const assignee = assignmentContext?.assignee()?.getFormattedText();
  // @ts-ignore
  const type = assignmentContext?.type()?.getFormattedText();
  // @ts-ignore
  const assigneeCtx = assignmentContext?.assignee();
  const assigneePosition: [number, number] = assigneeCtx
    ? [assigneeCtx.start.start, assigneeCtx.stop.stop]
    : [-1, -1];
  // @ts-ignore
  const typeCtx = assignmentContext?.type();
  const typePosition: [number, number] = typeCtx
    ? [typeCtx.start.start, typeCtx.stop.stop]
    : [-1, -1];
  if (assignee) {
    return new Assignment(assignee, type, assigneePosition, typePosition);
  }
  return undefined;
};

// @ts-ignore
CreationContext.prototype.Assignment = function () {
  const assignmentContext = this.creationBody()?.assignment();
  // @ts-ignore
  const assignee = assignmentContext?.assignee()?.getFormattedText();
  // @ts-ignore
  const type = assignmentContext?.type()?.getFormattedText();
  // @ts-ignore
  const assigneeCtx = assignmentContext?.assignee();
  const assigneePosition: [number, number] = assigneeCtx
    ? [assigneeCtx.start.start, assigneeCtx.stop.stop]
    : [-1, -1];
  // @ts-ignore
  const typeCtx = assignmentContext?.type();
  const typePosition: [number, number] = typeCtx
    ? [typeCtx.start.start, typeCtx.stop.stop]
    : [-1, -1];
  if (assignee) {
    return new Assignment(assignee, type, assigneePosition, typePosition);
  }
  return undefined;
};

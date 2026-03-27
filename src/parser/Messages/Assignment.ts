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

function extractAssignmentFromContext(assignmentContext: any): Assignment | undefined {
  if (!assignmentContext) {
    return undefined;
  }
  // @ts-expect-error -- ANTLR generated code
  const assignee = assignmentContext?.assignee()?.getFormattedText();
  // @ts-expect-error -- ANTLR generated code
  const type = assignmentContext?.type()?.getFormattedText();
  // @ts-expect-error -- ANTLR generated code
  const assigneeCtx = assignmentContext?.assignee();
  const assigneePosition: [number, number] = assigneeCtx
    ? [assigneeCtx.start.start, assigneeCtx.stop.stop]
    : [-1, -1];
  // @ts-expect-error -- ANTLR generated code
  const typeCtx = assignmentContext?.type();
  const typePosition: [number, number] = typeCtx
    ? [typeCtx.start.start, typeCtx.stop.stop]
    : [-1, -1];
  if (assignee) {
    return new Assignment(assignee, type, assigneePosition, typePosition);
  }
  return undefined;
}

// @ts-expect-error -- ANTLR generated code
MessageContext.prototype.Assignment = function () {
  return extractAssignmentFromContext(this.messageBody().assignment());
};

// @ts-expect-error -- ANTLR generated code
CreationContext.prototype.Assignment = function () {
  return extractAssignmentFromContext(this.creationBody()?.assignment());
};

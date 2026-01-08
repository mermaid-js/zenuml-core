import sequenceParser from "../../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;
const CreationContext = seqParser.CreationContext;
const IfBlockContext = seqParser.IfBlockContext;
const LoopContext = seqParser.LoopContext;

interface IAssignment {
  assignee: string | undefined;
  type: string | undefined;
  labelPosition: [number, number];
}

export class Assignment implements IAssignment {
  assignee: string;
  type: string;
  labelPosition: [number, number];
  constructor(assignee: string | undefined, type: string | undefined, labelPosition: [number, number]) {
    // check if type is defined, assignee must be defined
    if (type && !assignee) {
      throw new Error("assignee must be defined if type is defined");
    }
    this.assignee = assignee || "";
    this.type = type || "";
    this.labelPosition = labelPosition;
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
  const labelPosition: [number, number] = assigneeCtx
    ? [assigneeCtx.start.start, assigneeCtx.stop.stop]
    : [-1, -1];
  if (assignee) {
    return new Assignment(assignee, type, labelPosition);
  }
  return undefined;
};

// @ts-ignore
MessageContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-ignore
CreationContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-ignore
IfBlockContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

// @ts-ignore
LoopContext.prototype.Statements = function () {
  return this.braceBlock()?.block()?.stat() || [];
};

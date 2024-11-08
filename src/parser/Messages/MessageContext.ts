import sequenceParser from "../../generated-parser/sequenceParser";

const seqParser = sequenceParser;
const MessageContext = seqParser.MessageContext;

interface IAssignment {
  assignee: string | undefined;
  type: string | undefined;
}

export class Assignment implements IAssignment {
  assignee: string;
  type: string;
  constructor(assignee: string | undefined, type: string | undefined) {
    // check if type is defined, assignee must be defined
    if (type && !assignee) {
      throw new Error("assignee must be defined if type is defined");
    }
    this.assignee = assignee || "";
    this.type = type || "";
  }
  // The assignment label that is rendered in the diagram.
  // For example, for `Type t = new Class()`, the label is `t:Type`.
  getLabel() {
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
  if (assignee) {
    return new Assignment(assignee, type);
  }
  return undefined;
};

// @ts-ignore
MessageContext.prototype.isSimpleAssignment = function () {
  // A simple assignment is an assignment that does not have a block.
  // For example, `a = b` is a simple assignment and `a = b { ... }` is not.
  const hasAssignment = !!this.messageBody().assignment();
  const signatures = this.messageBody()?.func()?.signature() || [];
  // @ts-ignore
  const hasInvocation =
    signatures?.some((signature: any): boolean => signature.invocation()) ??
    false;
  const hasBraceBlock = !!this.braceBlock();
  const hasTo = !!this.messageBody().to();
  return hasAssignment && !hasTo && !hasInvocation && !hasBraceBlock;
};

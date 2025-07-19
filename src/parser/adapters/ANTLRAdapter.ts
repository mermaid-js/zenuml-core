import {
  ASTNode,
  MessageNode,
  SequenceASTNode,
  CreationNode,
  ParticipantNode,
  AsyncMessageNode,
  FragmentNode,
} from "../types/astNode.types.js";
import { formatText } from "../../utils/StringUtil.js";

// Base interface for ANTLR contexts that we actually need
interface BaseANTLRContext {
  constructor: { name: string };
  start?: { start: number };
  stop?: { stop: number };
  parentCtx?: BaseANTLRContext;
  getText?(): string;
  getFormattedText?(): string;
  parser?: {
    getTokenStream(): {
      getText(interval: any): string;
    };
  };
  getSourceInterval?(): any;
}

export class ANTLRASTAdapter<T extends BaseANTLRContext = BaseANTLRContext>
  implements SequenceASTNode
{
  type: string;
  range: [number, number] = [0, 0];
  parent?: ASTNode | undefined;
  children: ASTNode[] = [];
  ctx: T;

  constructor(ctx: T) {
    this.ctx = ctx;
    this.type = ctx.constructor.name;
    this.range = [ctx.start?.start || 0, (ctx.stop?.stop || 0) + 1];
    if (ctx.parentCtx) {
      this.parent = new ANTLRASTAdapter(ctx.parentCtx);
    }
  }

  // Implement all interface methods by delegating to ANTLR context
  getType(): string {
    return this.type;
  }

  getParent(): ASTNode | null {
    return this.parent as ASTNode | null;
  }

  getChildren(): ASTNode[] {
    throw new Error("Method not implemented.");
  }

  getRange(): [number, number] {
    return this.range;
  }

  getText(): string {
    return this.ctx.getText?.() || "";
  }

  getFormattedText(): string {
    // Try to use the ANTLR context's built-in getFormattedText if available
    if (this.ctx.getFormattedText) {
      return this.ctx.getFormattedText();
    }

    // Fallback implementation using parser and token stream
    if (this.ctx.parser && this.ctx.getSourceInterval) {
      try {
        const code = this.ctx.parser
          .getTokenStream()
          .getText(this.ctx.getSourceInterval());
        return formatText(code);
      } catch (error) {
        // If parsing fails, fall back to getText
        console.warn("Failed to get formatted text from parser:", error);
      }
    }

    // Final fallback to getText with basic formatting
    const text = this.getText();
    return formatText(text);
  }

  findAncestor<T extends ASTNode>(
    nodeClass: new (...args: any[]) => T,
  ): T | null {
    if (this.parent) {
      if (this.parent instanceof nodeClass) {
        return this.parent as T;
      }
      // Check if parent has findAncestor method before calling it
      if (
        "findAncestor" in this.parent &&
        typeof this.parent.findAncestor === "function"
      ) {
        return this.parent.findAncestor(nodeClass);
      }
    }
    return null;
  }
}

// Extended interfaces for specific context types with methods we need
interface MessageContextInterface extends BaseANTLRContext {
  messageBody?(): MessageBodyContextInterface;
  braceBlock?(): BraceBlockContextInterface;
  From?(): string;
  To?(): string;
  Owner?(): string;
  Origin?(): string;
  SignatureText?(): string;
}

interface CreationContextInterface extends BaseANTLRContext {
  creationBody?(): CreationBodyContextInterface;
  Constructor?(): string;
  Assignee?(): string;
  AssigneePosition?(): [number, number];
  Owner?(): string;
  From?(): string;
  SignatureText?(): string;
}

interface ParticipantContextInterface extends BaseANTLRContext {
  name?(): { getText(): string };
  participantType?(): { getText(): string } | null;
  stereotype?(): { getText(): string } | null;
  label?(): { getText(): string } | null;
  width?(): { getText(): string } | null;
}

interface AsyncMessageContextInterface extends BaseANTLRContext {
  from?(): { getText(): string } | null;
  to?(): { getText(): string } | null;
  content?(): { getText(): string } | null;
  From?(): string;
  To?(): string;
  SignatureText?(): string;
}

interface MessageBodyContextInterface extends BaseANTLRContext {
  braceBlock?(): BraceBlockContextInterface | null;
  assignment?(): AssignmentContextInterface | null;
}

interface CreationBodyContextInterface extends BaseANTLRContext {
  braceBlock?(): BraceBlockContextInterface | null;
  assignment?(): AssignmentContextInterface | null;
  parameters?(): { getText(): string } | null;
  construct?(): { getText(): string } | null;
}

interface BraceBlockContextInterface extends BaseANTLRContext {
  block?(): BlockContextInterface | null;
}

interface BlockContextInterface extends BaseANTLRContext {
  stat?(): BaseANTLRContext[];
}

interface AssignmentContextInterface extends BaseANTLRContext {
  assignee?(): { getText(): string } | null;
  type?(): { getText(): string } | null;
}

interface FragmentContextInterface extends BaseANTLRContext {
  condition?(): { getText(): string } | null;
  expr?(): { getText(): string } | null;
  ifBlock?(): { block?(): BlockContextInterface } | null;
  block?(): BlockContextInterface | null;
}

export class ANTLRMessageAdapter
  extends ANTLRASTAdapter<MessageContextInterface>
  implements MessageNode
{
  constructor(ctx: MessageContextInterface) {
    super(ctx);
  }

  getFrom(): string | null {
    return this.ctx.From?.() || null;
  }

  getTo(): string | null {
    return this.ctx.To?.() || null;
  }

  getSignature(): string {
    return this.ctx.SignatureText?.() || "";
  }

  getOwner(): string | null {
    return this.ctx.Owner?.() || null;
  }

  getOrigin(): string | null {
    return this.ctx.Origin?.() || null;
  }

  hasAssignment(): boolean {
    return !!this.ctx.messageBody?.()?.assignment?.();
  }

  getAssignment(): string | null {
    const assignment = this.ctx.messageBody?.()?.assignment?.();
    if (!assignment) return null;
    const assignee = assignment?.assignee?.()?.getText();
    const type = assignment?.type?.()?.getText();
    if (assignee && type) {
      return `${assignee}:${type}`;
    }
    return assignee || null;
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }

  getStatements(): SequenceASTNode[] {
    const braceBlock = this.ctx?.braceBlock?.();
    if (!braceBlock) return [];

    const statements = braceBlock.block?.()?.stat?.() || [];
    return statements.map(
      (statCtx: BaseANTLRContext) => new ANTLRASTAdapter(statCtx),
    );
  }
}

export class ANTLRCreationAdapter
  extends ANTLRASTAdapter<CreationContextInterface>
  implements CreationNode
{
  constructor(ctx: CreationContextInterface) {
    super(ctx);
  }

  getConstructor(): string {
    return this.ctx.Constructor?.() || "";
  }

  getAssignee(): string | null {
    return this.ctx.Assignee?.() || null;
  }

  getAssigneePosition(): [number, number] | null {
    return this.ctx.AssigneePosition?.() || null;
  }

  getOwner(): string {
    return this.ctx.Owner?.() || "";
  }

  getFrom(): string | null {
    return this.ctx.From?.() || null;
  }

  getSignature(): string {
    return this.ctx.SignatureText?.() || "";
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }

  getStatements(): SequenceASTNode[] {
    const creationBody = this.ctx.creationBody?.();
    const braceBlock = creationBody?.braceBlock?.();
    if (!braceBlock) return [];

    const statements = braceBlock.block?.()?.stat?.() || [];
    return statements.map(
      (statCtx: BaseANTLRContext) => new ANTLRASTAdapter(statCtx),
    );
  }
}

export class ANTLRParticipantAdapter
  extends ANTLRASTAdapter<ParticipantContextInterface>
  implements ParticipantNode
{
  constructor(ctx: ParticipantContextInterface) {
    super(ctx);
  }

  getName(): string {
    return this.ctx.name?.()?.getText() || "";
  }

  override getType(): string {
    return this.ctx.participantType?.()?.getText() || "ParticipantContext";
  }

  getParticipantType(): string | null {
    return this.ctx.participantType?.()?.getText() || null;
  }

  getStereotype(): string | null {
    return this.ctx.stereotype?.()?.getText() || null;
  }

  getLabel(): string | null {
    return this.ctx.label?.()?.getText() || null;
  }

  getWidth(): number | null {
    const widthText = this.ctx.width?.()?.getText();
    return widthText ? parseInt(widthText) : null;
  }

  getColor(): string | null {
    // TODO: Add color support to grammar
    return null;
  }

  getGroupId(): string | null {
    // TODO: Add group support
    return null;
  }

  isExplicit(): boolean {
    return true; // All participant declarations are explicit
  }

  isStarter(): boolean {
    // TODO: Implement starter detection
    return false;
  }
}

export class ANTLRAsyncMessageAdapter
  extends ANTLRASTAdapter<AsyncMessageContextInterface>
  implements AsyncMessageNode
{
  constructor(ctx: AsyncMessageContextInterface) {
    super(ctx);
  }

  getFrom(): string | null {
    return this.ctx.From?.() || null;
  }

  getTo(): string | null {
    return this.ctx.To?.() || null;
  }

  getContent(): string {
    return this.ctx.content?.()?.getText()?.trim() || "";
  }

  getSignature(): string {
    return this.ctx.SignatureText?.() || "";
  }

  getProvidedFrom(): string | null {
    return this.ctx.from?.()?.getText() || null;
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }
}

export class ANTLRFragmentAdapter
  extends ANTLRASTAdapter<FragmentContextInterface>
  implements FragmentNode
{
  constructor(ctx: FragmentContextInterface) {
    super(ctx);
  }

  getFragmentType():
    | "alt"
    | "opt"
    | "loop"
    | "par"
    | "critical"
    | "section"
    | "tcf"
    | "ref" {
    const ctxName = this.ctx.constructor.name;
    switch (ctxName) {
      case "AltContext":
        return "alt";
      case "OptContext":
        return "opt";
      case "LoopContext":
        return "loop";
      case "ParContext":
        return "par";
      case "CriticalContext":
        return "critical";
      case "SectionContext":
        return "section";
      default:
        return "alt";
    }
  }

  getCondition(): string | null {
    // Try different ways fragments might expose conditions
    const conditionText =
      this.ctx.condition?.()?.getText() || this.ctx.expr?.()?.getText();
    return conditionText?.trim() || null;
  }

  getStatements(): SequenceASTNode[] {
    let statements: BaseANTLRContext[] = [];

    // Different fragment types have different ways to access their content
    const ifBlock = this.ctx.ifBlock?.();
    if (ifBlock) {
      statements = ifBlock.block?.()?.stat?.() || [];
    } else {
      statements = this.ctx.block?.()?.stat?.() || [];
    }

    return statements.map(
      (statCtx: BaseANTLRContext) => new ANTLRASTAdapter(statCtx),
    );
  }
}

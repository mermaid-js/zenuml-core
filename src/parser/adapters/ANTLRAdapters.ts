import {
  ASTNode,
  MessageNode,
  SequenceASTNode,
  CreationNode,
  ParticipantNode,
  AsyncMessageNode,
  FragmentNode,
  DividerNode,
} from "../types/astNode.types.js";
import { formatText } from "../../utils/StringUtil.js";
import {
  BaseANTLRContext,
  IMessageContext,
  ICreationContext,
  IParticipantContext,
  IAsyncMessageContext,
  IFragmentContext,
  IDividerContext,
  IStatContext,
  IRetContext,
} from "../types/antlrContext.types";

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

  // Helper methods to clean up optional chaining
  protected safeCall<R>(fn: () => R | undefined): R | null {
    try {
      return fn() ?? null;
    } catch {
      return null;
    }
  }

  protected safeGetText(contextGetter: () => { getText?: ()=> string } | undefined | null): string {
    const context = this.safeCall(contextGetter);
    return context?.getText?.() || "";
  }

  protected safeGetTextOrNull(contextGetter: () => { getText?: ()=> string } | undefined | null): string | null {
    const context = this.safeCall(contextGetter);
    return context?.getText?.() || null;
  }

  getContext(): T {
    return this.ctx;
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

export class ANTLRMessageAdapter
  extends ANTLRASTAdapter<IMessageContext>
  implements MessageNode
{
  constructor(ctx: IMessageContext) {
    super(ctx);
  }

  getFrom(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.messageBody?.()?.func?.()?.from?.());
  }

  getTo(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.messageBody?.()?.func?.()?.to?.());
  }

  getSignature(): string {
    const signatures = this.safeCall(() => this.ctx.messageBody?.()?.func?.()?.signature?.()) || [];
    return signatures.map((sig: any) => this.safeGetText(() => sig)).join("");
  }

  getOwner(): string | null {
    return this.getTo() || this.getOwnerFromAncestor();
  }

  getOrigin(): string | null {
    return this.getFrom();
  }

  private getOwnerFromAncestor(): string | null {
    let ctx = this.ctx.parentCtx;
    while (ctx) {
      // Check if this context has an Owner method through an adapter
      if (ctx.constructor.name === 'CreationContext') {
        const creationAdapter = new ANTLRCreationAdapter(ctx as any);
        return creationAdapter.getOwner();
      }
      if (ctx.constructor.name === 'MessageContext') {
        const messageAdapter = new ANTLRMessageAdapter(ctx as any);
        return messageAdapter.getOwner();
      }
      ctx = ctx.parentCtx;
    }
    return null;
  }

  hasAssignment(): boolean {
    return !!this.safeCall(() => this.ctx.messageBody?.()?.assignment?.());
  }

  getAssignment(): string | null {
    const assignment = this.safeCall(() => this.ctx.messageBody?.()?.assignment?.());
    if (!assignment) return null;

    const assignee = this.safeGetTextOrNull(() => assignment.assignee?.());
    const type = this.safeGetTextOrNull(() => assignment.type?.());

    if (assignee && type) {
      return `${assignee}:${type}`;
    }
    return assignee;
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }

  getStatements(): SequenceASTNode[] {
    const braceBlock = this.safeCall(() => this.ctx.braceBlock?.());
    if (!braceBlock) return [];

    const statements = this.safeCall(() => braceBlock.block?.()?.stat?.()) || [];
    return statements.map(
      (statCtx: BaseANTLRContext) => new ANTLRASTAdapter(statCtx),
    );
  }
}

export class ANTLRCreationAdapter
  extends ANTLRASTAdapter<ICreationContext>
  implements CreationNode
{
  constructor(ctx: ICreationContext) {
    super(ctx);
  }
  getAssigneePosition(): [number, number] | null {
    const assignee = this.safeCall(() => this.ctx.creationBody?.()?.assignment?.()?.assignee?.());
    if (!assignee || !assignee.start || !assignee.stop) {
      return null;
    }
    return [assignee.start.start, assignee.stop.stop + 1];
  }

  getOwner(): string {
    if (!this.getConstructor()) {
      return "Missing Constructor";
    }
    const assignee = this.getAssignee();
    const type = this.getConstructor();
    return assignee ? `${assignee}:${type}` : type;
  }

  getTo(): string | null {
    return this.getConstructor();
  }

  getFrom(): string | null {
    // Creation nodes don't have a 'from' in the traditional sense
    return null;
  }

  getSignature(): string {
    return this.getConstructor();
  }

  getStatements(): SequenceASTNode[] {
    const braceBlock = this.safeCall(() => this.ctx.braceBlock?.());
    if (!braceBlock) return [];

    const statements = this.safeCall(() => braceBlock.block?.()?.stat?.()) || [];
    return statements.map(
      (statCtx: BaseANTLRContext) => new ANTLRASTAdapter(statCtx),
    );
  }

  getConstructor(): string {
    return this.safeGetText(() => this.ctx.creationBody?.()?.construct?.())
  }

  getAssignee(): string | null {
    return this.safeGetText(() => this.ctx.creationBody?.()?.assignment?.()?.assignee?.())
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }
}

export class ANTLRParticipantAdapter
  extends ANTLRASTAdapter<IParticipantContext>
  implements ParticipantNode
{
  constructor(ctx: IParticipantContext) {
    super(ctx);
  }
  getComment(): string | null {
    throw new Error('Method not implemented.');
  }

  getName(): string {
    return this.safeGetText(() => this.ctx.name?.());
  }

  override getType(): string {
    return this.safeGetText(() => this.ctx.participantType?.()) || "ParticipantContext";
  }

  getParticipantType(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.participantType?.());
  }

  getStereotype(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.stereotype?.());
  }

  getLabel(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.label?.());
  }

  getWidth(): number | null {
    const widthText = this.safeGetTextOrNull(() => this.ctx.width?.());
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
  extends ANTLRASTAdapter<IAsyncMessageContext>
  implements AsyncMessageNode
{
  constructor(ctx: IAsyncMessageContext) {
    super(ctx);
  }

  getFrom(): string | null {
    return this.ctx.From?.() || this.safeGetTextOrNull(() => this.ctx.from?.());
  }

  getTo(): string | null {
    return this.ctx.To?.() || this.safeGetTextOrNull(() => this.ctx.to?.());
  }

  getOwner(): string | null {
    return this.getTo() || this.getOwnerFromAncestor();
  }

  private getOwnerFromAncestor(): string | null {
    let ctx = this.ctx.parentCtx;
    while (ctx) {
      // Check if this context has an Owner method through an adapter
      if (ctx.constructor.name === 'CreationContext') {
        const creationAdapter = new ANTLRCreationAdapter(ctx as any);
        return creationAdapter.getOwner();
      }
      if (ctx.constructor.name === 'MessageContext') {
        const messageAdapter = new ANTLRMessageAdapter(ctx as any);
        return messageAdapter.getOwner();
      }
      ctx = ctx.parentCtx;
    }
    return null;
  }

  getContent(): string {
    const text = this.safeGetText(() => this.ctx.content?.());
    return text.trim();
  }

  getSignature(): string {
    return this.ctx.SignatureText?.() || "";
  }

  getProvidedFrom(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.from?.());
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }
}

export class ANTLRFragmentAdapter
  extends ANTLRASTAdapter<IFragmentContext>
  implements FragmentNode
{
  constructor(ctx: IFragmentContext) {
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
      this.safeGetTextOrNull(() => this.ctx.condition?.()) ||
      this.safeGetTextOrNull(() => this.ctx.expr?.());
    return conditionText?.trim() || null;
  }

  getStatements(): SequenceASTNode[] {
    let statements: BaseANTLRContext[] = [];

    // Different fragment types have different ways to access their content
    const ifBlock = this.safeCall(() => this.ctx.ifBlock?.());
    if (ifBlock) {
      statements = this.safeCall(() => ifBlock.braceBlock?.()?.block?.()?.stat?.()) || [];
    } else {
      statements = this.safeCall(() => this.ctx.block?.()?.stat?.()) || [];
    }

    return statements.map(
      (statCtx: IStatContext) => new ANTLRASTAdapter(statCtx),
    );
  }

  getBraceBlock(): SequenceASTNode | null {
    const block = this.safeCall(() => this.ctx.block?.());
    if (!block) return null;
    return new ANTLRASTAdapter(block) as SequenceASTNode;
  }
}

export class ANTLRRetAdapter
  extends ANTLRASTAdapter<IRetContext>
  implements MessageNode
{
  constructor(ctx: IRetContext) {
    super(ctx);
  }

  getFrom(): string | null {
    // Return messages don't have an explicit 'from' - they return to the caller
    return null;
  }

  getTo(): string | null {
    // This should return the participant that this return message goes to
    return this.getReturnTo();
  }

  getReturnTo(): string | null {
    // This would need to be implemented based on the grammar structure
    // For now, we'll use the ancestor method to find the owner
    return this.getOwnerFromAncestor();
  }

  getSignature(): string {
    return this.safeGetText(() => this.ctx.expr?.()) || "";
  }

  getOwner(): string | null {
    return this.getTo() || this.getOwnerFromAncestor();
  }

  getOrigin(): string | null {
    return null;
  }

  private getOwnerFromAncestor(): string | null {
    let ctx = this.ctx.parentCtx;
    while (ctx) {
      // Check if this context has an Owner method through an adapter
      if (ctx.constructor.name === 'CreationContext') {
        const creationAdapter = new ANTLRCreationAdapter(ctx as any);
        return creationAdapter.getOwner();
      }
      if (ctx.constructor.name === 'MessageContext') {
        const messageAdapter = new ANTLRMessageAdapter(ctx as any);
        return messageAdapter.getOwner();
      }
      ctx = ctx.parentCtx;
    }
    return null;
  }

  hasAssignment(): boolean {
    return false; // Return messages typically don't have assignments
  }

  getAssignment(): string | null {
    return null;
  }

  getAsyncMessage(): string | null {
    return this.safeGetTextOrNull(() => this.ctx.asyncMessage?.());
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }

  getStatements(): SequenceASTNode[] {
    return []; // Return messages don't have nested statements
  }
}

export class ANTLRDividerAdapter
  extends ANTLRASTAdapter<IDividerContext>
  implements DividerNode
{
  constructor(ctx: IDividerContext) {
    super(ctx);
  }

  getNote(): string | null {
    // Try to get the note using the Note() method first (from DividerContext extensions)
    const note = this.safeCall(() => this.ctx.Note?.());
    if (note) return note;

    // Fallback to the dividerNote method
    const dividerNote = this.safeCall(() => this.ctx.dividerNote?.());
    if (!dividerNote) return null;

    const formattedText = this.safeCall(() => {
      const text = dividerNote.getFormattedText?.();
      return text?.trim();
    });
    if (!formattedText || !formattedText.startsWith("==")) {
      return null;
    }

    // Remove leading and trailing '=' characters
    return formattedText.replace(/^=+|=+$/g, "").trim() || null;
  }

  isCurrent(cursor: number): boolean {
    const [start, end] = this.getRange();
    return cursor >= start && cursor <= end;
  }
}

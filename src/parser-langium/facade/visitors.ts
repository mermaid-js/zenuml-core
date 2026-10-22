/**
 * Stage-4 visitor rewrites of the four ANTLR listener walks, running over the
 * Stage-3 facade (docs/langium-migration/04 §2, 07 §R11).
 *
 * All four are RE-ENTRANT: no module-level mutable state (the ANTLR
 * ToCollector/ChildFragmentDetector singletons are a documented do-not-port).
 * Blind-mode becomes "do not descend":
 *  - ToCollector skips Parameters AND Condition subtrees;
 *  - MessageCollector skips Parameters subtrees only (conditions are walked,
 *    matching the ANTLR listener which never blinds conditions);
 *  - the ANTLR quirk that blind-mode is NOT applied to ref/starter/ret is
 *    preserved structurally: those rules cannot occur inside parameters or
 *    conditions, so non-descent is behavior-identical (07 'port verbatim').
 */
import { _STARTER_, type Participants } from "@/parser/Participants";
import {
  createCollectState,
  onCreation,
  onParticipant,
  onRef,
  onRet,
  onStarter,
  onTo,
  type CollectState,
} from "@/parser/participantCollection";
import { OwnableMessageType } from "@/parser/OwnableMessage";
import type { OwnableMessage } from "@/parser/OwnableMessage";
import { topLevelFrame, type Frame } from "@/positioning/FrameBorder";
import {
  AltContext,
  AsyncMessageContext,
  ConditionContext,
  CreationContext,
  CriticalContext,
  Ctx,
  FromContext,
  GroupContext,
  LoopContext,
  MessageContext,
  OptContext,
  ParametersContext,
  ParContext,
  ParticipantContext,
  RefContext,
  RetContext,
  ReturnAsyncMessageContext,
  SectionContext,
  StarterExpContext,
  TcfContext,
  ToContext,
} from "./nodes";

/* ------------------------------------------------------------------ */
/* ToCollector — participants collection (src/parser/ToCollector.js)    */
/* ------------------------------------------------------------------ */

function onStarterExp(ctx: StarterExpContext, state: CollectState): void {
  const starter = ctx.starter();
  if (starter) onStarter(starter, state);
}

function collect(node: Ctx, state: CollectState): void {
  // Blind-mode by non-descent (07 §R11).
  if (node instanceof ParametersContext || node instanceof ConditionContext)
    return;

  if (node instanceof ParticipantContext) {
    onParticipant(node, state);
  } else if (node instanceof FromContext || node instanceof ToContext) {
    onTo(node, state);
  } else if (node instanceof StarterExpContext) {
    onStarterExp(node, state);
  } else if (node instanceof CreationContext) {
    onCreation(node, state);
  } else if (node instanceof RefContext) {
    onRef(node, state);
  } else if (node instanceof RetContext) {
    onRet(node, state);
  } else if (node instanceof GroupContext) {
    const previousGroupId = state.groupId;
    state.groupId = node.name()?.getFormattedText();
    for (const child of node.children ?? []) collect(child, state);
    // ANTLR exitGroup resets to undefined (groups don't nest in practice).
    state.groupId = undefined;
    void previousGroupId;
    return;
  }

  for (const child of node.children ?? []) collect(child, state);
}

/**
 * Drop-in replacement for the ANTLR ToCollector singleton: same
 * `getParticipants(ctx)` surface, re-entrant.
 */
export const LangiumToCollector = {
  getParticipants(context: any): Participants {
    const state = createCollectState();
    if (context) collect(context, state);
    return state.participants;
  },
};

/* ------------------------------------------------------------------ */
/* MessageCollector — AllMessages (src/parser/MessageCollector.ts)      */
/* ------------------------------------------------------------------ */

function addOwnedMessage(
  out: OwnableMessage[],
  type: OwnableMessageType,
  ctx: any,
): void {
  const from = ctx.From();
  const owner = ctx?.Owner();
  let signature = ctx?.SignatureText();
  // Method PRESENCE check, as in the ANTLR collector (`ctx.Assignment &&`).
  if (from === owner && typeof ctx.Assignment === "function") {
    const assignment = ctx.Assignment();
    if (assignment) {
      signature = `${assignment.getText()} = ${signature}`;
    }
  }
  out.push({ from, signature, type, to: owner });
}

function collectMessages(node: Ctx, out: OwnableMessage[]): void {
  if (node instanceof ParametersContext) return; // blind (parameters only)

  if (node instanceof MessageContext) {
    addOwnedMessage(out, OwnableMessageType.SyncMessage, node);
  } else if (node instanceof AsyncMessageContext) {
    addOwnedMessage(out, OwnableMessageType.AsyncMessage, node);
  } else if (node instanceof CreationContext) {
    addOwnedMessage(out, OwnableMessageType.CreationMessage, node);
  } else if (node instanceof ReturnAsyncMessageContext) {
    addOwnedMessage(out, OwnableMessageType.ReturnMessage, node);
  } else if (node instanceof RetContext) {
    if (!node.asyncMessage() && !node.returnAsyncMessage()) {
      addOwnedMessage(out, OwnableMessageType.ReturnMessage, node);
    }
  }

  for (const child of node.children ?? []) collectMessages(child, out);
}

export function langiumAllMessages(ctx: any): OwnableMessage[] {
  if (!ctx) return [];
  const out: OwnableMessage[] = [];
  collectMessages(ctx, out);
  return out;
}

/* ------------------------------------------------------------------ */
/* FrameBuilder (src/parser/FrameBuilder.ts)                            */
/* ------------------------------------------------------------------ */

const FRAGMENT_TYPE = new Map<any, string>([
  [TcfContext, "tcf"],
  [OptContext, "opt"],
  [ParContext, "par"],
  [AltContext, "alt"],
  [LoopContext, "loop"],
  [SectionContext, "section"],
  [CriticalContext, "critical"],
  [RefContext, "ref"],
]);

function fragmentType(node: Ctx): string | undefined {
  return FRAGMENT_TYPE.get(node.constructor);
}

/**
 * Local-participant names without the parser->positioning->parser cycle
 * (07 Stage 4: break it deliberately). Equivalent to
 * `getLocalParticipantNames(ctx)` = [ctx.Origin() || _STARTER_, ...names]:
 * the ANTLR generic Origin() on a fragment resolves through its direct
 * parent stat, which is exactly `ClosestAncestorStat().Origin()`.
 */
function localParticipantNames(ctx: Ctx): string[] {
  const origin = ctx.ClosestAncestorStat()?.Origin();
  return [
    origin || _STARTER_,
    ...LangiumToCollector.getParticipants(ctx).Names(),
  ];
}

export class LangiumFrameBuilder {
  private readonly _orderedParticipants: string[];
  private topLevelFrames: Frame[] = [];
  private parents: Frame[] = [];

  constructor(orderedParticipants: string[]) {
    this._orderedParticipants = orderedParticipants;
  }

  private getLeft(ctx: Ctx): string {
    const localParticipants = localParticipantNames(ctx);
    return (
      this._orderedParticipants.find((p) => localParticipants.includes(p)) || ""
    );
  }

  private getRight(ctx: Ctx): string {
    const localParticipants = localParticipantNames(ctx);
    return (
      this._orderedParticipants
        .slice()
        .reverse()
        .find((p) => localParticipants.includes(p)) || ""
    );
  }

  private enterFragment(ctx: Ctx, type: string): void {
    const frame: Frame = {
      type,
      left: this.getLeft(ctx),
      right: this.getRight(ctx),
      children: [],
    };
    if (this.parents.length > 0) {
      this.parents[this.parents.length - 1].children?.push(frame);
    } else {
      this.topLevelFrames.push(frame);
    }
    this.parents.push(frame);
  }

  private walk(node: Ctx): void {
    const type = fragmentType(node);
    if (type) this.enterFragment(node, type);
    for (const child of node.children ?? []) this.walk(child);
    if (type) this.parents.pop();
  }

  getFrame(context: any): Frame | null {
    if (!context) return null;
    this.topLevelFrames = [];
    this.parents = [];
    for (const child of context.children ?? []) this.walk(child);
    return topLevelFrame(this.topLevelFrames);
  }
}

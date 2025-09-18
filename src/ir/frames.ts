import antlr4 from "antlr4";
import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";
import { offsetRangeOf } from "@/parser/helpers";

export interface FrameIRNode {
  id: string;
  type?: string;
  left: string;
  right: string;
  children: FrameIRNode[];
}

export interface FramesModel {
  root: FrameIRNode | null;
  byId: Record<string, FrameIRNode>;
}

export function frameKeyOf(ctx: any): string | null {
  const range = offsetRangeOf(ctx);
  if (!range) return null;
  const [start, stopExclusive] = range;
  return `${start}:${stopExclusive}`;
}

class FramesIRCollector extends sequenceParserListener {
  private readonly ordered: string[];
  private stack: FrameIRNode[] = [];
  root: FrameIRNode | null = null;
  byId: Record<string, FrameIRNode> = {};

  constructor(orderedParticipants: string[]) {
    super();
    this.ordered = orderedParticipants;
  }

  private enterFragment(ctx: any, type: string) {
    const id = frameKeyOf(ctx);
    if (!id) return;

    const localParticipants = getLocalParticipantNames(ctx);
    const left =
      this.ordered.find((name) => localParticipants.includes(name)) ?? "";
    const right =
      [...this.ordered]
        .reverse()
        .find((name) => localParticipants.includes(name)) ?? "";

    const node: FrameIRNode = {
      id,
      type,
      left,
      right,
      children: [],
    };

    this.byId[id] = node;

    if (!this.root) {
      this.root = node;
    }

    if (this.stack.length > 0) {
      this.stack[this.stack.length - 1].children.push(node);
    }

    this.stack.push(node);
  }

  private exitFragment() {
    this.stack.pop();
  }

  enterTcf(ctx: any) {
    this.enterFragment(ctx, "tcf");
  }

  exitTcf() {
    this.exitFragment();
  }

  enterOpt(ctx: any) {
    this.enterFragment(ctx, "opt");
  }

  exitOpt() {
    this.exitFragment();
  }

  enterPar(ctx: any) {
    this.enterFragment(ctx, "par");
  }

  exitPar() {
    this.exitFragment();
  }

  enterAlt(ctx: any) {
    this.enterFragment(ctx, "alt");
  }

  exitAlt() {
    this.exitFragment();
  }

  enterLoop(ctx: any) {
    this.enterFragment(ctx, "loop");
  }

  exitLoop() {
    this.exitFragment();
  }

  enterSection(ctx: any) {
    this.enterFragment(ctx, "section");
  }

  exitSection() {
    this.exitFragment();
  }

  enterCritical(ctx: any) {
    this.enterFragment(ctx, "critical");
  }

  exitCritical() {
    this.exitFragment();
  }

  enterRef(ctx: any) {
    this.enterFragment(ctx, "ref");
  }

  exitRef() {
    this.exitFragment();
  }
}

export function buildFramesModel(
  context: any,
  orderedParticipants: string[],
): FramesModel {
  if (!context) {
    return { root: null, byId: {} };
  }
  const walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  const collector = new FramesIRCollector(orderedParticipants);
  const children: any[] = Array.isArray(context?.children)
    ? context.children
    : [];
  for (const child of children) {
    walker.walk(collector, child);
  }
  return {
    root: collector.root,
    byId: collector.byId,
  };
}

export function frameForContext(
  model: FramesModel,
  ctx: any,
): FrameIRNode | null {
  const key = frameKeyOf(ctx);
  if (!key) return null;
  return model.byId[key] ?? null;
}

import antlr4 from "antlr4";
import sequenceParserListener from "../generated-parser/sequenceParserListener";
import { Frame } from "@/positioning/FrameBorder";
import { Participants } from "./index";
import { Participant } from "@/parser/Participants";
import { _STARTER_ } from "@/parser/OrderedParticipants";
import { getLocalParticipantNames } from "@/positioning/LocalParticipants";

const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

class FrameBuilder extends sequenceParserListener {
  private _orderedParticipants: string[];
  private frameRoot: Frame | null = null;
  private parents: Frame[] = [];

  constructor(orderedParticipants: string[]) {
    super();
    this._orderedParticipants = orderedParticipants;
  }

  // TODO: extract a module to get local participants
  private getLocalParticipants(ctx: any): string[] {
    return [
      ctx.Origin() || _STARTER_,
      ...Participants(ctx)
        .ImplicitArray()
        .map((p: Participant) => p.name),
    ];
  }

  private getLeft(ctx: any): string {
    const localParticipants = getLocalParticipantNames(ctx);
    return (
      this._orderedParticipants.find((p) => localParticipants.includes(p)) || ""
    );
  }

  private getRight(ctx: any): string {
    return (
      this._orderedParticipants
        .slice()
        .reverse()
        .find((p) => getLocalParticipantNames(ctx).includes(p)) || ""
    );
  }

  enterFragment(ctx: any, type: string) {
    // Create a new frame for the current node
    const frame: Frame = {
      type,
      left: this.getLeft(ctx),
      right: this.getRight(ctx),
      children: [],
    };

    // If there's no root, set the current frame as root
    if (!this.frameRoot) {
      this.frameRoot = frame;
    }

    // If there are parents, add the frame to the last parent
    if (this.parents.length > 0) {
      this.parents[this.parents.length - 1].children?.push(frame);
    }

    // Add the current frame to the parent stack
    this.parents.push(frame);
  }

  exitFragment() {
    // Remove the current frame from the parent stack
    this.parents.pop();
  }

  enterTcf(ctx: any) {
    this.enterFragment(ctx, "tcf");
  }

  enterOpt(ctx: any) {
    this.enterFragment(ctx, "opt");
  }

  enterPar(ctx: any) {
    this.enterFragment(ctx, "par");
  }

  enterAlt(ctx: any) {
    this.enterFragment(ctx, "alt");
  }

  enterLoop(ctx: any) {
    this.enterFragment(ctx, "loop");
  }

  enterSection(ctx: any): void {
    this.enterFragment(ctx, "section");
  }

  enterCritical(ctx: any): void {
    this.enterFragment(ctx, "critical");
  }

  enterRef(ctx: any) {
    this.enterFragment(ctx, "ref");
  }

  exitTcf() {
    this.exitFragment();
  }
  exitOpt() {
    this.exitFragment();
  }
  exitPar() {
    this.exitFragment();
  }
  exitAlt() {
    this.exitFragment();
  }
  exitLoop() {
    this.exitFragment();
  }
  exitSection() {
    this.exitFragment();
  }
  exitCritical() {
    this.exitFragment();
  }
  exitRef() {
    this.exitFragment();
  }

  getFrame(context: any) {
    context.children.map((child: any) => {
      walker.walk(this, child);
    });
    return this.frameRoot;
  }
}

export default FrameBuilder;

import antlr4 from "antlr4";
import sequenceParserListener from "../generated-parser/sequenceParserListener";
import { Frame } from "@/positioning/FrameBorder";
import { Participants } from "./index";
import { Participant } from "@/parser/Participants";

const walker = antlr4.tree.ParseTreeWalker.DEFAULT;

class FrameBuilder extends sequenceParserListener {
  private _orderedParticipants: string[];
  private frameRoot: Frame | null = null;
  private parents: Frame[] = [];

  constructor(orderedParticipants: string[]) {
    super();
    this._orderedParticipants = orderedParticipants;
  }

  private getLocalParticipants(ctx: any): string[] {
    return [
      ctx.Origin(),
      ...Participants(ctx)
        .ImplicitArray()
        .map((p: Participant) => p.name),
    ];
  }

  private getLeft(ctx: any): string {
    const localParticipants = this.getLocalParticipants(ctx);
    return (
      this._orderedParticipants.find((p) => localParticipants.includes(p)) || ""
    );
  }

  private getRight(ctx: any): string {
    return (
      this._orderedParticipants
        .slice()
        .reverse()
        .find((p) => this.getLocalParticipants(ctx).includes(p)) || ""
    );
  }

  enterFragment(ctx: any) {
    // Create a new frame for the current node
    const frame: Frame = {
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
    this.enterFragment(ctx);
  }

  enterOpt(ctx: any) {
    this.enterFragment(ctx);
  }

  enterPar(ctx: any) {
    this.enterFragment(ctx);
  }

  enterAlt(ctx: any) {
    this.enterFragment(ctx);
  }

  enterLoop(ctx: any) {
    this.enterFragment(ctx);
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

  getFrame(context: any) {
    context.children.map((child: any) => {
      walker.walk(this, child);
    });
    return this.frameRoot;
  }
}

export default FrameBuilder;

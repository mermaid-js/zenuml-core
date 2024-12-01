import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { SwimLane, SwimLanes } from "./SwimLane";
import sequenceParser from "@/generated-parser/sequenceParser";
import antlr4 from "antlr4";
import sequenceLexer from "@/generated-parser/sequenceLexer";
import { formatText } from "@/utils/StringUtil";
import { IStatement } from "./types";
import { AltStatement } from "./AltStatement";
import { MessageStatement } from "./MessageStatement";
import { AsyncMessageStatement } from "./AsyncMessageStatement";

// const statementContextMethods = [
//   "message",
//   "alt",
//   "par",
//   "opt",
//   "critical",
//   "section",
//   "ref",
//   "loop",
//   "creation",
// ];

// @ts-ignore
antlr4.ParserRuleContext.prototype.getFormattedText = function () {
  // @ts-ignore
  const code = this.parser.getTokenStream().getText(this.getSourceInterval());
  // remove extra quotes, spaes and new lines
  return formatText(code);
};

class SeqErrorListener extends antlr4.error.ErrorListener {
  errors: string[] = [];

  syntaxError(
    recognizer: antlr4.Parser,
    offendingSymbol: antlr4.Token,
    line: number,
    column: number,
    msg: string,
  ) {
    this.errors.push(`${offendingSymbol} line ${line}, col ${column}: ${msg}`);
  }
}

export function rootContext(code: string) {
  const chars = new antlr4.InputStream(code);
  const lexer = new sequenceLexer(chars);
  const tokens = new antlr4.CommonTokenStream(lexer);
  const parser = new sequenceParser(tokens);
  parser.addErrorListener(new SeqErrorListener());
  return parser.prog();
}

// Create a dedicated collector class
class SwimLaneCollector extends sequenceParserListener {
  private swimLanes: SwimLanes;
  previousLane: SwimLane | null = null;

  constructor(swimLanes: SwimLanes) {
    super();
    this.swimLanes = swimLanes;
  }

  setCurrentStatement(stat: IStatement) {
    this.swimLanes.setCurrentStatement(stat);
  }

  // Implement enter/exit methods for the nodes you want to collect
  enterParticipant(ctx: any) {
    // Add participant to swim lanes
    const participant = ctx.name()?.getFormattedText();
    this.swimLanes.getLane(participant);
  }

  enterAlt(ctx: any): void {
    const statement = new AltStatement(
      ctx,
      this.swimLanes,
      this.swimLanes.currentStatement,
    );
    this.setCurrentStatement(statement);
  }

  exitAlt(): void {
    if (!(this.swimLanes.currentStatement instanceof AltStatement)) {
      throw new Error("Current statement is not an AltStatement");
    }

    this.swimLanes.currentStatement.setFinished();
    const parent = this.swimLanes.currentStatement.getParent();
    if (!parent) {
      throw new Error("No parent statement");
    }
    this.setCurrentStatement(parent);
  }

  enterAsyncMessage(ctx: any): void {
    const asyncMessageStatement = new AsyncMessageStatement(
      ctx,
      this.swimLanes,
      this.swimLanes.currentStatement,
    );
    this.setCurrentStatement(asyncMessageStatement);
  }

  /*   enterAsyncMessage(ctx: any): void {
      const from = ctx.from();
      const to = ctx.to();
      const message = ctx.content().getFormattedText();

      const fromName = from.getFormattedText();
      const toName = to.getFormattedText();
      const fromLane = this.swimLanes.getLane(fromName);
      const toLane = this.swimLanes.getLane(toName);
      const lastNode = fromLane.lastNode();
      // if (lastNode) {
      //   toLane.setInboundNode(lastNode);
      //   new MessageNode(message, toLane, lastNode.rank);
      // } else {
      // const emptyNode = new EmptyMessageNode(fromLane);
      //   toLane.setInboundNode(emptyNode);
      //   new MessageNode(message, toLane, emptyNode.rank);
      // }

      new MessageNode(message, fromLane);
      this.previousLane = fromLane;

      if (this.previousLane && this.previousLane.name !== toName) {
        const outBoundNode = this.previousLane?.lastNode();
        toLane.setInboundNode(outBoundNode);
        new EmptyMessageNode(toLane, outBoundNode?.rank);
      } else {
        new EmptyMessageNode(toLane);
      }
      this.previousLane = toLane;
    } */

  enterMessage(ctx: any): void {
    const messageStatement = new MessageStatement(
      ctx,
      this.swimLanes,
      this.swimLanes.currentStatement,
    );
    this.setCurrentStatement(messageStatement);
  }

  // Add other enter/exit methods as needed
  /*   enterMessageBody(ctx: any) {
      const to = ctx.to();
      const message = ctx.func().signature()[0].getFormattedText();

      const toName = to.getFormattedText();
      const toLane = this.swimLanes.getLane(toName);
      if (this.previousLane && this.previousLane.name !== toName) {
        const outBoundNode = this.previousLane?.lastNode();
        toLane.setInboundNode(outBoundNode);
        new MessageNode(message, toLane, outBoundNode?.rank);
      } else {
        new MessageNode(message, toLane);
      }
      this.previousLane = toLane;
    } */
}

export class SwimLaneDiagram {
  private walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  private swimLanes: SwimLanes | null = null;

  constructor(input: string | ReturnType<typeof rootContext>) {
    this.parse(input);
  }

  getSwimLanes() {
    if (!this.swimLanes) {
      throw new Error("SwimLanes not initialized");
    }
    return this.swimLanes.lanes;
  }

  getMaxRank() {
    if (!this.swimLanes) {
      throw new Error("SwimLanes not initialized");
    }
    return this.swimLanes.maxRank;
  }

  parse(input: string | ReturnType<typeof rootContext>) {
    let context: ReturnType<typeof rootContext>;
    if (typeof input === "string") {
      context = rootContext(input);
    } else {
      context = input;
    }
    this.swimLanes = new SwimLanes(context);
    const collector = new SwimLaneCollector(this.swimLanes);
    this.walker.walk(collector, context);
  }

  toJson() {
    if (!this.swimLanes) {
      throw new Error("SwimLanes not initialized");
    }
    return this.swimLanes.toJson();
  }

  createDiagram() {
    if (!this.swimLanes) {
      throw new Error("SwimLanes not initialized");
    }
    return this.swimLanes.createDiagram();
  }
}

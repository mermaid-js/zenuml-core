import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { SwimLane, SwimLanes } from "./SwimLane";
import sequenceParser from "@/generated-parser/sequenceParser";
import antlr4 from "antlr4";
import sequenceLexer from "@/generated-parser/sequenceLexer";
import { formatText } from "@/utils/StringUtil";
import { IBlockStatement } from "./types";
import { AltStatement } from "./AltStatement";
import { MessageStatement } from "./MessageStatement";
import { AsyncMessageStatement } from "./AsyncMessageStatement";
import { LoopStatement } from "./LoopStatement";
import { BlockStatement } from "./Statement";

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

  getCurrentBlockStatement() {
    return this.swimLanes.currentBlockStatement;
  }

  setCurrentBlockStatement(statement: IBlockStatement) {
    this.swimLanes.setCurrentBlockStatement(statement);
  }

  // Implement enter/exit methods for the nodes you want to collect
  enterParticipant(ctx: any) {
    // Add participant to swim lanes
    const participant = ctx.name()?.getFormattedText();
    this.swimLanes.getLane(participant);
  }

  enterAlt(ctx: any): void {
    const blkStatement = new AltStatement(
      ctx,
      this.swimLanes,
      this.getCurrentBlockStatement(),
    );
    this.setCurrentBlockStatement(blkStatement);
  }

  enterIfBlock(ctx: any): void {
    const currentStatement = this.getCurrentBlockStatement();
    if (!(currentStatement instanceof AltStatement)) {
      throw new Error("Current statement is not an AltStatement");
    }
    currentStatement.if(ctx);
  }

  enterElseIfBlock(ctx: any): void {
    const currentStatement = this.getCurrentBlockStatement();
    if (!(currentStatement instanceof AltStatement)) {
      throw new Error("Parent statement is not an AltStatement");
    }

    currentStatement.elseIf(ctx);
  }

  enterElseBlock(ctx: any): void {
    const currentStatement = this.getCurrentBlockStatement();
    if (!(currentStatement instanceof AltStatement)) {
      throw new Error("Current statement is not an AltStatement");
    }
    currentStatement.else(ctx);
  }

  exitAlt(): void {
    this.exitBlockStatement(AltStatement, "AltStatement");
  }

  enterLoop(ctx: any): void {
    const blkStatement = new LoopStatement(
      ctx,
      this.swimLanes,
      this.getCurrentBlockStatement(),
    );
    this.setCurrentBlockStatement(blkStatement);
  }

  exitLoop(): void {
    this.exitBlockStatement(LoopStatement, "LoopStatement");
  }

  enterAsyncMessage(ctx: any): void {
    const blkStatement = this.getCurrentBlockStatement();
    new AsyncMessageStatement(ctx, this.swimLanes, blkStatement);
  }

  enterMessage(ctx: any): void {
    const blkStatement = this.getCurrentBlockStatement();
    new MessageStatement(ctx, this.swimLanes, blkStatement);
  }

  private exitBlockStatement<T extends BlockStatement>(
    StatementType: new (...args: any[]) => T,
    statementName: string,
  ): void {
    const currentStatement = this.getCurrentBlockStatement();
    if (!(currentStatement instanceof StatementType)) {
      throw new Error(`Current statement is not a ${statementName}`);
    }

    currentStatement.setFinished();
    const parentStatement = currentStatement.getParent();
    if (!parentStatement) {
      throw new Error("Parent statement is null");
    }
    this.setCurrentBlockStatement(parentStatement);
  }
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
    return this.swimLanes.toJson;
  }

  createDiagram() {
    if (!this.swimLanes) {
      throw new Error("SwimLanes not initialized");
    }
    return this.swimLanes.createDiagram();
  }
}

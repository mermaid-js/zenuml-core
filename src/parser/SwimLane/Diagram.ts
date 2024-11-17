import sequenceParserListener from "@/generated-parser/sequenceParserListener";
import { SwimLane, SwimLanes } from "./SwimLane";
import { Node } from "./Node";
import sequenceParser from "@/generated-parser/sequenceParser";
import antlr4 from "antlr4";
import sequenceLexer from "@/generated-parser/sequenceLexer";
import { formatText } from "@/utils/StringUtil";

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

function rootContext(code: string) {
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

  // Implement enter/exit methods for the nodes you want to collect
  enterParticipant(ctx: any) {
    // Add participant to swim lanes
    const participant = ctx.name()?.getFormattedText();
    this.swimLanes.getLane(participant);
  }

  // enterGroup(ctx: any) {
  //   // Handle group information
  // }
  enterAsyncMessage(ctx: any): void {
    const from = ctx.from();
    const to = ctx.to();
    const message = ctx.content().getFormattedText();

    const fromLane = this.swimLanes.getLane(from);
    const toLane = this.swimLanes.getLane(to);
    const outBoundNode = fromLane.lastNode();
    toLane.setInBoundNode(outBoundNode);
    new Node(message, toLane, outBoundNode.rank);
    this.previousLane = toLane;
  }

  // Add other enter/exit methods as needed
  enterMessageBody(ctx: any) {
    const to = ctx.to();
    const message = ctx.func().signature()[0].getFormattedText();

    const toName = to.getFormattedText();
    const toLane = this.swimLanes.getLane(toName);
    if (this.previousLane && this.previousLane.name !== toName) {
      const outBoundNode = this.previousLane?.lastNode();
      toLane.setInBoundNode(outBoundNode);
      new Node(message, toLane, outBoundNode.rank);
    } else {
      new Node(message, toLane);
    }
    this.previousLane = toLane;
    // } else {
    //   const fromLane = this.swimLanes.getLane(from);
    //   const toLane = this.swimLanes.getLane(to);
    //   if (this.previousLane && this.previousLane.name !== to) {
    //     const outBoundNode = this.previousLane?.lastNode();
    //     toLane.setInBoundNode(outBoundNode);
    //   }
    //   new Node(message, fromLane);
    //   this.previousLane = toLane;
    // }
  }
}

export class SwimLaneDiagram {
  private collector: SwimLaneCollector;
  private walker = antlr4.tree.ParseTreeWalker.DEFAULT;
  swimLanes: SwimLanes = new SwimLanes();

  constructor() {
    this.collector = new SwimLaneCollector(this.swimLanes);
  }

  getSwimLanes() {
    return this.swimLanes.lanes;
  }

  getMaxRank() {
    return this.swimLanes.getMaxRank();
  }

  parse(input: string | typeof rootContext) {
    let context;
    if (typeof input === "string") {
      context = rootContext(input);
    } else {
      context = input;
    }
    this.walker.walk(this.collector, context);
  }

  toJson() {
    return this.swimLanes.toJson();
  }
}

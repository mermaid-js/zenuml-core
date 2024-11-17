// @ts-ignore
import { ParserRuleContext, ParseTreeWalker } from "antlr4ng";
import { activityParserListener } from "@/generated-ts-parser/activityParserListener";
import {
  ActivityContext,
  StatementContext,
} from "@/generated-ts-parser/activityParser";
import { formatText } from "@/utils/StringUtil";
import { EdgeData, NodeData } from "@antv/g6";

type NodeModel = {
  id: string;
  name: string;
  type?: string;
  order?: number;
};

type EdgeModel = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: NodeData[];
  edges: EdgeData[];
};

function getFormattedText<T extends ParserRuleContext>(ctx: T): string {
  const code = ctx.getText();
  return formatText(code);
}

export class GraphListener extends activityParserListener {
  private nodes: NodeModel[] = [];

  constructor() {
    super();
  }

  getClosestAncestorByType<T extends ParserRuleContext>(
    ctx: ParserRuleContext,
    type: new (...args: any[]) => T, // Change the type parameter to a constructor
  ): T | null {
    let parent = ctx.parent;
    while (parent) {
      if (parent instanceof type) {
        return parent as unknown as T;
      }
      parent = parent.parent;
    }
    return null;
  }

  enterStatement = (ctx: StatementContext) => {
    const name = getStatementType(ctx);

    switch (name) {
      case "Start":
        this.nodes.push({
          id: "start",
          name: "start",
          type: "start",
          order: 0,
        });
        break;
      case "Stop":
        this.nodes.push({
          id: "stop",
          name: "stop",
          type: "stop",
          order: this.nodes.length,
        });
        break;
      case "End":
        this.nodes.push({
          id: "end",
          name: "end",
          type: "stop",
          order: this.nodes.length,
        });
        break;
      default:
        console.log(name);
        break;
    }
  };
  enterActivity = (ctx: ActivityContext) => {
    const activity = getFormattedText(ctx);
    const regex = /^:([^:;]+);$/;
    const match = activity.match(regex);
    const name = match ? match[1] : activity;
    const id = name.replace(/[^a-zA-Z0-9]/g, "_");

    this.nodes.push({
      id: id,
      name,
      type: "activity",
      order: this.nodes.length,
    });
  };

  reset() {
    this.nodes = [];
  }

  get edges(): EdgeModel[] {
    return this.nodes.reduce<EdgeModel[]>((acc, node, index) => {
      if (node.type === "activity" || node.type === "stop") {
        acc.push({
          source: this.nodes[index - 1].id,
          target: node.id,
        });
      }
      return acc;
    }, []);
  }

  toNodeData(node: NodeModel): NodeData {
    switch (node.type) {
      case "start":
      case "stop":
        return {
          id: node.id,
          type: "circle",
          style: {
            size: 20,
            fill: "#000",
            stroke: "#000",
            lineWidth: 2,
          },
        };
      case "activity":
      default: {
        const width = Math.max(30, node.name.length * 10);
        return {
          id: node.id,
          type: "rect",
          style: {
            radius: 8,
            size: [width, 30],
            labelPlacement: "center",
            labelText: node.name,
            fill: "#fff",
            stroke: "#000",
            lineWidth: 2,
          },
        };
      }
    }
  }

  toEdgeData(edge: EdgeModel): EdgeData {
    return {
      source: edge.source,
      target: edge.target,
      type: "polyline",
      style: {
        endArrow: true,
        lineWidth: 2,
        stroke: "#000",
      },
    };
  }

  get graph(): GraphData {
    return {
      nodes: this.nodes.map(this.toNodeData),
      edges: this.edges.map(this.toEdgeData),
    };
  }

  parse(ctx: ParserRuleContext) {
    this.reset();
    const walker = new ParseTreeWalker();
    walker.walk(this, ctx);
    return this.graph;
  }
}

function getStatementType(ctx: any) {
  if (ctx.activity()) {
    return "Activity";
  } else if (ctx.START()) {
    return "Start";
  } else if (ctx.STOP()) {
    return "Stop";
  } else if (ctx.END()) {
    return "End";
  } else if (ctx.ifStatement()) {
    return "If";
  } else if (ctx.switchStatement()) {
    return "Switch";
  } else if (ctx.repeatStatement()) {
    return "Repeat";
  } else if (ctx.whileStatement()) {
    return "While";
  } else if (ctx.forkStatement()) {
    return "Fork";
  } else if (ctx.splitStatement()) {
    return "Split";
  } else if (ctx.noteStatement()) {
    return "Note";
  } else if (ctx.partitionStatement()) {
    return "Partition";
  } else if (ctx.groupStatement()) {
    return "Group";
  } else if (ctx.detachStatement()) {
    return "Detach";
  } else if (ctx.killStatement()) {
    return "Kill";
  } else if (ctx.labelStatement()) {
    return "Label";
  } else if (ctx.gotoStatement()) {
    return "Goto";
  } else if (ctx.swimlane()) {
    return "Swimlane";
  } else if (ctx.ARROW()) {
    return "Arrow";
  } else {
    return "Unknown";
  }
}

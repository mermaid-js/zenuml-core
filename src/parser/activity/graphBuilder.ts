import {
  ActivityContext,
  ActivityDiagramContext,
  IfStatementContext,
  StatementContext,
  ConditionContext,
  ElseBlockContext,
  ElseIfBlockContext,
  IfBlockContext,
  WhileStatementContext,
  RepeatStatementContext,
  BranchLabelContext,
} from "@/generated-ts-parser/activityParser";
import { EdgeData, NodeData } from "@antv/g6";
import { getFormattedText } from ".";
import { uniqueId } from "lodash";

type NodeModel = {
  id: string;
  name: string;
  type?: string;
};

type EdgeModel = {
  source: string;
  target: string;
  label?: string;
};

export type GraphData = {
  nodes: NodeData[];
  edges: EdgeData[];
};

interface Builder {
  startNode: NodeModel | null;
  endNode: NodeModel | null;
  build(): void;
}

export class Graph {
  nodes: NodeModel[] = [];
  edges: EdgeModel[] = [];

  addNode(node: NodeModel) {
    this.nodes.push(node);
  }

  addEdge(edge: EdgeModel) {
    this.edg.push(edge);
  }

  #toNodeData(node: NodeModel): NodeData {
    switch (node.type) {
      case "start":
      case "end":
      case "stop":
        return {
       ,   id: node.id,
        type: "circle",
          style: {
            size: 20,
            fill: "#000",
            stroke: "#000",
            lineWidth: 2,
          },
        };
      case "endif":
        return {
          id: node.id,
          type: "diamond",
          style: {
            size: 20,
            fill: "#000",
            stroke: "#000",
            lineWidth: 2,
          },
        };
      case "if":
      case "elseif": {
        const width = Math.max(30, node.name.length * 10);
        return {
          id: node.id,
          type: "ellipse",
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

  #toEdgeData(edge: EdgeModel): EdgeData {
    return {
      source: edge.source,
      target: edge.target,
      type: "polyline",
      style: {
        endArrow: true,
        lineWidth: 2,
        stroke: "#000",
        label: true,
        labelPlacement: "center",
        labelAutoRotate: true,
        labelBackground: true,
        labelBackgroundFill: "#fff",
        labelBackgroundFillOpacity: 1,
        labelPadding: 10,
        labelText: edge.label,
      },
    };
  }

  getModel(): { nodes: NodeModel[]; edges: EdgeModel[] } {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  getGraphData(): GraphData {
    return {
      nodes: this.nodes.map(this.#toNodeData),
      edges: this.edges.map(this.#toEdgeData),
    };
  }
}

abstract class StatementBuilderFactory {
  abstract createBuilder(ctx: StatementContext): Builder | null;
}

class ConcreteStatementBuilderFactory extends StatementBuilderFactory {
  constructor(private builder: ActivityDiagramBuilder) {
    super();
  }

  createBuilder(ctx: StatementContext): Builder | null {
    if (ctx.activity()) {
      return new ActivityBuilder(this.builder, ctx.activity()!);
    }
    if (ctx.ifStatement()) {
      return new IfStatementBuilder(this.builder, ctx.ifStatement()!);
    }
    // ... other conditions ...
    return null;
  }
}

export class ActivityDiagramBuilder implements Builder {
  #root: ActivityDiagramContext;
  statementFactory: StatementBuilderFactory;
  nodes: NodeModel[] = [];
  edges: EdgeModel[] = [];
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;

  constructor(private ctx: ActivityDiagramContext) {
    this.#root = ctx;
    this.statementFactory = new ConcreteStatementBuilderFactory(this);
  }

  build() {
    const statement = this.#root.statement();
    let previousNode: NodeModel | null = null;
    for (const child of statement) {
      if (child.START()) {
        previousNode = {
          id: "start",
          name: "start",
          type: "start",
        };
        this.startNode = previousNode;
        this.nodes.push(previousNode);
      } else if (child.STOP()) {
        const node = {
          id: "stop",
          name: "stop",
          type: "stop",
        };
        this.endNode = node;
        this.nodes.push(node);
        if (previousNode) {
          this.edges.push({
            source: previousNode.id,
            target: node.id,
          });
        }
      } else if (child.END()) {
        const node = {
          id: "end",
          name: "end",
          type: "end",
        };
        this.endNode = node;
        this.nodes.push(node);
        if (previousNode) {
          this.edges.push({
            source: previousNode.id,
            target: node.id,
          });
        }
      } else if (child.ifStatement()) {
        const ifStatementBuilder = new IfStatementBuilder(
          this,
          child.ifStatement()!,
        );
        ifStatementBuilder.build();
        const startNode = ifStatementBuilder.startNode;
        if (previousNode && startNode) {
          this.edges.push({
            source: previousNode.id,
            target: startNode.id,
          });
        }
        if (ifStatementBuilder.endNode) {
          previousNode = ifStatementBuilder.endNode;
        }
      } else if (child.activity()) {
        const activityBuilder = new ActivityBuilder(this, child.activity()!);
        activityBuilder.build();
        if (previousNode && activityBuilder.startNode) {
          this.edges.push({
            source: previousNode.id,
            target: activityBuilder.startNode.id,
          });
          previousNode = activityBuilder.startNode;
        }
      } else if (child.whileStatement()) {
        // TODO
      } else if (child.repeatStatement()) {
        // TODO
      }
    }
  }

  #toNodeData(node: NodeModel): NodeData {
    switch (node.type) {
      case "start":
      case "end":
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
      case "endif":
        return {
          id: node.id,
          type: "diamond",
          style: {
            size: 20,
            fill: "#fff",
            stroke: "#000",
            lineWidth: 2,
          },
        };
      case "if":
      case "elseif": {
        const width = Math.max(30, node.name.length * 10);
        return {
          id: node.id,
          type: "ellipse",
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

  #toEdgeData(edge: EdgeModel): EdgeData {
    return {
      source: edge.source,
      target: edge.target,
      type: "polyline",
      style: {
        endArrow: true,
        lineWidth: 2,
        stroke: "#000",
        label: true,
        labelPlacement: "center",
        labelAutoRotate: true,
        labelBackground: true,
        labelBackgroundFill: "#fff",
        labelBackgroundFillOpacity: 1,
        labelPadding: 10,
        labelText: edge.label,
      },
    };
  }

  getModel(): { nodes: NodeModel[]; edges: EdgeModel[] } {
    return {
      nodes: this.nodes,
      edges: this.edges,
    };
  }

  getGraphData(): GraphData {
    return {
      nodes: this.nodes.map(this.#toNodeData),
      edges: this.edges.map(this.#toEdgeData),
    };
  }
}

class ActivityBuilder implements Builder {
  #builder: ActivityDiagramBuilder;
  #ctx: ActivityContext;
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;
  constructor(builder: ActivityDiagramBuilder, ctx: ActivityContext) {
    this.#builder = builder;
    this.#ctx = ctx;
  }

  build(): void {
    const activityText = getFormattedText(this.#ctx).slice(1, -1);
    const id = activityText.replace(/[^a-zA-Z0-9 ]/g, "_");
    const node: NodeModel = {
      id,
      name: activityText,
      type: "activity",
    };
    this.startNode = this.endNode = node;
    this.#builder.nodes.push(node);
  }
}

class StatementFactory {
  #builder: ActivityDiagramBuilder;
  constructor(builder: ActivityDiagramBuilder) {
    this.#builder = builder;
  }

  parse(ctx: StatementContext): Builder | null {
    if (ctx.activity()) {
      return new ActivityBuilder(this.#builder, ctx.activity()!);
    }
    if (ctx.ifStatement()) {
      return new IfStatementBuilder(this.#builder, ctx.ifStatement()!);
    }
    if (ctx.whileStatement()) {
      return new WhileStatementBuilder(this.#builder, ctx.whileStatement()!);
    }
    if (ctx.repeatStatement()) {
      return new RepeatStatementBuilder(this.#builder, ctx.repeatStatement()!);
    }
    return null;
  }
}

class IfStatementBuilder implements Builder {
  #builder: ActivityDiagramBuilder;
  #ctx: IfStatementContext;
  #ifBlock: ConditionBlockBuilder;
  #elseIfBlocks: ConditionBlockBuilder[] = [];
  #elseBlock: ElseBlockContextBuilder | null;
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;
  constructor(builder: ActivityDiagramBuilder, ctx: IfStatementContext) {
    this.#builder = builder;
    this.#ctx = ctx;
    this.#ifBlock = new ConditionBlockBuilder(builder, ctx.ifBlock());
    this.#elseIfBlocks = ctx
      .elseIfBlock()
      .map((elseIfCtx) => new ConditionBlockBuilder(builder, elseIfCtx));
    const elseBlock = ctx.elseBlock();
    this.#elseBlock = elseBlock
      ? new ElseBlockContextBuilder(builder, elseBlock)
      : null;
  }

  build() {
    const endNode: NodeModel = {
      id: uniqueId("endif"),
      name: "endif",
      type: "endif",
    };
    this.endNode = endNode;
    this.#builder.nodes.push(endNode);

    // if block
    this.#ifBlock.build();
    this.startNode = this.#ifBlock.startNode;
    if (this.#ifBlock.endNode) {
      this.#builder.edges.push({
        source: this.#ifBlock.endNode.id,
        target: this.endNode.id,
      });
    }

    // else if blocks
    this.#elseIfBlocks.forEach((block) => {
      block.build();
      if (this.startNode && block.startNode) {
        this.#builder.edges.push({
          source: this.startNode.id,
          target: block.startNode.id,
        });
      }

      if (this.endNode && block.endNode) {
        this.#builder.edges.push({
          source: block.endNode.id,
          target: this.endNode.id,
        });
      }
    });

    // else block
    if (this.#elseBlock) {
      this.#elseBlock.build();
      if (this.startNode && this.#elseBlock.startNode) {
        this.#builder.edges.push({
          source: this.startNode.id,
          target: this.#elseBlock.startNode.id,
          label: this.#elseBlock.branchLabel,
        });
      }
      if (this.endNode && this.#elseBlock.endNode) {
        this.#builder.edges.push({
          source: this.#elseBlock.endNode.id,
          target: this.endNode.id,
        });
      }
    }
  }
}

class WhileStatementBuilder implements Builder {
  #builder: ActivityDiagramBuilder;
  #ctx: WhileStatementContext;
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;
  constructor(builder: ActivityDiagramBuilder, ctx: WhileStatementContext) {
    this.#builder = builder;
    this.#ctx = ctx;
  }
  build(): void {
    throw new Error("Method not implemented.");
  }
}

class RepeatStatementBuilder implements Builder {
  #builder: ActivityDiagramBuilder;
  #ctx: RepeatStatementContext;
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;
  constructor(builder: ActivityDiagramBuilder, ctx: RepeatStatementContext) {
    this.#builder = builder;
    this.#ctx = ctx;
  }
  build(): void {
    throw new Error("Method not implemented.");
  }
}

class ElseBlockContextBuilder implements Builder {
  #builder: ActivityDiagramBuilder;
  #ctx: ElseBlockContext;
  #statements: StatementContext[] = [];
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;
  branchLabel: string = "";
  constructor(builder: ActivityDiagramBuilder, ctx: ElseBlockContext) {
    this.#builder = builder;
    this.#ctx = ctx;
    this.#statements = ctx.statement();
  }

  build() {
    const statements = this.#statements;
    this.branchLabel = this.#ctx.branchLabel()?.IDENTIFIER()?.getText() ?? "";

    let previousNode: NodeModel | null = null;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const builder = this.#builder.statementFactory.createBuilder(statement);
      if (builder) {
        builder.build();
      } else {
        continue;
      }

      if (builder.startNode) {
        if (i === 0) {
          this.startNode = builder.startNode;
          previousNode = this.startNode;
        } else if (previousNode) {
          this.#builder.edges.push({
            source: previousNode.id,
            target: builder.startNode.id,
          });
        }
      }

      if (builder.endNode) {
        previousNode = builder.endNode;

        if (i === statements.length - 1) {
          this.endNode = builder.endNode;
        }
      }
    }
  }
}

interface BranchBlockContext {
  condition(): ConditionContext;
  branchLabel(): BranchLabelContext | null;
  statement(): StatementContext[];
  statement(i: number): StatementContext | null;
  statement(i?: number): StatementContext[] | StatementContext | null;
}

class ConditionBlockBuilder implements Builder {
  #builder: ActivityDiagramBuilder;
  #ctx: BranchBlockContext;
  #condition: ConditionContext;
  #statements: StatementContext[] = [];
  branchLabel: string = "";
  startNode: NodeModel | null = null;
  endNode: NodeModel | null = null;
  constructor(graphBuilder: ActivityDiagramBuilder, ctx: BranchBlockContext) {
    this.#builder = graphBuilder;
    this.#ctx = ctx;
    this.#condition = ctx.condition?.() ?? null;
    this.#statements = ctx.statement();
  }

  conditionType() {
    if (this.#ctx instanceof IfBlockContext) {
      return "if";
    } else if (this.#ctx instanceof ElseIfBlockContext) {
      return "elseif";
    } else if (this.#ctx instanceof ElseBlockContext) {
      return "else";
    }
    throw new Error("Invalid condition block context");
  }

  build() {
    const condition = this.#condition;
    const conditionText = getFormattedText(condition).slice(1, -1);
    const id = conditionText.replace(/[^a-zA-Z0-9]/g, "");
    this.branchLabel = this.#ctx.branchLabel()?.IDENTIFIER()?.getText() ?? "";
    const type = this.conditionType();
    const startNode: NodeModel = {
      id: uniqueId(id),
      name: conditionText,
      type: type,
    };
    this.startNode = startNode;
    this.#builder.nodes.push(startNode);
    const statements = this.#statements;
    let previousNode: NodeModel = this.startNode;
    for (let i = 0; i < statements.length; i++) {
      const builder = this.#builder.statementFactory.createBuilder(
        statements[i],
      );
      if (builder) {
        builder.build();
      }
      if (builder?.startNode) {
        if (type === "if" || i === 0) {
          this.#builder.edges.push({
            source: previousNode.id,
            target: builder.startNode.id,
            label: this.branchLabel,
          });
        } else {
          this.#builder.edges.push({
            source: previousNode.id,
            target: builder.startNode.id,
          });
        }
      }

      if (builder?.endNode) {
        previousNode = builder.endNode;
      }

      if (i === statements.length - 1 && builder?.endNode) {
        this.endNode = builder.endNode;
      }
    }
  }
}

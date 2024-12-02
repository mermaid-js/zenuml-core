import { Edge } from "./Edge";
import { BaseNode } from "./Nodes";

export type NodeType = "message" | "ifelse" | "endif";

export interface JSONable {
  toJSON(): Record<string, any>;
}

export interface Shape extends JSONable {
  addToSwimLane(rank?: number): void;
}

export type Tile = { nodes: BaseNode[]; edges: Edge[] };

export interface IStatement {
  setInboundNode(node: BaseNode): void;
  getInboundNode(): BaseNode | null;
  setOutboundNode(node: BaseNode): void;
  getOutboundNode(): BaseNode | null;
  getParent(): IBlockStatement | null;
  getTile(node?: BaseNode | null): Tile;
}

export interface IBlockStatement extends IStatement {
  createBlock(node?: BaseNode | null): Tile;
  appendChild(statement: IStatement): void;
  setFinished(): void;
  isFinished(): boolean;
}

export function isBlockStatement(
  statement: IStatement,
): statement is IBlockStatement {
  return "createBlock" in statement;
}

export type SwimLaneId = string;

export interface NodeModel {
  id: string;
  name: string;
  type: NodeType;
  rank: number;
  swimLane: SwimLaneId;
}

export interface EdgeModel {
  id: string;
  source: string;
  target: string;
}

export interface SwimLaneDiagramModel {
  name: string;
  swimLanes: SwimLaneId[];
  maxRank: number;
  nodes: NodeModel[];
  edges: EdgeModel[];
}

export interface NodePositionModel {
  id: string;
  rect: DOMRect;
  rank: number;
  swimLane: string;
}

export interface ConnectionModel {
  id: string;
  source: NodePositionModel;
  target: NodePositionModel;
}

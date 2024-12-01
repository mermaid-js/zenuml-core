import { BaseNode } from "./Nodes";
import { SwimLane } from "./SwimLane";

export type NodeType = "message" | "ifelse" | "endif";

export interface JSONable {
  toJSON(): Record<string, any>;
}

export interface Shape extends JSONable {
  addToSwimLane(swimLane: SwimLane, rank?: number): void;
}

export interface IStatement {
  addInboundNode(node: BaseNode): void;
  getInboundNode(): BaseNode | null;
  setOutboundNode(node: BaseNode): void;
  getOutboundNode(): BaseNode | null;
  setNext(statement: IStatement): void;
  getNext(): IStatement | null;
  getParent(): IStatement | null;
  createBlock(): void;
}

export interface IBlockStatement extends IStatement {
  appendChild(statement: IStatement): void;
  setFinished(): void;
  isFinished(): boolean;
}

export function isBlockStatement(
  statement: IStatement,
): statement is IBlockStatement {
  return statement.createBlock !== undefined;
}

export interface NodeModel {
  id: string;
  name: string;
  rank: number;
  swimLane: string;
}

export interface EdgeModel {
  id: string;
  source: string;
  target: string;
}

export interface SwimLaneModel {
  name: string;
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

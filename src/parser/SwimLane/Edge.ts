import { BaseNode } from "./Nodes";
import { EdgeType, JSONable } from "./types";

export class Edge implements JSONable {
  id: string;
  source: BaseNode;
  target: BaseNode;
  type: EdgeType;

  constructor(source: BaseNode, target: BaseNode, type?: EdgeType) {
    this.id = `${source?.id}-${target?.id}`;
    this.source = source;
    this.target = target;
    this.type = type ?? "normal";
  }

  toJSON() {
    return {
      id: this.id,
      source: this.source?.id,
      target: this.target?.id,
      type: this.type,
    };
  }
}

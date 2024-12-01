import { BaseNode } from "./Nodes";
import { JSONable } from "./types";

export class Edge implements JSONable {
  id: string;
  source: BaseNode;
  target: BaseNode;

  constructor(source: BaseNode, target: BaseNode) {
    this.id = `${source.id}-${target.id}`;
    this.source = source;
    this.target = target;
  }

  toJSON() {
    return {
      id: this.id,
      source: this.source.id,
      target: this.target.id,
    };
  }
}

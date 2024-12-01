import { BaseNode } from "./Node";
import { JSONable } from "./types";

export class Edge implements JSONable {
  source: BaseNode;
  target: BaseNode;

  constructor(source: BaseNode, target: BaseNode) {
    this.source = source;
    this.target = target;
  }

  toJSON() {
    return {
      id: `${this.source.id}-${this.target.id}`,
      source: this.source.id,
      target: this.target.id,
    };
  }
}

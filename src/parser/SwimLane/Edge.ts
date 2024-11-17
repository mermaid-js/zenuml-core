import { Node } from "./Node";
import { Shape } from "./types";

export class Edge implements Shape {
  source: Node;
  target: Node;

  constructor(source: Node, target: Node) {
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

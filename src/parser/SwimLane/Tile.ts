import { Shape } from "./types";

export class Tile implements Shape {
  nodes: Node[] = [];

  toJSON() {
    return {
      nodes: this.nodes,
    };
  }
}

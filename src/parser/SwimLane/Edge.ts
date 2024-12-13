import { BaseNode } from "./Nodes";
import { EdgeType, JSONable } from "./types";

export class Edge implements JSONable {
  id: string;
  source: BaseNode;
  target: BaseNode;
  type: EdgeType;

  constructor(source: BaseNode, target: BaseNode, type?: EdgeType) {
    this.id = `${source.id}->${target.id}`;
    this.source = source;
    this.target = target;
    this.type = type ?? "normal";
  }

  toJSON() {
    return {
      id: this.id,
      source: this.source.id,
      target: this.target.id,
      type: this.type,
    };
  }
}

export class LabeledEdge extends Edge {
  label: string;

  constructor(source: BaseNode, target: BaseNode, label: string) {
    super(source, target);
    this.label = label;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      label: this.label,
    };
  }
}

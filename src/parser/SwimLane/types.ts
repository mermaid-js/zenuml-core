export interface Shape {
  toJSON(): any;
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

import { SwimLane } from "./SwimLane";
import { Shape } from "./types";

export class Node implements Shape {
  id: string;
  name: string;
  swimLane: SwimLane;
  rank: number = -1;
  prevNode: Node | null = null;
  nextNode: Node | null = null;

  constructor(name: string, swimLane: SwimLane, rank?: number) {
    this.id = `${swimLane.name}-${name}`;
    this.name = name;
    this.swimLane = swimLane;
    if (rank) {
      if (rank > swimLane.maxRank) {
        this.rank = rank;
      } else {
        this.rank = swimLane.maxRank + 1;
      }
    } else {
      this.rank = swimLane.maxRank + 1;
      console.log({
        id: this.id,
        rank: this.rank,
      });
    }
    swimLane.addNode(this);
  }

  setRank(rank: number) {
    this.rank = rank + 1;
  }

  setPrevNode(node: Node) {
    this.prevNode = node;
  }

  getSwimLane() {
    return this.swimLane;
  }

  getRank() {
    return this.rank;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      rank: this.rank,
      swimLane: this.swimLane.name,
    };
  }
}

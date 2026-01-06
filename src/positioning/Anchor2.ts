import {
  LIFELINE_WIDTH,
  OCCURRENCE_BAR_SIDE_WIDTH,
} from "@/positioning/Constants";

export default class Anchor2 {
  constructor(
    private position: number,
    private layers: number,
  ) {}

  /**
   * centerToEdge is used for translateX calculations.
   */
  centerToEdge(other: Anchor2): number {
    return other.rightEdgeOfRightWall() - this.centerOfRightWall();
  }

  centerToCenter(other: Anchor2): number {
    return other.centerOfRightWall() - this.centerOfRightWall();
  }
  /**
   * edgeOffset is used for interactionWidth calculations.
   */
  edgeOffset(other: Anchor2): number {
    const isRightToLeft = other.position < this.position;

    let leftAnchor: Anchor2;
    let rightAnchor: Anchor2;
    if (isRightToLeft) {
      leftAnchor = other;
      rightAnchor = this;
    } else {
      leftAnchor = this;
      rightAnchor = other;
    }

    const rightEdgeOfLeftAnchor = leftAnchor.rightEdgeOfRightWall();
    const leftEdgeOfRightAnchor = rightAnchor.leftEdgeOfRightWall();
    const distance =
      leftEdgeOfRightAnchor - rightEdgeOfLeftAnchor - LIFELINE_WIDTH;
    return isRightToLeft ? distance * -1 : distance;
  }

  centerOfRightWall(): number {
    return this.layers <= 1
      ? this.position
      : this.position + OCCURRENCE_BAR_SIDE_WIDTH * (this.layers - 1);
  }

  rightEdgeOfRightWall() {
    return this.position + OCCURRENCE_BAR_SIDE_WIDTH * this.layers;
  }

  leftEdgeOfRightWall() {
    return this.layers === 0
      ? this.position
      : this.centerOfRightWall() - OCCURRENCE_BAR_SIDE_WIDTH;
  }
}

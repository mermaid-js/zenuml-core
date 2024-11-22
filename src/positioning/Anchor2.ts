import {
  OCCURRENCE_BAR_SIDE_WIDTH,
  LIFELINE_WIDTH,
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
    // Step 1: Get center of this anchor
    const thisCenter = this.centerOfRightWall();

    // Step 2: Get edge of other anchor based on direction
    const otherRightEdge = other.rightEdgeOfRightWall();
    const isSamePosition = other.position === this.position;
    if (isSamePosition) {
      return otherRightEdge - thisCenter;
    }
    return otherRightEdge - thisCenter;
  }

  /**
   * edgeOffset is used for interactionWidth calculations.
   */
  edgeOffset(other: Anchor2): number {
    const samePosition = other.position === this.position;
    if (samePosition) {
      return 0; // TODO: Check if this is correct
    }
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

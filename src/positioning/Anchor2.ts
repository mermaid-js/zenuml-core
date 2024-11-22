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

    const rightEdgeOfLeftAnchor = leftAnchor.position + 7 * leftAnchor.layers;
    const leftEdgeOfRightAnchor =
      rightAnchor.layers === 0
        ? rightAnchor.position
        : rightAnchor.position - 7 + 7 * (rightAnchor.layers - 1);
    const distance = leftEdgeOfRightAnchor - rightEdgeOfLeftAnchor - 1;
    return isRightToLeft ? distance * -1 : distance;
  }

  centerOfRightWall(): number {
    return this.layers <= 1
      ? this.position
      : this.position + 7 * (this.layers - 1);
  }

  rightEdgeOfRightWall() {
    return this.position + 7 * this.layers;
  }

  leftEdgeOfRightWall() {
    return this.layers === 0 ? this.position : this.centerOfRightWall() - 7;
  }
}

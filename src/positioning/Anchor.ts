export default class Anchor {
  constructor(
    private position: number,
    private offset: number,
  ) {}

  /**
   * Calculates the offset needed to align an edge with another anchor.
   * The distance maintains its sign to preserve directional information.
   */
  calculateEdgeOffset(otherAnchor: Anchor): number {
    const distance = otherAnchor.position - this.position;
    return distance - this.offset + otherAnchor.offset;
  }
}

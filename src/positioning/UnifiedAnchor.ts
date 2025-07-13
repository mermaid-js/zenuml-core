/**
 * 统一的Anchor计算类
 * 基于新的几何数据接口，提供更清晰的锚点计算功能
 */

import { ParticipantGeometry, AnchorGeometry } from "./GeometryTypes";
import Anchor2 from "./Anchor2";

/**
 * 统一的锚点计算器
 * 将ParticipantGeometry转换为精确的锚点计算，封装Anchor2的复杂性
 */
export class UnifiedAnchor {
  private readonly geometry: ParticipantGeometry;
  private readonly anchor2: Anchor2;

  constructor(geometry: ParticipantGeometry) {
    this.geometry = geometry;
    this.anchor2 = new Anchor2(geometry.centerPosition, geometry.activationLayers);
  }

  /**
   * 获取锚点几何数据
   */
  getAnchorGeometry(): AnchorGeometry {
    return {
      position: this.geometry.centerPosition,
      layers: this.geometry.activationLayers,
    };
  }

  /**
   * 计算到另一个锚点的中心距离
   * @param other 另一个锚点
   * @returns 中心到中心的距离
   */
  centerToCenter(other: UnifiedAnchor): number {
    return this.anchor2.centerToCenter(other.anchor2);
  }

  /**
   * 计算到另一个锚点边缘的距离（用于translateX）
   * @param other 另一个锚点
   * @returns 中心到边缘的距离
   */
  centerToEdge(other: UnifiedAnchor): number {
    return this.anchor2.centerToEdge(other.anchor2);
  }

  /**
   * 计算边缘偏移量（用于交互宽度计算）
   * @param other 另一个锚点
   * @returns 边缘偏移量
   */
  edgeOffset(other: UnifiedAnchor): number {
    return this.anchor2.edgeOffset(other.anchor2);
  }

  /**
   * 获取右墙中心位置
   */
  centerOfRightWall(): number {
    return this.anchor2.centerOfRightWall();
  }

  /**
   * 获取右墙右边缘位置
   */
  rightEdgeOfRightWall(): number {
    return this.anchor2.rightEdgeOfRightWall();
  }

  /**
   * 获取右墙左边缘位置
   */
  leftEdgeOfRightWall(): number {
    return this.anchor2.leftEdgeOfRightWall();
  }

  /**
   * 获取参与者名称
   */
  getParticipantName(): string {
    return this.geometry.name;
  }

  /**
   * 获取激活层数
   */
  getActivationLayers(): number {
    return this.geometry.activationLayers;
  }

  /**
   * 获取中心位置
   */
  getCenterPosition(): number {
    return this.geometry.centerPosition;
  }

  /**
   * 静态工厂方法：从参与者几何数据创建锚点
   * @param geometry 参与者几何数据
   * @returns 统一锚点实例
   */
  static fromParticipantGeometry(geometry: ParticipantGeometry): UnifiedAnchor {
    return new UnifiedAnchor(geometry);
  }

  /**
   * 静态工厂方法：从多个参与者几何数据创建锚点数组
   * @param geometries 参与者几何数据数组
   * @returns 统一锚点实例数组
   */
  static fromParticipantGeometries(geometries: ParticipantGeometry[]): UnifiedAnchor[] {
    return geometries.map(geometry => new UnifiedAnchor(geometry));
  }

  /**
   * 判断方向：是否从右到左
   * @param source 源锚点
   * @param target 目标锚点
   * @returns 是否从右到左
   */
  static isRightToLeft(source: UnifiedAnchor, target: UnifiedAnchor): boolean {
    return target.getCenterPosition() < source.getCenterPosition();
  }

  /**
   * 计算两个锚点之间的距离
   * @param from 起始锚点
   * @param to 目标锚点
   * @returns 距离
   */
  static distance(from: UnifiedAnchor, to: UnifiedAnchor): number {
    return to.getCenterPosition() - from.getCenterPosition();
  }
}
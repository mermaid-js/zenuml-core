/**
 * ParticipantGeometry提取器
 * 从现有的Coordinates对象提取纯几何数据，简化接口访问
 */

import { ParticipantGeometry } from "./GeometryTypes";
import { Coordinates } from "./Coordinates";
import { depthOnParticipant } from "@/components/DiagramFrame/SeqDiagram/MessageLayer/Block/Statement/utils";

/**
 * 从Coordinates对象提取参与者几何数据的工具类
 * 这是连接现有复杂系统和新数学模型的桥梁
 */
export class ParticipantGeometryExtractor {
  private readonly coordinates: Coordinates;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
  }

  /**
   * 提取单个参与者的几何数据
   * @param participantName 参与者名称
   * @param context 上下文对象（用于计算激活层）
   * @returns 参与者几何数据
   */
  extractParticipant(
    participantName: string, 
    context?: any
  ): ParticipantGeometry {
    const centerPosition = this.coordinates.getPosition(participantName);
    const halfWidth = this.coordinates.half(participantName);
    const activationLayers = context 
      ? depthOnParticipant(context, participantName)
      : 0;

    return {
      name: participantName,
      centerPosition,
      halfWidth,
      activationLayers,
    };
  }

  /**
   * 提取多个参与者的几何数据
   * @param participantNames 参与者名称列表
   * @param context 上下文对象（用于计算激活层）
   * @returns 参与者几何数据数组
   */
  extractParticipants(
    participantNames: string[], 
    context?: any
  ): ParticipantGeometry[] {
    return participantNames.map(name => 
      this.extractParticipant(name, context)
    );
  }

  /**
   * 提取所有有序参与者的几何数据
   * @param context 上下文对象（用于计算激活层）
   * @returns 所有参与者几何数据数组
   */
  extractAllParticipants(context?: any): ParticipantGeometry[] {
    const participantNames = this.coordinates.orderedParticipantNames();
    return this.extractParticipants(participantNames, context);
  }

  /**
   * 根据参与者名称查找几何数据
   * @param participantName 参与者名称
   * @param participants 几何数据数组
   * @returns 找到的几何数据或undefined
   */
  static findParticipant(
    participantName: string, 
    participants: ParticipantGeometry[]
  ): ParticipantGeometry | undefined {
    return participants.find(p => p.name === participantName);
  }

  /**
   * 获取最左边的参与者
   * @param participants 几何数据数组
   * @returns 最左边的参与者几何数据
   */
  static getLeftmostParticipant(
    participants: ParticipantGeometry[]
  ): ParticipantGeometry | undefined {
    return participants.reduce((leftmost, current) => 
      current.centerPosition < leftmost.centerPosition ? current : leftmost
    );
  }

  /**
   * 获取最右边的参与者
   * @param participants 几何数据数组
   * @returns 最右边的参与者几何数据
   */
  static getRightmostParticipant(
    participants: ParticipantGeometry[]
  ): ParticipantGeometry | undefined {
    return participants.reduce((rightmost, current) => 
      current.centerPosition > rightmost.centerPosition ? current : rightmost
    );
  }

  /**
   * 检查参与者是否存在
   * @param participantName 参与者名称
   * @returns 是否存在
   */
  hasParticipant(participantName: string): boolean {
    const participantNames = this.coordinates.orderedParticipantNames();
    return participantNames.includes(participantName);
  }
}